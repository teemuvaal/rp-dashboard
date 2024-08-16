'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function updatePassword(formData) {
  const supabase = createClient()
  await supabase.auth.updateUser({ password: formData.get('password') })
  redirect('/login')
}