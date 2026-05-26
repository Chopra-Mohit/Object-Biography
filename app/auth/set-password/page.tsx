'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'saving' | 'skipping' | 'done' | 'error'

function SetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/register'

  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [status, setStatus]         = useState<Status>('idle')
  const [errorMsg, setErrorMsg]     = useState('')

  const busy = status === 'saving' || status === 'skipping'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setErrorMsg('Passwords don\'t match.')
      return
    }

    setStatus('saving')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password,
      data: { has_password: true },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }

    setStatus('done')
    router.push(next)
    router.refresh()
  }

  async function handleSkip() {
    setStatus('skipping')
    const supabase = createClient()
    // Mark skip so they aren't prompted again on future magic link sign-ins
    await supabase.auth.updateUser({ data: { skip_password_setup: true } })
    router.push(next)
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

        <span style={{
          display: 'block',
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
          marginBottom: '1.5rem',
        }}>
          You're in
        </span>

        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '14px',
          color: 'var(--ob-fg)',
          lineHeight: 1.7,
          marginBottom: '0.5rem',
        }}>
          Create a password for next time.
        </p>
        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '11px',
          color: 'var(--ob-fg-dim)',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}>
          You won't need to wait for an email link every time you sign in.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="ob-input-row">
            <input
              type="password"
              placeholder="New password (min. 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              disabled={busy}
              minLength={8}
            />
          </div>

          <div className="ob-input-row">
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          {errorMsg && (
            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '11px',
              color: 'var(--ob-red)',
              marginTop: '0.25rem',
            }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="ob-button"
            disabled={busy}
            style={{ marginTop: '0.5rem', opacity: busy ? 0.5 : 1 }}
          >
            {status === 'saving' ? 'Saving…' : 'Save password'}
          </button>
        </form>

        <div style={{ marginTop: '2rem' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: '1.5rem' }} />
          <button
            onClick={handleSkip}
            disabled={busy}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--ob-font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-faint)',
              cursor: busy ? 'not-allowed' : 'pointer',
              padding: 0,
              opacity: busy ? 0.5 : 1,
            }}
          >
            {status === 'skipping' ? 'Skipping…' : 'Skip — I\'ll keep using magic links →'}
          </button>
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

// useSearchParams requires Suspense boundary in Next.js 15
export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  )
}
