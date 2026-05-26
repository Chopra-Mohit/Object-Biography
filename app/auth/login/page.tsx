'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type MagicStatus = 'idle' | 'sending' | 'sent' | 'error'
type PwStatus    = 'idle' | 'signing_in' | 'error'

export default function LoginPage() {
  const router = useRouter()

  // Magic link
  const [email,    setEmail]    = useState('')
  const [mlStatus, setMlStatus] = useState<MagicStatus>('idle')
  const [mlError,  setMlError]  = useState('')

  // Password
  const [showPw,    setShowPw]    = useState(false)
  const [pwEmail,   setPwEmail]   = useState('')
  const [pwPass,    setPwPass]    = useState('')
  const [pwStatus,  setPwStatus]  = useState<PwStatus>('idle')
  const [pwError,   setPwError]   = useState('')

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setMlStatus('sending')
    setMlError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })

    if (error) {
      setMlError(
        error.status === 429 || error.message.toLowerCase().includes('rate limit')
          ? 'Too many attempts. Wait a few minutes and try again.'
          : error.message
      )
      setMlStatus('error')
      return
    }
    setMlStatus('sent')
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!pwEmail.trim() || !pwPass) return
    setPwStatus('signing_in')
    setPwError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: pwEmail.trim(),
      password: pwPass,
    })

    if (error) {
      setPwError('Incorrect email or password.')
      setPwStatus('error')
      return
    }

    router.push('/')
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

        {/* ── Password sign-in (primary for returning users) ── */}
        <span style={{
          display: 'block',
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
          marginBottom: '2rem',
        }}>
          Sign in
        </span>

        <form onSubmit={handlePasswordSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div className="ob-input-row">
            <input
              type="email"
              placeholder="your@email.com"
              value={pwEmail}
              onChange={e => setPwEmail(e.target.value)}
              required
              autoFocus
              disabled={pwStatus === 'signing_in'}
            />
          </div>
          <div className="ob-input-row">
            <input
              type="password"
              placeholder="Password"
              value={pwPass}
              onChange={e => setPwPass(e.target.value)}
              required
              disabled={pwStatus === 'signing_in'}
            />
            <button type="submit" className="ob-button" disabled={pwStatus === 'signing_in'}>
              {pwStatus === 'signing_in' ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
          {pwStatus === 'error' && (
            <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: '11px', color: 'var(--ob-red)' }}>
              {pwError}
            </p>
          )}
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', margin: '2rem 0' }} />

        {/* ── Magic link (first-time sign-in or fallback) ── */}
        <button
          onClick={() => setShowPw(v => !v)}
          style={{
            background: 'none', border: 'none',
            fontFamily: 'var(--ob-font-mono)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ob-fg-faint)',
            cursor: 'pointer',
            padding: 0,
            marginBottom: showPw ? '1.5rem' : 0,
          }}
        >
          {showPw ? '↑ Hide' : 'Sign in with a magic link →'}
        </button>

        {showPw && (
          mlStatus === 'sent' ? (
            <div>
              <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: '13px', color: 'var(--ob-fg)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                Link sent to <strong>{email}</strong>.
              </p>
              <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: '11px', color: 'var(--ob-fg-dim)', lineHeight: 1.7 }}>
                Check your inbox — expires in 60 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink}>
              <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: '12px', color: 'var(--ob-fg-dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
                First time here, or forgot your password? We'll email you a one-click link.
              </p>
              <div className="ob-input-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={mlStatus === 'sending'}
                />
                <button type="submit" className="ob-button" disabled={mlStatus === 'sending'}>
                  {mlStatus === 'sending' ? 'Sending…' : 'Send link'}
                </button>
              </div>
              {mlStatus === 'error' && (
                <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: '11px', color: 'var(--ob-fg-dim)', marginTop: '0.75rem' }}>
                  {mlError}
                </p>
              )}
            </form>
          )
        )}

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
