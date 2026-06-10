'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import GlobalObjectCard, { type GlobalRegistrationRow } from './GlobalObjectCard'
import FoundObjectCard, { type FoundRegistrationRow } from './FoundObjectCard'
import DeathLedger, { type LedgerRow } from './DeathLedger'
import type { MapItem } from './LeafletRegistryMap'

// Dynamically load the map — Leaflet requires window
const LeafletRegistryMap = dynamic(() => import('./LeafletRegistryMap'), { ssr: false })

type ViewType = 'all' | 'dead' | 'found'

interface Certificate { share_token: string; is_public: boolean }

interface FullRow {
  id: string
  manual_brand: string | null
  manual_product_name: string | null
  manual_model: string | null
  manual_year_purchased: number | null
  date_of_death: string
  failure_description: string
  biography_generated: boolean
  biography_json: Record<string, unknown> | null
  input_method: string | null
  created_at: string
  location_lat: number | null
  location_lng: number | null
  location_name: string | null
  picked_up: boolean
  product_image_url: string | null
  certificates: Certificate[]
}

interface Stats {
  total: number
  deadCount: number
  foundCount: number
  topFailure: { type: string; count: number } | null
  topBrand:   { brand: string; count: number } | null
  topVerdict: { verdict: string; count: number } | null
  failureBreakdown?: { type: string; count: number }[]
}

interface GlobalData { registrations: FullRow[]; stats: Stats }

interface Props { type: ViewType }

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

const VERDICT_LABEL: Record<string, string> = {
  'worth-picking-up': 'Worth picking up',
  'parts-only':       'Parts only',
  'recycle-only':     'Recycle only',
  'leave-it':         'Leave it',
}

const EMPTY_TEXT: Record<ViewType, string> = {
  all:   'Nothing in the community registry yet. Register a dead object or share a salvage assessment.',
  dead:  'No dead objects in the community registry yet. Register your first.',
  found: 'No found objects shared yet. Assess a found object to add it.',
}

export default function GlobalRegistryView({ type }: Props) {
  const [data,    setData]    = useState<GlobalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true); setError(null); setData(null)
    fetch(`/api/registry/global?type=${type}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<GlobalData> })
      .then(d  => setData(d))
      .catch(() => setError('Could not load the registry. Please try again.'))
      .finally(() => setLoading(false))
  }, [type])

  if (loading) return (
    <div style={{ paddingTop: 'var(--ob-space-16)', textAlign: 'center' }}>
      <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg-dim)' }}>
        Loading…
      </span>
    </div>
  )
  if (error) return (
    <div style={{ paddingTop: 'var(--ob-space-16)' }}>
      <p style={{ ...mono, fontSize: 'var(--ob-fs-base)', color: 'var(--ob-red)', lineHeight: 'var(--ob-lh-relaxed)' }}>{error}</p>
    </div>
  )
  if (!data) return null

  const { registrations, stats } = data

  const deadRows  = registrations.filter(r => r.input_method !== 'salvage')
  const foundRows = registrations.filter(r => r.input_method === 'salvage')

  // Map items — only found objects with coordinates
  const mapItems: MapItem[] = foundRows
    .filter(r => r.location_lat != null && r.location_lng != null)
    .map(r => ({
      id:        r.id,
      name:      r.manual_product_name || (r.biography_json as { object_identified?: string } | null)?.object_identified || 'Found object',
      lat:       r.location_lat!,
      lng:       r.location_lng!,
      verdict:   (r.biography_json as { verdict?: string } | null)?.verdict ?? null,
      picked_up: r.picked_up ?? false,
    }))

  // Ledger rows — dead objects
  const ledgerRows: LedgerRow[] = deadRows.map(r => ({
    id:                  r.id,
    manual_brand:        r.manual_brand,
    manual_product_name: r.manual_product_name,
    date_of_death:       r.date_of_death,
    biography_json:      r.biography_json,
    certificates:        r.certificates ?? [],
  }))

  // Stat boxes
  const statBoxes =
    type === 'found'
      ? [
          { label: 'Found objects', value: String(stats.total) },
          { label: 'On map',        value: String(mapItems.length) },
          { label: 'Top verdict',   value: stats.topVerdict ? (VERDICT_LABEL[stats.topVerdict.verdict] ?? stats.topVerdict.verdict) : '—' },
        ]
      : type === 'dead'
      ? [
          { label: 'Objects on record',   value: String(stats.total) },
          { label: 'With certificate',    value: String(deadRows.filter(r => r.certificates?.length > 0).length) },
          { label: 'Top failure',         value: stats.topFailure?.type ?? '—' },
        ]
      : [
          { label: 'Total objects', value: String(stats.total) },
          { label: 'Dead',          value: String(stats.deadCount) },
          { label: 'Found',         value: String(stats.foundCount) },
        ]

  const displayRows = type === 'found' ? foundRows : type === 'dead' ? deadRows : registrations

  return (
    <div>
      {/* Stat bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ob-space-4)', marginBottom: 'var(--ob-space-8)' }}>
        {statBoxes.map(s => <StatBox key={s.label} label={s.label} value={s.value} />)}
      </div>

      {/* Pattern callout — failure-mode distribution across the whole registry */}
      {type !== 'found' && stats.failureBreakdown && stats.failureBreakdown.length > 0 && (
        <div style={{
          border: '1px solid var(--ob-rule)', borderLeft: '3px solid var(--ob-red)',
          padding: 'var(--ob-space-4) var(--ob-space-5)', marginBottom: 'var(--ob-space-8)',
        }}>
          <span className="ob-eyebrow" style={{ color: 'var(--ob-red)', display: 'block', marginBottom: 'var(--ob-space-3)' }}>
            How things die here
          </span>
          {stats.failureBreakdown.map(f => {
            const max = stats.failureBreakdown![0].count
            return (
              <div key={f.type} style={{ display: 'flex', gap: 'var(--ob-space-3)', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', width: '46%', minWidth: 140 }}>
                  {f.type}
                </span>
                <span style={{
                  height: 8, background: 'var(--ob-red)', opacity: 0.55,
                  width: `${Math.max(6, Math.round((f.count / max) * 40))}%`,
                }} />
                <span style={{ ...mono, fontSize: 'var(--ob-fs-caption)', color: 'var(--ob-fg-faint)' }}>
                  ×{f.count}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {type !== 'found' && (!stats.failureBreakdown || stats.failureBreakdown.length === 0) && stats.topFailure && stats.topFailure.count > 1 && (
        <div style={{
          border: '1px solid var(--ob-rule)', borderLeft: '3px solid var(--ob-red)',
          padding: 'var(--ob-space-4) var(--ob-space-5)', marginBottom: 'var(--ob-space-8)',
          display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
        }}>
          <span className="ob-eyebrow" style={{ color: 'var(--ob-red)', flexShrink: 0 }}>Community pattern</span>
          <span style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-relaxed)' }}>
            {stats.topFailure.count} objects share the failure mode: <em>{stats.topFailure.type}</em>
          </span>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-8)' }} />

      {/* Empty state */}
      {registrations.length === 0 && (
        <div style={{ paddingTop: 'var(--ob-space-16)' }}>
          <p style={{ ...mono, fontSize: 'var(--ob-fs-base)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', marginBottom: 'var(--ob-space-8)', maxWidth: 440 }}>
            {EMPTY_TEXT[type]}
          </p>
          {type === 'found'
            ? <a href="/salvage" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>Assess a found object →</a>
            : <a href="/register" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>Register your first dead object →</a>
          }
        </div>
      )}

      {/* ── Split layout — always rendered for found tab (map shows even when empty) */}
      {(registrations.length > 0 || type === 'found') && (
        <div className="ob-registry-split" style={{ display: 'grid', gap: 'var(--ob-space-8)', alignItems: 'start' }}>

          {/* LEFT PANEL */}
          <div className="ob-registry-left">

            {/* FOUND → map (always visible) */}
            {type === 'found' && (
              <LeftPanel label="Location map" sublabel={mapItems.length > 0 ? `${mapItems.length} pinned` : 'no pins yet — tag locations from object pages'}>
                <div style={{ height: 480 }}><LeafletRegistryMap items={mapItems} /></div>
                <MapLegend />
              </LeftPanel>
            )}

            {/* DEAD → ledger */}
            {type === 'dead' && (
              <LeftPanel label="Death register" sublabel={`§ = certificate`}>
                <DeathLedger rows={ledgerRows} />
              </LeftPanel>
            )}

            {/* ALL → ledger + map stacked */}
            {type === 'all' && (
              <>
                <LeftPanel label="Death register" sublabel={`${ledgerRows.length} entries · § = certificate`}>
                  <DeathLedger rows={ledgerRows} />
                </LeftPanel>
                <div style={{ marginTop: 'var(--ob-space-6)' }}>
                  <LeftPanel label="Found objects map" sublabel={mapItems.length > 0 ? `${mapItems.length} pinned` : 'no pins yet'}>
                    <div style={{ height: 280 }}><LeafletRegistryMap items={mapItems} /></div>
                    <MapLegend />
                  </LeftPanel>
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL — object cards */}
          <div
            className="ob-registry-right ob-registry-scroll"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-4)' }}
          >
            {displayRows.length === 0 && (
              <p style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)' }}>
                {EMPTY_TEXT[type]}
              </p>
            )}
            {displayRows.map(r =>
              r.input_method === 'salvage'
                ? <FoundObjectCard  key={r.id} registration={r as unknown as FoundRegistrationRow} />
                : <GlobalObjectCard key={r.id} registration={r as GlobalRegistrationRow} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LeftPanel({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', marginBottom: 'var(--ob-space-3)' }}>
        <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg)' }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)' }}>
            {sublabel}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}


function MapLegend() {
  const items = [
    { color: '#4CAF50', label: 'Worth it' },
    { color: '#FF9800', label: 'Parts only' },
    { color: '#9C9990', label: 'Recycle' },
    { color: '#C41E1E', label: 'Leave it' },
    { color: '#444440', label: 'Picked up' },
  ]
  return (
    <div style={{ display: 'flex', gap: 'var(--ob-space-4)', flexWrap: 'wrap', marginTop: 'var(--ob-space-3)' }}>
      {items.map(i => (
        <span key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: i.color, display: 'inline-block', flexShrink: 0 }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-4) var(--ob-space-5)' }}>
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg-dim)', display: 'block', marginBottom: 'var(--ob-space-2)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-h3)', color: 'var(--ob-fg)', lineHeight: 1, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  )
}
