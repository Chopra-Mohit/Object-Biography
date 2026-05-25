import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/register'

  // Next.js 15+ — cookies() is async
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.set({ name, value: '', ...options }),
      },
    }
  )

  // PKCE flow — code exchange (used by newer Supabase clients)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[Object Biography] PKCE exchange error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Token hash flow — magic link emails (OTP-based)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'magiclink' | 'email',
    })
    if (error) {
      console.error('[Object Biography] OTP verify error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  console.error('[Object Biography] Auth callback: missing code and token_hash')
  return NextResponse.redirect(`${origin}/auth/login?error=missing_params`)
}
