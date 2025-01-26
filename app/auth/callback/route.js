import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  // Get the site URL from environment variable or request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')
  const requestUrl = new URL(request.url)
  
  // Check for error parameters from OAuth provider
  const error = requestUrl.searchParams.get('error')
  if (error) {
    return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
  }

  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
      }

      return NextResponse.redirect(`${siteUrl}${next}`)
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
}