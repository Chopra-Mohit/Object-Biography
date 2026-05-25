'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type MagicLinkStatus = 'idle' | 'sending' | 'sent' | 'error'
type PasswordStatus = 'idle' | 'signing_in' | 'error'

export default function LoginPage() {
  const router = useRouter()

  // Magic link state
  const [email, setEmail] = useState('')
  const [mlStatus, setMlStatus] = useState<MagicLinkStatus>('idle')
  const [mlError, setMlError] = useState('')

  // Password state
  const [showPassword, setShowPassword] = useState(false)
  const [pwEmail, setPwEmail] = useState('')
  const [pwPassword, setPwPassword] = useState('')
  const [pwStatus, setPwStatus] = useState<PasswordStatus>('idle')
  const [pwError, setPwError] = useState('')

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setMlStatus('sending')
    setMlError('')

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/api/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      const isRateLimit = error.message.toLowerCase().includes('rate limit') || error.status === 429
      setMlError(
        isRateLimit
          ? 'Too many sign-in attempts. Wait a few minutes and try again.'
          : error.message
      )
      setMlStatus('error')
      return
    }
    setMlStatus('sent')
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!pwEmail.trim() || !pwPassword) return
    setPwStatus('signing_in')
    setPwError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: pwEmail.trim(),
      password: pwPassword,
    })

    if (error) {
      setPwError(error.message)
      setPwStatus('error')
      return
    }

    router.push('/register')
    router.refresh()
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--ob-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <a href="/" style={{
          display: 'block',
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ob-fg)',
          textDecoration: 'none',
          marginBottom: '3rem',
        }}>
          Object Biography
        </a>

        <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: '3rem' }} />

        {/* ── Magic link form ── */}
        {mlStatus === 'sent' ? (
          <div>
            <span style={{
              display: 'block',
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-dim)',
              marginBottom: '1.5rem',
            }}>
              Link dispatched
            </span>
            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '13px',
              color: 'var(--ob-fg)',
              lineHeight: 1.7,
              marginBottom: '1rem',
            }}>
              A sign-in link has been sent to <strong>{email}</strong>.
            </p>
            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '11px',
              color: 'var(--ob-fg-dim)',
              lineHeight: 1.7,
            }}>
              Check your inbox. The link expires in 60 minutes.
              No password. No account to manage.
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-dim)',
              marginBottom: '2.5rem',
            }}>
              Sign in to Object Biography
            </span>

            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '13px',
              color: 'var(--ob-fg-dim)',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}>
              Enter your email. We'll send a sign-in link.
              No password required.
            </p>

            <div className="ob-input-row" style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={mlStatus === 'sending'}
              />
              <button type="submit" className="ob-button" disabled={mlStatus === 'sending'}>
                {mlStatus === 'sending' ? 'Sending…' : 'Send link'}
              </button>
            </div>

            {mlStatus === 'error' && (
              <p style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: '11px',
                color: 'var(--ob-fg-dim)',
                marginTop: '0.75rem',
              }}>
                {mlError || 'Something went wrong. Try again.'}
              </p>
            )}
          </form>
        )}

        {/* ── Password sign-in (secondary) ── */}
        <div style={{ marginTop: '3rem' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: '1.5rem' }} />

          <button
            onClick={() => setShowPassword(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-faint)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {showPassword ? '↑ Hide' : 'Sign in with password →'}
          </button>

          {showPassword && (
            <form onSubmit={handlePasswordSignIn} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="ob-input-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={pwEmail}
                  onChange={e => setPwEmail(e.target.value)}
                  required
                  disabled={pwStatus === 'signing_in'}
                />
              </div>
              <div className="ob-input-row">
                <input
                  type="password"
                  placeholder="Password"
                  value={pwPassword}
                  onChange={e => setPwPassword(e.target.value)}
                  required
                  disabled={pwStatus === 'signing_in'}
                />
                <button type="submit" className="ob-button" disabled={pwStatus === 'signing_in'}>
                  {pwStatus === 'signing_in' ? 'Signing in…' : 'Sign in'}
                </button>
              </div>

              {pwStatus === 'error' && (
                <p style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: '11px',
                  color: 'var(--ob-fg-dim)',
                }}>
                  {pwError || 'Invalid email or password.'}
                </p>
              )}
            </form>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginTop: '3rem' }} />
        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '10px',
          color: 'var(--ob-fg-faint)',
          marginTop: '1.5rem',
          letterSpacing: '0.05em',
        }}>
          Object Biography Registry · Barcelona, 2026
        </p>

      </div>
    </main>
  )
}
