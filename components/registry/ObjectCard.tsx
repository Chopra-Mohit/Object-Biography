'use client'

import type { DBRegistration, DBCertificate } from '@/types/database'

export type RegistrationRow = DBRegistration & {
  certificates: Pick<DBCertificate, 'share_token'>[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function objectName(r: DBRegistration) {
  if (r.manual_brand && r.manual_product_name) return `${r.manual_brand} ${r.manual_product_name}`
  if (r.manual_product_name) return r.manual_product_name
  return 'Unknown object'
}

export default function ObjectCard({ registration: r }: { registration: RegistrationRow }) {
  const cert   = r.certificates?.[0]
  const hasBio = r.biography_generated
  const bio    = r.biography_json as { death?: { failed_component?: string } } | null

  return (
    <a href={`/biography/${r.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        style={{
          border: '1px solid var(--ob-rule)',
          padding: 'var(--ob-space-6)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ob-space-4)',
          transition: 'border-color 0.15s ease',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ob-fg-dim)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ob-rule)')}
      >
        {/* Brand */}
        {r.manual_brand && (
          <span style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            color: 'var(--ob-fg-dim)',
          }}>
            {r.manual_brand}
          </span>
        )}

        {/* Name */}
        <h2 style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-h3)',
          fontWeight: 'var(--ob-fw-regular)', color: 'var(--ob-fg)',
          margin: 0, lineHeight: 'var(--ob-lh-tight)',
        }}>
          {r.manual_product_name ?? objectName(r)}
        </h2>

        {/* Dates */}
        <div style={{ display: 'flex', gap: 'var(--ob-space-6)', flexWrap: 'wrap' }}>
          <DateChip label="Died"       value={formatDate(r.date_of_death)} accent />
          <DateChip label="Registered" value={formatDate(r.created_at)} />
        </div>

        {/* Failed component */}
        {bio?.death?.failed_component ? (
          <div style={{ borderLeft: '2px solid var(--ob-red)', paddingLeft: 'var(--ob-space-3)' }}>
            <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', display: 'block' }}>
              {bio.death.failed_component}
            </span>
          </div>
        ) : r.failure_description ? (
          <p style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
            color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', margin: 0,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}>
            {r.failure_description}
          </p>
        ) : null}

        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 'var(--ob-space-3)',
          paddingTop: 'var(--ob-space-4)', borderTop: '1px solid var(--ob-rule)',
        }}>
          <StatusPill generated={hasBio} />
          {cert && (
            <a
              href={`/certificate/${cert.share_token}`}
              onClick={e => e.stopPropagation()}
              style={{
                fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
                letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                color: 'var(--ob-fg-dim)', textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ob-fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ob-fg-dim)')}
            >
              Certificate ↗
            </a>
          )}
        </div>
      </div>
    </a>
  )
}

function DateChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
      <span style={{ letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', marginRight: 6 }}>{label}</span>
      <span style={{ color: accent ? 'var(--ob-red)' : 'var(--ob-fg)' }}>{value}</span>
    </span>
  )
}

function StatusPill({ generated }: { generated: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
      letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
      color: generated ? '#4CAF50' : 'var(--ob-fg-dim)',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: generated ? '#4CAF50' : 'var(--ob-rule)',
        display: 'inline-block', flexShrink: 0,
      }} />
      {generated ? 'Biography written' : 'Pending biography'}
    </span>
  )
}
