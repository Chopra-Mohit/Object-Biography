'use client'

// Card for objects saved from the Quick Insight (salvage) flow.
// Displays verdict + top salvageable components instead of a death narrative.

interface SalvageComponent {
  component: string
  why_salvageable?: string
  potential_uses?: string[]
}

interface FoundBiographyJSON {
  _type: 'quick_insight'
  object_identified: string
  manufacturer: string | null
  model: string | null
  verdict: 'worth-picking-up' | 'parts-only' | 'recycle-only' | 'leave-it'
  verdict_reason: string
  condition: string
  salvageable_components: SalvageComponent[]
  confidence: string
}

export interface FoundRegistrationRow {
  id: string
  manual_brand: string | null
  manual_product_name: string | null
  manual_model: string | null
  manual_year_purchased: number | null
  date_of_death: string          // semantically "date assessed" for found objects
  biography_json: FoundBiographyJSON | null
  created_at: string
  input_method: string
}

const VERDICT_LABEL: Record<string, string> = {
  'worth-picking-up': 'Worth it',
  'parts-only':       'Parts only',
  'recycle-only':     'Recycle',
  'leave-it':         'Leave it',
}

const VERDICT_COLOR: Record<string, string> = {
  'worth-picking-up': '#4CAF50',
  'parts-only':       '#FF9800',
  'recycle-only':     'var(--ob-fg-dim)',
  'leave-it':         'var(--ob-red)',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FoundObjectCard({ registration: r }: { registration: FoundRegistrationRow }) {
  const bio     = r.biography_json
  const verdict = bio?.verdict ?? null
  const name    = r.manual_product_name || bio?.object_identified || 'Found object'
  const brand   = r.manual_brand || bio?.manufacturer || null

  const salvageableCount = bio?.salvageable_components?.length ?? 0

  return (
    <div
      style={{
        border: '1px solid var(--ob-rule)',
        borderLeft: '2px solid #4CAF50',   // green accent = salvage flow
        padding: 'var(--ob-space-6)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ob-space-4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand */}
      {brand && (
        <span style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
        }}>
          {brand}
        </span>
      )}

      {/* Name */}
      <h2 style={{
        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-h3)',
        fontWeight: 'var(--ob-fw-regular)', color: 'var(--ob-fg)',
        margin: 0, lineHeight: 'var(--ob-lh-tight)',
      }}>
        {name}
      </h2>

      {/* Date assessed */}
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
        <span style={{ letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', marginRight: 6 }}>Found</span>
        {formatDate(r.date_of_death)}
      </span>

      {/* Verdict */}
      {verdict && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-3)' }}>
          <span style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            color: VERDICT_COLOR[verdict] ?? 'var(--ob-fg-dim)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: VERDICT_COLOR[verdict] ?? 'var(--ob-fg-dim)',
              display: 'inline-block', flexShrink: 0,
            }} />
            {VERDICT_LABEL[verdict] ?? verdict}
          </span>
        </div>
      )}

      {/* Salvageable component count */}
      {salvageableCount > 0 && (
        <p style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          color: 'var(--ob-fg-dim)', margin: 0, lineHeight: 'var(--ob-lh-relaxed)',
        }}>
          {salvageableCount} salvageable component{salvageableCount !== 1 ? 's' : ''}
          {bio?.salvageable_components?.[0]?.component
            ? `: ${bio.salvageable_components.slice(0, 2).map(c => c.component).join(', ')}${salvageableCount > 2 ? '…' : ''}`
            : ''}
        </p>
      )}

      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{
        paddingTop: 'var(--ob-space-4)', borderTop: '1px solid var(--ob-rule)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
          color: '#4CAF50', opacity: 0.7,
        }}>
          Found object
        </span>
        {bio?.condition && (
          <span style={{
            fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            color: 'var(--ob-fg-dim)',
          }}>
            {bio.condition}
          </span>
        )}
      </div>
    </div>
  )
}
