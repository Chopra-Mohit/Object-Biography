import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) => cookieStore.set({ name, value: '', ...options }),
      },
    }
  )

  let authed = false

  // PKCE flow — code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[Object Biography] PKCE exchange error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }
    authed = true
  }

  // Token hash flow — magic link / OTP
  if (!authed && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'magiclink' | 'email',
    })
    if (error) {
      console.error('[Object Biography] OTP verify error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }
    authed = true
  }

  if (!authed) {
    console.error('[Object Biography] Auth callback: missing code and token_hash')
    return NextResponse.redirect(`${origin}/auth/login?error=missing_params`)
  }

  // Check whether this user has set a password or explicitly skipped setup.
  // If neither, send them to the set-password page before the intended destination.
  const { data: { user } } = await supabase.auth.getUser()
  const meta = user?.user_metadata ?? {}
  const needsPasswordSetup = !meta.has_password && !meta.skip_password_setup

  if (needsPasswordSetup) {
    const dest = encodeURIComponent(next)
    return NextResponse.redirect(`${origin}/auth/set-password?next=${dest}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
