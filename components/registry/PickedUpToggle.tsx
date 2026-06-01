'use client'

import { useState } from 'react'

interface Props {
  registrationId: string
  initialPickedUp: boolean
  initialPickedUpAt: string | null
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PickedUpToggle({ registrationId, initialPickedUp, initialPickedUpAt }: Props) {
  const [pickedUp, setPickedUp]   = useState(initialPickedUp)
  const [pickedUpAt, setPickedUpAt] = useState<string | null>(initialPickedUpAt)
  const [saving, setSaving]       = useState(false)

  async function toggle() {
    setSaving(true)
    const next = !pickedUp
    try {
      const res = await fetch(`/api/registry/${registrationId}/pickup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picked_up: next }),
      })
      if (res.ok) {
        const json = await res.json()
        setPickedUp(next)
        setPickedUpAt(json.picked_up_at ?? null)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      marginTop: 'var(--ob-space-10)',
      border: '1px solid var(--ob-rule)',
    }}>
      {/* Status bar */}
      <div style={{
        padding: 'var(--ob-space-4) var(--ob-space-5)',
        borderBottom: '1px solid var(--ob-rule)',
        display: 'flex', alignItems: 'center', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-3)' }}>
          {/* Status dot */}
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: pickedUp ? '#9C9990' : '#4CAF50',
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: pickedUp ? 'var(--ob-fg-dim)' : '#4CAF50' }}>
            {pickedUp ? 'Picked up' : 'Still available'}
          </span>
          {pickedUp && pickedUpAt && (
            <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)' }}>
              — {formatDate(pickedUpAt)}
            </span>
          )}
        </div>

        {/* Toggle button */}
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          style={{
            ...mono, fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            background: 'transparent',
            border: '1px solid var(--ob-rule)',
            color: saving ? 'var(--ob-fg-faint)' : 'var(--ob-fg-dim)',
            padding: '4px 12px',
            cursor: saving ? 'default' : 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.color = 'var(--ob-fg)'; e.currentTarget.style.borderColor = 'var(--ob-fg)' } }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--ob-fg-dim)'; e.currentTarget.style.borderColor = 'var(--ob-rule)' }}
        >
          {saving ? 'Saving…' : pickedUp ? "It's still here" : 'I picked this up'}
        </button>
      </div>

      {/* Helper text */}
      <div style={{ padding: 'var(--ob-space-3) var(--ob-space-5)' }}>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', lineHeight: 'var(--ob-lh-relaxed)' }}>
          {pickedUp
            ? 'This item has been reported as picked up. Mark it as available again if it was returned or the report was wrong.'
            : 'If you took this item, mark it as picked up so others know it\'s gone.'}
        </span>
      </div>
    </div>
  )
}
