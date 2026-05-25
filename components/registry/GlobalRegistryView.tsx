'use client'

import { useEffect, useState } from 'react'
import GlobalObjectCard, { type GlobalRegistrationRow } from './GlobalObjectCard'

interface Stats {
  total:      number
  topFailure: { type: string;  count: number } | null
  topBrand:   { brand: string; count: number } | null
}

interface GlobalData {
  registrations: GlobalRegistrationRow[]
  stats: Stats
}

export default function GlobalRegistryView() {
  const [data,    setData]    = useState<GlobalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/registry/global')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load global registry')
        return r.json() as Promise<GlobalData>
      })
      .then(d => setData(d))
      .catch(() => setError('Could not load the global registry. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ paddingTop: 'var(--ob-space-16)', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
        }}>
          Loading global registry...
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

  return (
    <div>
      {/* Global stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--ob-space-4)',
        marginBottom: 'var(--ob-space-8)',
      }}>
        <StatBox label="Objects on record"    value={String(stats.total)} />
        <StatBox label="Top failure mode"     value={stats.topFailure ? stats.topFailure.type : '—'} />
        <StatBox label="Most registered brand" value={stats.topBrand   ? stats.topBrand.brand  : '—'} />
      </div>

      {/* Cross-community pattern callout */}
      {stats.topFailure && stats.topFailure.count > 1 && (
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
            {stats.topFailure.count} of {stats.total} objects share the same failure mode:{' '}
            <em>{stats.topFailure.type}</em>
          </span>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

      {/* Empty state */}
      {registrations.length === 0 && (
        <p style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)',
          color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
          paddingTop: 'var(--ob-space-16)',
        }}>
          No community objects yet. Be the first to register something.
        </p>
      )}

      {/* Card grid */}
      {registrations.length > 0 && (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ob-space-5)' }}
          className="ob-registry-grid"
        >
          {registrations.map(r => (
            <GlobalObjectCard key={r.id} registration={r} />
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
