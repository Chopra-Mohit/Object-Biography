'use client'

import { useState } from 'react'

type Step = 'idle' | 'confirm' | 'deleting'

export default function DeleteAccountButton() {
  const [step,  setStep]  = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setStep('deleting')
    setError(null)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Deletion failed')
      }
      // Account is gone — redirect to homepage
      window.location.href = '/?deleted=1'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deletion failed. Please try again.')
      setStep('confirm')
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--ob-red)',
          background: 'none',
          border: '1px solid var(--ob-red)',
          padding: '8px 16px',
          cursor: 'pointer',
          opacity: 0.7,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
      >
        Delete account
      </button>
    )
  }

  return (
    <div style={{
      border: '1px solid var(--ob-red)',
      padding: 'var(--ob-space-5) var(--ob-space-6)',
      maxWidth: 480,
    }}>
      <p style={{
        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
        color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-relaxed)',
        margin: '0 0 var(--ob-space-5) 0',
      }}>
        This will permanently delete your account, all registered objects, biographies, and certificates.
        This cannot be undone.
      </p>

      {error && (
        <p style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          color: 'var(--ob-red)', margin: '0 0 var(--ob-space-4) 0',
        }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--ob-space-4)', alignItems: 'center' }}>
        <button
          onClick={handleDelete}
          disabled={step === 'deleting'}
          style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)',
            textTransform: 'uppercase',
            color: '#1B1B17',
            background: 'var(--ob-red)',
            border: '1px solid var(--ob-red)',
            padding: '8px 16px',
            cursor: step === 'deleting' ? 'wait' : 'pointer',
            opacity: step === 'deleting' ? 0.6 : 1,
          }}
        >
          {step === 'deleting' ? 'Deleting...' : 'I understand — delete everything'}
        </button>

        {step !== 'deleting' && (
          <button
            onClick={() => { setStep('idle'); setError(null) }}
            style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-dim)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
