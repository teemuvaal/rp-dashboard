import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Check for error parameters from OAuth provider
  const error = searchParams.get('error')
  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    } catch {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}