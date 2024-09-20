'use server'
import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData) {
  const supabase = createClient()
  await supabase.auth.resetPasswordForEmail(formData.get('email'), {
    redirectTo: 'http://localhost:3000/login/reset/new'
  })
}
