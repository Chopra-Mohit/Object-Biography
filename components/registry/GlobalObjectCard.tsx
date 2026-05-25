'use client'

// A card for objects registered by other community members.
// Intentionally shows less than ObjectCard — no biography link (user doesn't own it),
// only links out to the public certificate if one exists.

interface Certificate {
  share_token: string
  is_public: boolean
}

export interface GlobalRegistrationRow {
  id: string
  manual_brand: string | null
  manual_product_name: string | null
  manual_model: string | null
  manual_year_purchased: number | null
  date_of_death: string
  failure_description: string
  biography_json: Record<string, unknown> | null
  input_method: string | null
  created_at: string
  certificates: Certificate[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function GlobalObjectCard({ registration: r }: { registration: GlobalRegistrationRow }) {
  const bio  = r.biography_json as { death?: { failed_component?: string; failure_type?: string } } | null
  const cert = r.certificates?.find(c => c.is_public) ?? r.certificates?.[0]

  const name = [r.manual_brand, r.manual_product_name].filter(Boolean).join(' ') || 'Unknown object'

  const inner = (
    <div
      style={{
        border: '1px solid var(--ob-rule)',
        padding: 'var(--ob-space-6)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ob-space-4)',
        transition: 'border-color 0.15s ease',
        cursor: cert ? 'pointer' : 'default',
        boxSizing: 'border-box',
        // Subtle visual distinction from own-object cards: dimmed left accent
        borderLeft: '2px solid var(--ob-rule)',
      }}
      onMouseEnter={e => {
        if (cert) e.currentTarget.style.borderColor = 'var(--ob-fg-dim)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--ob-rule)'
        e.currentTarget.style.borderLeftColor = 'var(--ob-rule)'
      }}
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
        {r.manual_product_name ?? name}
      </h2>

      {/* Date of death */}
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
        <span style={{ letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', marginRight: 6 }}>Died</span>
        <span style={{ color: 'var(--ob-red)' }}>{formatDate(r.date_of_death)}</span>
      </span>

      {/* Failed component from biography */}
      {bio?.death?.failed_component ? (
        <div style={{ borderLeft: '2px solid var(--ob-red)', paddingLeft: 'var(--ob-space-3)' }}>
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', display: 'block' }}>
            {bio.death.failed_component}
          </span>
          {bio.death.failure_type && (
            <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', opacity: 0.6, display: 'block' }}>
              {bio.death.failure_type}
            </span>
          )}
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
        paddingTop: 'var(--ob-space-4)', borderTop: '1px solid var(--ob-rule)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)', opacity: 0.5,
        }}>
          Community
        </span>
        {cert ? (
          <span style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            color: 'var(--ob-fg-dim)',
          }}>
            Certificate ↗
          </span>
        ) : (
          <span style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            color: 'var(--ob-fg-dim)', opacity: 0.4,
          }}>
            No certificate
          </span>
        )}
      </div>
    </div>
  )

  if (cert) {
    return (
      <a href={`/certificate/${cert.share_token}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        {inner}
      </a>
    )
  }

  return <div style={{ height: '100%' }}>{inner}</div>
}
