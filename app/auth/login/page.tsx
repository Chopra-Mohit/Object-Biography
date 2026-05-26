'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setErrorMsg('')

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/api/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      const isRateLimit = error.message.toLowerCase().includes('rate limit') || error.status === 429
      setErrorMsg(
        isRateLimit
          ? 'Too many attempts. Wait a few minutes and try again.'
          : error.message
      )
      setStatus('error')
      return
    }
    setStatus('sent')
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

        {status === 'sent' ? (
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
              Check your inbox and click the link — it expires in 60 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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
              Enter your email — we'll send a one-click sign-in link.
              No password, no account to manage.
            </p>

            <div className="ob-input-row" style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={status === 'sending'}
              />
              <button type="submit" className="ob-button" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send link'}
              </button>
            </div>

            {status === 'error' && (
              <p style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: '11px',
                color: 'var(--ob-fg-dim)',
                marginTop: '0.75rem',
              }}>
                {errorMsg || 'Something went wrong. Try again.'}
              </p>
            )}
          </form>
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
