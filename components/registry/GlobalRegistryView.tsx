'use client'

import { useEffect, useState } from 'react'
import GlobalObjectCard, { type GlobalRegistrationRow } from './GlobalObjectCard'
import FoundObjectCard, { type FoundRegistrationRow } from './FoundObjectCard'

type ViewType = 'all' | 'dead' | 'found'

interface Stats {
  total:      number
  deadCount:  number
  foundCount: number
  topFailure: { type: string;    count: number } | null
  topBrand:   { brand: string;   count: number } | null
  topVerdict: { verdict: string; count: number } | null
}

interface GlobalData {
  registrations: (GlobalRegistrationRow & { input_method: string | null })[]
  stats: Stats
}

interface Props {
  type: ViewType
}

const VERDICT_LABEL: Record<string, string> = {
  'worth-picking-up': 'Worth picking up',
  'parts-only':       'Parts only',
  'recycle-only':     'Recycle only',
  'leave-it':         'Leave it',
}

const EMPTY_TEXT: Record<ViewType, string> = {
  all:   'Nothing in the community registry yet. Register a dead object or share a salvage assessment.',
  dead:  'No dead objects in the community registry yet. Register your first.',
  found: 'No found objects shared yet. Assess a found object and share it to the registry.',
}

export default function GlobalRegistryView({ type }: Props) {
  const [data,    setData]    = useState<GlobalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setData(null)

    fetch(`/api/registry/global?type=${type}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load registry')
        return r.json() as Promise<GlobalData>
      })
      .then(d => setData(d))
      .catch(() => setError('Could not load the registry. Please try again.'))
      .finally(() => setLoading(false))
  }, [type])

  if (loading) {
    return (
      <div style={{ paddingTop: 'var(--ob-space-16)', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
        }}>
          Loading...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ paddingTop: 'var(--ob-space-16)' }}>
        <p style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)',
          color: 'var(--ob-red)', lineHeight: 'var(--ob-lh-relaxed)',
        }}>
          {error}
        </p>
      </div>
    )
  }

  if (!data) return null

  const { registrations, stats } = data

  // Build stat boxes based on view type
  const statBoxes: { label: string; value: string }[] =
    type === 'found'
      ? [
          { label: 'Found objects',  value: String(stats.total) },
          { label: 'Top verdict',    value: stats.topVerdict ? (VERDICT_LABEL[stats.topVerdict.verdict] ?? stats.topVerdict.verdict) : '—' },
          { label: 'Top brand',      value: stats.topBrand   ? stats.topBrand.brand  : '—' },
        ]
      : type === 'dead'
      ? [
          { label: 'Objects on record',     value: String(stats.total) },
          { label: 'Top failure mode',      value: stats.topFailure ? stats.topFailure.type : '—' },
          { label: 'Most registered brand', value: stats.topBrand   ? stats.topBrand.brand  : '—' },
        ]
      : [
          { label: 'Total objects',   value: String(stats.total) },
          { label: 'Dead objects',    value: String(stats.deadCount) },
          { label: 'Found objects',   value: String(stats.foundCount) },
        ]

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--ob-space-4)',
        marginBottom: 'var(--ob-space-8)',
      }}>
        {statBoxes.map(s => (
          <StatBox key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      {/* Pattern callout — only for dead/all views */}
      {type !== 'found' && stats.topFailure && stats.topFailure.count > 1 && (
        <div style={{
          border: '1px solid var(--ob-rule)', borderLeft: '3px solid var(--ob-red)',
          padding: 'var(--ob-space-4) var(--ob-space-5)', marginBottom: 'var(--ob-space-10)',
          display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
        }}>
          <span className="ob-eyebrow" style={{ color: 'var(--ob-red)', flexShrink: 0 }}>
            Community pattern
          </span>
          <span style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
            color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-relaxed)',
          }}>
            {stats.topFailure.count} of {stats.deadCount || stats.total} objects share the same failure mode:{' '}
            <em>{stats.topFailure.type}</em>
          </span>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

      {/* Empty state */}
      {registrations.length === 0 && (
        <div style={{ paddingTop: 'var(--ob-space-16)' }}>
          <p style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)',
            color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
            marginBottom: 'var(--ob-space-8)', maxWidth: 440,
          }}>
            {EMPTY_TEXT[type]}
          </p>
          {type === 'found' ? (
            <a href="/salvage" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Assess a found object →
            </a>
          ) : (
            <a href="/register" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Register your first dead object →
            </a>
          )}
        </div>
      )}

      {/* Card grid */}
      {registrations.length > 0 && (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ob-space-5)' }}
          className="ob-registry-grid"
        >
          {registrations.map(r => (
            r.input_method === 'salvage'
              ? <FoundObjectCard  key={r.id} registration={r as unknown as FoundRegistrationRow} />
              : <GlobalObjectCard key={r.id} registration={r} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-4) var(--ob-space-5)' }}>
      <span style={{
        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
        color: 'var(--ob-fg-dim)', display: 'block', marginBottom: 'var(--ob-space-2)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-h3)',
        color: 'var(--ob-fg)', lineHeight: 1, display: 'block',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  )
}
