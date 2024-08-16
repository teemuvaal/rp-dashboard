'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData) {
  const supabase = createClient()
  await supabase.auth.resetPasswordForEmail(formData.get('email'), {
  })
  redirect('/login/reset')
}
