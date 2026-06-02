'use client'

// Archival register of dead objects — styled like a formal log book.
// Each row is clickable (→ registry detail). Certificate badge opens the cert directly.

interface Certificate {
  share_token: string
  is_public: boolean
}

export interface LedgerRow {
  id: string
  manual_brand: string | null
  manual_product_name: string | null
  date_of_death: string
  biography_json: Record<string, unknown> | null
  certificates: Certificate[]
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getFailure(bio: Record<string, unknown> | null): string {
  if (!bio) return '—'
  const death = bio.death as { failed_component?: string; failure_type?: string } | undefined
  return death?.failed_component ?? death?.failure_type ?? '—'
}

export default function DeathLedger({ rows }: { rows: LedgerRow[] }) {
  if (rows.length === 0) {
    return (
      <div style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', padding: 'var(--ob-space-8) 0' }}>
        No dead objects on record yet.
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--ob-rule)' }}>

      {/* Ledger header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 90px 28px',
        gap: 'var(--ob-space-3)',
        padding: 'var(--ob-space-2) var(--ob-space-4)',
        borderBottom: '2px solid var(--ob-rule)',
        background: 'rgba(255,255,255,0.025)',
      }}>
        {['#', 'Object', 'Died', '§'].map(h => (
          <span key={h} style={{
            ...mono, fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            color: 'var(--ob-fg-faint)',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {rows.map((r, idx) => {
          const cert  = r.certificates?.find(c => c.is_public) ?? r.certificates?.[0] ?? null
          const name  = [r.manual_brand, r.manual_product_name].filter(Boolean).join(' ') || 'Unknown object'
          const cause = getFailure(r.biography_json)

          return (
            <a
              key={r.id}
              href={`/registry/${r.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 90px 28px',
                  gap: 'var(--ob-space-3)',
                  padding: 'var(--ob-space-3) var(--ob-space-4)',
                  borderBottom: idx < rows.length - 1 ? '1px solid var(--ob-rule)' : 'none',
                  alignItems: 'start',
                  transition: 'background 0.1s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Row number */}
                <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', paddingTop: 1 }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Name + cause */}
                <div>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', display: 'block', lineHeight: 1.3, marginBottom: 2 }}>
                    {name}
                  </span>
                  {cause !== '—' && (
                    <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', display: 'block', lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cause}
                    </span>
                  )}
                </div>

                {/* Date of death */}
                <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-red)', paddingTop: 1, whiteSpace: 'nowrap' }}>
                  {formatDate(r.date_of_death)}
                </span>

                {/* Certificate badge */}
                {cert ? (
                  <a
                    href={`/certificate/${cert.share_token}`}
                    onClick={e => e.stopPropagation()}
                    title="View death certificate"
                    style={{
                      ...mono, fontSize: 'var(--ob-fs-meta)',
                      color: 'var(--ob-fg-dim)',
                      letterSpacing: 'var(--ob-ls-eyebrow)',
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'block',
                      paddingTop: 1,
                      transition: 'color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--ob-fg)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--ob-fg-dim)' }}
                  >
                    §
                  </a>
                ) : (
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', textAlign: 'center', display: 'block', opacity: 0.3 }}>—</span>
                )}
              </div>
            </a>
          )
        })}
      </div>

      {/* Footer count */}
      <div style={{
        borderTop: '1px solid var(--ob-rule)',
        padding: 'var(--ob-space-2) var(--ob-space-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase' }}>
          {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
        </span>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', letterSpacing: '0.1em' }}>
          § = death certificate
        </span>
      </div>
    </div>
  )
}
