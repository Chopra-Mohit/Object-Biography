'use client'

import { useState } from 'react'
import { BARCELONA_ZONES, WEEKDAY_NAMES } from '@/lib/barcelona/zones'

interface Props {
  userEmail: string | null
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

export default function SubscribeBox({ userEmail }: Props) {
  const [email, setEmail] = useState(userEmail ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  function toggleZone(slug: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
    setState('idle')
  }

  async function subscribe() {
    if (!email.trim() || selected.size === 0) {
      setMessage('Enter your email and pick at least one zone.')
      setState('error')
      return
    }
    setState('saving')
    setMessage(null)
    try {
      const res = await fetch('/api/barcelona/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), zone_slugs: [...selected] }),
      })
      const json = await res.json()
      if (res.ok) {
        setState('done')
        setMessage(`Subscribed. You'll get an email on collection mornings for ${selected.size} zone${selected.size > 1 ? 's' : ''}.`)
      } else {
        setState('error')
        setMessage(json.error ?? 'Something went wrong.')
      }
    } catch {
      setState('error')
      setMessage('Network error. Try again.')
    }
  }

  // Group zones by weekday for a compact picker
  const byDay = new Map<number, typeof BARCELONA_ZONES>()
  for (const z of BARCELONA_ZONES) {
    byDay.set(z.weekday, [...(byDay.get(z.weekday) ?? []), z])
  }

  return (
    <div style={{ border: '1px solid var(--ob-rule)' }}>
      <div style={{ padding: 'var(--ob-space-3) var(--ob-space-4)', borderBottom: '1px solid var(--ob-rule)' }}>
        <span className="ob-eyebrow">Collection night alerts</span>
        <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', margin: 'var(--ob-space-2) 0 0', lineHeight: 'var(--ob-lh-relaxed)' }}>
          Pick your zones. Every collection morning we email you: tonight the
          streets fill up — put things out, or go find something.
        </p>
      </div>

      <div style={{ padding: 'var(--ob-space-3) var(--ob-space-4)' }}>
        {[1, 2, 3, 4, 5].map(day => (
          <div key={day} style={{ marginBottom: 'var(--ob-space-2)' }}>
            <span style={{ ...mono, fontSize: 'var(--ob-fs-caption)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg-faint)', display: 'block', marginBottom: 4 }}>
              {WEEKDAY_NAMES[day]}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(byDay.get(day) ?? []).map(z => {
                const active = selected.has(z.slug)
                return (
                  <button
                    key={z.slug}
                    type="button"
                    onClick={() => toggleZone(z.slug)}
                    style={{
                      ...mono,
                      fontSize: 'var(--ob-fs-caption)',
                      letterSpacing: '0.04em',
                      background: active ? 'var(--ob-fg)' : 'transparent',
                      color: active ? 'var(--ob-bg)' : 'var(--ob-fg-dim)',
                      border: `1px solid ${active ? 'var(--ob-fg)' : 'var(--ob-rule)'}`,
                      padding: '3px 9px',
                      cursor: 'pointer',
                    }}
                  >
                    {z.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 'var(--ob-space-3) var(--ob-space-4)', borderTop: '1px solid var(--ob-rule)', display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap' }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setState('idle') }}
          style={{
            ...mono,
            flex: 1,
            minWidth: 160,
            background: 'transparent',
            border: '1px solid var(--ob-fg-dim)',
            padding: '6px 10px',
            fontSize: 'var(--ob-fs-meta)',
            color: 'var(--ob-fg)',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={subscribe}
          disabled={state === 'saving'}
          className="ob-button"
          style={{ fontSize: 'var(--ob-fs-meta)', opacity: state === 'saving' ? 0.5 : 1 }}
        >
          {state === 'saving' ? 'Saving…' : 'Get alerts'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '0 var(--ob-space-4) var(--ob-space-3)' }}>
          <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: state === 'done' ? '#4CAF50' : 'var(--ob-red)' }}>
            {message}
          </span>
        </div>
      )}
    </div>
  )
}
