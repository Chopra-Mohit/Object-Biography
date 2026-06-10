'use client'

import { useCallback, useEffect, useState } from 'react'
import { BARCELONA_ZONES } from '@/lib/barcelona/zones'
import type { FeedEvent } from '@/app/api/barcelona/feed/route'

interface Props {
  userEmail: string | null
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

const KIND_META: Record<string, { label: string; color: string }> = {
  'sighting':       { label: 'Sighting',  color: '#4CAF50' },
  'pickup':         { label: 'Picked up', color: '#FF9800' },
  'note':           { label: 'Note',      color: '#ADAAA1' },
  'object-found':   { label: 'On the map', color: '#5C8FD6' },
  'object-claimed': { label: 'Claimed',   color: '#9C9990' },
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

/**
 * Live-ish community feed for collection nights: posts written here merged
 * with platform activity (objects pinned / claimed inside the city).
 * Polls every 25 seconds — close enough to a conversation for street pace.
 */
export default function BarcelonaFeed({ userEmail }: Props) {
  const [events, setEvents] = useState<FeedEvent[] | null>(null)
  const [body, setBody] = useState('')
  const [kind, setKind] = useState<'sighting' | 'pickup' | 'note'>('sighting')
  const [zoneSlug, setZoneSlug] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/barcelona/feed')
      if (res.ok) {
        const json = await res.json()
        setEvents(json.events ?? [])
      }
    } catch { /* keep last state */ }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 25_000)
    return () => clearInterval(t)
  }, [load])

  async function post() {
    if (!body.trim()) return
    setPosting(true)
    setPostError(null)
    try {
      const res = await fetch('/api/barcelona/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: body.trim(),
          kind,
          zone_slug: zoneSlug || undefined,
          display_name: userEmail ? userEmail.split('@')[0] : null,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setBody('')
        await load()
      } else {
        setPostError(json.error ?? 'Could not post.')
      }
    } catch {
      setPostError('Network error.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div style={{ border: '1px solid var(--ob-rule)' }}>

      {/* Composer */}
      <div style={{ padding: 'var(--ob-space-4) var(--ob-space-5)', borderBottom: '1px solid var(--ob-rule)' }}>
        <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>
          Street report
        </span>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder='"Two armchairs and a bookshelf at Carrer de Verdi / Providència, good condition"'
          rows={2}
          maxLength={500}
          style={{
            ...mono,
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--ob-fg-dim)',
            padding: '8px 10px',
            fontSize: 'var(--ob-fs-meta)',
            color: 'var(--ob-fg)',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 'var(--ob-lh-relaxed)',
          }}
        />
        <div style={{ display: 'flex', gap: 'var(--ob-space-3)', marginTop: 'var(--ob-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={kind}
            onChange={e => setKind(e.target.value as typeof kind)}
            style={selectStyle}
          >
            <option value="sighting">Spotted something</option>
            <option value="pickup">Picked something up</option>
            <option value="note">Note</option>
          </select>
          <select
            value={zoneSlug}
            onChange={e => setZoneSlug(e.target.value)}
            style={selectStyle}
          >
            <option value="">Zone (optional)</option>
            {BARCELONA_ZONES.map(z => (
              <option key={z.slug} value={z.slug}>{z.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={post}
            disabled={posting || !body.trim()}
            className="ob-button"
            style={{ fontSize: 'var(--ob-fs-meta)', marginLeft: 'auto', opacity: posting || !body.trim() ? 0.5 : 1 }}
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
        {postError && (
          <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-red)', display: 'block', marginTop: 'var(--ob-space-2)' }}>
            {postError}
          </span>
        )}
        {!userEmail && (
          <span style={{ ...mono, fontSize: 'var(--ob-fs-caption)', color: 'var(--ob-fg-faint)', display: 'block', marginTop: 'var(--ob-space-2)' }}>
            Posting anonymously — <a href="/auth/login" style={{ color: 'var(--ob-fg-dim)' }}>sign in</a> to post with your name.
          </span>
        )}
      </div>

      {/* Feed */}
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {events === null && (
          <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', padding: 'var(--ob-space-5)' }}>
            Loading street activity…
          </p>
        )}
        {events !== null && events.length === 0 && (
          <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', padding: 'var(--ob-space-5)', lineHeight: 'var(--ob-lh-relaxed)' }}>
            Quiet for now. On collection nights this fills up with sightings —
            be the first to report what's out on your street.
          </p>
        )}
        {events?.map(ev => {
          const meta = KIND_META[ev.kind] ?? KIND_META['note']
          return (
            <div key={ev.id} style={{ padding: 'var(--ob-space-3) var(--ob-space-5)', borderBottom: '1px solid var(--ob-rule)' }}>
              <div style={{ display: 'flex', gap: 'var(--ob-space-3)', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 2 }}>
                <span style={{ ...mono, fontSize: 'var(--ob-fs-caption)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: meta.color }}>
                  {meta.label}
                </span>
                {ev.zone_name && (
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-caption)', color: 'var(--ob-fg-faint)' }}>
                    {ev.zone_name}
                  </span>
                )}
                <span style={{ ...mono, fontSize: 'var(--ob-fs-caption)', color: 'var(--ob-fg-faint)', marginLeft: 'auto' }}>
                  {ev.display_name ? `${ev.display_name} · ` : ''}{timeAgo(ev.created_at)}
                </span>
              </div>
              <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', margin: 0, lineHeight: 'var(--ob-lh-relaxed)' }}>
                {ev.registration_id
                  ? <a href={`/registry/${ev.registration_id}`} style={{ color: 'var(--ob-fg-dim)' }}>{ev.body} →</a>
                  : ev.body}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-caption)',
  letterSpacing: '0.04em',
  background: 'var(--ob-bg)',
  border: '1px solid var(--ob-rule)',
  color: 'var(--ob-fg-dim)',
  padding: '5px 8px',
  outline: 'none',
}
