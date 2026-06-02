'use client'

import { useState } from 'react'

interface Props {
  registrationId: string
  userEmail: string | null          // null = not signed in
  initialPickedUp: boolean
  initialPickedUpAt: string | null
  initialPickedUpBy: string | null  // display name stored in DB
  locationName: string | null       // "from X" context when picked up
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

function emailPrefix(email: string) {
  return email.split('@')[0]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PickedUpToggle({
  registrationId,
  userEmail,
  initialPickedUp,
  initialPickedUpAt,
  initialPickedUpBy,
  locationName,
}: Props) {
  const [pickedUp,   setPickedUp]   = useState(initialPickedUp)
  const [pickedUpAt, setPickedUpAt] = useState<string | null>(initialPickedUpAt)
  const [pickedUpBy, setPickedUpBy] = useState<string | null>(initialPickedUpBy)
  const [saving,     setSaving]     = useState(false)

  const isSignedIn = userEmail !== null

  async function toggle() {
    if (!isSignedIn) return
    setSaving(true)
    const next = !pickedUp
    // Display name for the pickup: email prefix only
    const displayName = next ? emailPrefix(userEmail) : null
    try {
      const res = await fetch(`/api/registry/${registrationId}/pickup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picked_up: next, picked_up_by: displayName }),
      })
      if (res.ok) {
        const json = await res.json()
        setPickedUp(next)
        setPickedUpAt(json.picked_up_at ?? null)
        setPickedUpBy(json.picked_up_by ?? null)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginTop: 'var(--ob-space-10)', border: '1px solid var(--ob-rule)' }}>

      {/* Status bar */}
      <div style={{
        padding: 'var(--ob-space-4) var(--ob-space-5)',
        borderBottom: '1px solid var(--ob-rule)',
        display: 'flex', alignItems: 'center', gap: 'var(--ob-space-4)',
        flexWrap: 'wrap', justifyContent: 'space-between',
      }}>

        {/* Left: status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-3)', flexWrap: 'wrap' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: pickedUp ? 'var(--ob-fg-faint)' : '#4CAF50',
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: pickedUp ? 'var(--ob-fg-dim)' : '#4CAF50' }}>
            {pickedUp ? 'Picked up' : 'Still available'}
          </span>
          {pickedUp && pickedUpBy && (
            <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
              by <strong style={{ color: 'var(--ob-fg)', fontWeight: 400 }}>{pickedUpBy}</strong>
            </span>
          )}
          {pickedUp && pickedUpAt && (
            <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)' }}>
              · {formatDate(pickedUpAt)}
            </span>
          )}
          {pickedUp && locationName && (
            <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)' }}>
              · from <em style={{ fontStyle: 'normal', color: 'var(--ob-fg-dim)' }}>{locationName}</em>
            </span>
          )}
        </div>

        {/* Right: action */}
        {isSignedIn ? (
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
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.color = 'var(--ob-fg)'; e.currentTarget.style.borderColor = 'var(--ob-fg)' } }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ob-fg-dim)'; e.currentTarget.style.borderColor = 'var(--ob-rule)' }}
          >
            {saving ? 'Saving…' : pickedUp ? "It's still here" : 'I picked this up'}
          </button>
        ) : (
          <a
            href="/auth/login"
            style={{
              ...mono, fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
              color: 'var(--ob-fg-dim)', textDecoration: 'none',
              border: '1px solid var(--ob-rule)', padding: '4px 12px',
              whiteSpace: 'nowrap',
            }}
          >
            Sign in to claim pickup
          </a>
        )}
      </div>

      {/* Footer context */}
      <div style={{ padding: 'var(--ob-space-3) var(--ob-space-5)' }}>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', lineHeight: 'var(--ob-lh-relaxed)' }}>
          {!isSignedIn
            ? 'Only registered users can claim they picked something up — so the community knows who to contact.'
            : pickedUp
              ? 'Marked as picked up. If the item is still available, you can reverse this.'
              : 'If you took this, mark it so others stop looking for it.'}
        </span>
      </div>
    </div>
  )
}
