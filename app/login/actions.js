'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signInWithDiscord() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (!data?.url) {
      return { error: 'Failed to get authentication URL' }
    }

    return { url: data.url }
  } catch (error) {
    return { error: 'Failed to initialize Discord login' }
  }
}

export async function signup(formData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login/verify')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(formData) {
  const supabase = createClient()
  await supabase.auth.resetPasswordForEmail(formData.get('email'), {
    redirectTo: '/login/reset/new'
  })
}

export async function updatePassword(formData) {
  const supabase = createClient()
  
  const password = formData.get('password')
  const code = formData.get('code')

  if (!code) {
    return { error: 'Missing reset code' }
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: 'recovery'
    })

    if (error) {
      return { error: error.message }
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: password })

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}