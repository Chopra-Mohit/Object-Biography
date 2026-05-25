'use client'

import { useState } from 'react'

interface Props {
  registrationId: string
  recipientEmail: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function EmailBiographyButton({ registrationId, recipientEmail }: Props) {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSend() {
    if (status === 'sending' || status === 'sent') return
    setStatus('sending')
    try {
      const res = await fetch(`/api/biography/${registrationId}/email`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Send failed')
      }
      setStatus('sent')
      // Reset after 4 seconds so the button can be used again
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err) {
      console.error('[Object Biography] Email error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const label: Record<Status, string> = {
    idle:    `Email to ${recipientEmail.split('@')[0]}@… ↗`,
    sending: 'Sending…',
    sent:    'Sent ✓',
    error:   'Failed — retry?',
  }

  return (
    <button
      onClick={handleSend}
      disabled={status === 'sending'}
      title={`Send to ${recipientEmail}`}
      style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: status === 'sent'  ? '#4CAF50'
             : status === 'error' ? 'var(--ob-red)'
             : 'var(--ob-fg-dim)',
        background: 'none',
        border: '1px solid var(--ob-rule)',
        padding: '5px 12px',
        cursor: status === 'sending' ? 'wait'
              : status === 'sent'    ? 'default'
              : 'pointer',
        opacity: status === 'sending' ? 0.6 : 1,
        whiteSpace: 'nowrap',
        transition: 'border-color 0.15s, color 0.15s',
      }}
    >
      {label[status]}
    </button>
  )
}
