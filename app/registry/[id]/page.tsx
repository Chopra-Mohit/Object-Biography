import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { BiographyJSON } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

interface Certificate {
  share_token: string
  is_public: boolean
}

interface RegistrationRow {
  id: string
  manual_brand: string | null
  manual_product_name: string | null
  manual_model: string | null
  manual_year_purchased: number | null
  date_of_death: string
  failure_description: string | null
  biography_json: Record<string, unknown> | null
  biography_generated: boolean
  input_method: string | null
  created_at: string
  certificates: Certificate[]
}

interface QuickInsightBio {
  _type: 'quick_insight'
  object_identified: string
  manufacturer: string | null
  model: string | null
  verdict: 'worth-picking-up' | 'parts-only' | 'recycle-only' | 'leave-it'
  verdict_reason: string
  condition: string
  confidence: string
  salvageable_components: Array<{
    component: string
    why_salvageable?: string
    potential_uses?: string[]
  }>
  non_salvageable_components: Array<{
    component: string
    why_not?: string
  }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const VERDICT_LABEL: Record<string, string> = {
  'worth-picking-up': 'Worth picking up',
  'parts-only':       'Parts only',
  'recycle-only':     'Recycle only',
  'leave-it':         'Leave it',
}

const VERDICT_COLOR: Record<string, string> = {
  'worth-picking-up': '#4CAF50',
  'parts-only':       '#FF9800',
  'recycle-only':     'var(--ob-fg-dim)',
  'leave-it':         'var(--ob-red)',
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { data } = await supabaseAdmin
    .from('registrations')
    .select('manual_brand, manual_product_name')
    .eq('id', id)
    .single()

  const name = data
    ? [data.manual_brand, data.manual_product_name].filter(Boolean).join(' ') || 'Object'
    : 'Object'
  return { title: `${name} — Object Biography` }
}

export default async function RegistryObjectPage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select(`
      id, manual_brand, manual_product_name, manual_model, manual_year_purchased,
      date_of_death, failure_description, biography_json, biography_generated,
      input_method, created_at,
      certificates(share_token, is_public)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return notFound()

  const r = data as unknown as RegistrationRow
  const isFound = r.input_method === 'salvage'
  const cert = r.certificates?.find(c => c.is_public) ?? r.certificates?.[0]

  // ── Found object (salvage assessment) ────────────────────────────────────────
  if (isFound) {
    const bio = r.biography_json as QuickInsightBio | null
    const name  = r.manual_product_name || bio?.object_identified || 'Found object'
    const brand = r.manual_brand || bio?.manufacturer || null
    const verdict = bio?.verdict ?? null

    return (
      <main style={{ minHeight: '100vh', background: 'var(--ob-bg)', paddingTop: 'var(--ob-space-20)', paddingBottom: 'var(--ob-space-20)' }}>
        <div className="ob-container--narrow">

          <a href="/registry" style={backLinkStyle}>← Registry</a>

          <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Found object</span>

          {brand && (
            <span style={{
              display: 'block', fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
              color: 'var(--ob-fg-dim)', marginBottom: 'var(--ob-space-3)',
            }}>
              {brand}
            </span>
          )}

          <h1 style={h1Style}>{name}</h1>

          <div style={{ display: 'flex', gap: 'var(--ob-space-6)', flexWrap: 'wrap', marginBottom: 'var(--ob-space-10)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)' }}>
              <span style={{ letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', marginRight: 8 }}>Found</span>
              {formatDate(r.date_of_death)}
            </span>
            {verdict && (
              <span style={{
                fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
                letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                color: VERDICT_COLOR[verdict] ?? 'var(--ob-fg-dim)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: VERDICT_COLOR[verdict] ?? 'var(--ob-fg-dim)',
                  display: 'inline-block', flexShrink: 0,
                }} />
                {VERDICT_LABEL[verdict] ?? verdict}
              </span>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {bio?.verdict_reason && (
            <Section title="Assessment">
              <p style={narrativeStyle}>{bio.verdict_reason}</p>
            </Section>
          )}

          {bio?.condition && (
            <Section title="Condition">
              <p style={narrativeStyle}>{bio.condition}</p>
            </Section>
          )}

          {bio?.salvageable_components && bio.salvageable_components.length > 0 && (
            <Section title={`Salvageable components — ${bio.salvageable_components.length}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-5)' }}>
                {bio.salvageable_components.map((c, i) => (
                  <div key={i} style={{ borderLeft: '2px solid #4CAF50', paddingLeft: 'var(--ob-space-4)' }}>
                    <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', display: 'block', marginBottom: 2 }}>
                      {c.component}
                    </span>
                    {c.why_salvageable && (
                      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', display: 'block' }}>
                        {c.why_salvageable}
                      </span>
                    )}
                    {c.potential_uses && c.potential_uses.length > 0 && (
                      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', opacity: 0.65, display: 'block', marginTop: 2 }}>
                        {c.potential_uses.join(' · ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {bio?.non_salvageable_components && bio.non_salvageable_components.length > 0 && (
            <Section title={`Non-salvageable — ${bio.non_salvageable_components.length}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-3)' }}>
                {bio.non_salvageable_components.map((c, i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--ob-rule)', paddingLeft: 'var(--ob-space-4)' }}>
                    <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', display: 'block' }}>
                      {c.component}
                    </span>
                    {c.why_not && (
                      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', opacity: 0.65, display: 'block' }}>
                        {c.why_not}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginTop: 'var(--ob-space-16)' }} />
          <div style={{ marginTop: 'var(--ob-space-10)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)', color: 'var(--ob-fg-dim)', marginBottom: 'var(--ob-space-5)', lineHeight: 'var(--ob-lh-relaxed)' }}>
              Found something worth saving?
            </p>
            <a href="/salvage" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Assess a found object →
            </a>
          </div>

        </div>
      </main>
    )
  }

  // ── Dead object ───────────────────────────────────────────────────────────────
  const bio = r.biography_json as BiographyJSON | null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ob-bg)', paddingTop: 'var(--ob-space-20)', paddingBottom: 'var(--ob-space-20)' }}>
      <div className="ob-container--narrow">

        <a href="/registry" style={backLinkStyle}>← Registry</a>

        <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Dead object</span>

        {r.manual_brand && (
          <span style={{
            display: 'block', fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
            color: 'var(--ob-fg-dim)', marginBottom: 'var(--ob-space-3)',
          }}>
            {r.manual_brand}
          </span>
        )}

        <h1 style={h1Style}>
          {r.manual_product_name || bio?.object_name || 'Unknown object'}
        </h1>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 'var(--ob-space-8)', flexWrap: 'wrap', marginBottom: 'var(--ob-space-10)' }}>
          {r.manual_model && <MetaItem label="Model" value={r.manual_model} />}
          {r.manual_year_purchased && <MetaItem label="Purchased" value={String(r.manual_year_purchased)} />}
          <MetaItem label="Died" value={formatDate(r.date_of_death)} valueColor="var(--ob-red)" />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        {/* Cause of death */}
        {(bio?.death?.failed_component || r.failure_description) && (
          <Section title="Cause of death">
            {bio?.death?.failed_component ? (
              <div style={{ borderLeft: '2px solid var(--ob-red)', paddingLeft: 'var(--ob-space-4)' }}>
                <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)', color: 'var(--ob-fg)', display: 'block', marginBottom: 2 }}>
                  {bio.death.failed_component}
                </span>
                {bio.death.failure_type && (
                  <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', display: 'block' }}>
                    {bio.death.failure_type}
                  </span>
                )}
              </div>
            ) : r.failure_description ? (
              <p style={narrativeStyle}>{r.failure_description}</p>
            ) : null}
          </Section>
        )}

        {/* Full biography — only if generated */}
        {bio && (
          <>
            {bio.death?.narrative && (
              <Section title="How it died">
                <p style={narrativeStyle}>{bio.death.narrative}</p>
                {bio.death.design_decision && (
                  <p style={{ ...narrativeStyle, borderLeft: '2px solid var(--ob-red)', paddingLeft: 'var(--ob-space-4)', marginTop: 'var(--ob-space-5)' }}>
                    {bio.death.design_decision}
                  </p>
                )}
              </Section>
            )}

            {bio.life?.narrative && (
              <Section title="Its life">
                <p style={narrativeStyle}>{bio.life.narrative}</p>
                {bio.life.supply_chain_summary && (
                  <p style={{ ...narrativeStyle, marginTop: 'var(--ob-space-5)', opacity: 0.8 }}>
                    {bio.life.supply_chain_summary}
                  </p>
                )}
              </Section>
            )}

            {bio.second_life?.narrative && (
              <Section title="Second life">
                <p style={narrativeStyle}>{bio.second_life.narrative}</p>
              </Section>
            )}
          </>
        )}

        {/* Certificate link */}
        {cert && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', margin: 'var(--ob-space-10) 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ob-space-4)' }}>
              <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)' }}>
                A death certificate has been issued for this object.
              </span>
              <a
                href={`/certificate/${cert.share_token}`}
                style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
                  letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                  color: 'var(--ob-fg)', textDecoration: 'none',
                  border: '1px solid var(--ob-rule)', padding: '5px 14px',
                  whiteSpace: 'nowrap',
                }}
              >
                View certificate →
              </a>
            </div>
          </>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginTop: 'var(--ob-space-16)' }} />
        <div style={{ marginTop: 'var(--ob-space-10)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)', color: 'var(--ob-fg-dim)', marginBottom: 'var(--ob-space-5)', lineHeight: 'var(--ob-lh-relaxed)' }}>
            Every object deserves a record.
          </p>
          <a href="/register" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Register your own dead object →
          </a>
        </div>

      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--ob-space-10)' }}>
      <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>
        {title}
      </span>
      {children}
    </div>
  )
}

function MetaItem({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <span style={{
        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
        color: 'var(--ob-fg-dim)', display: 'block', marginBottom: 2,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
        color: valueColor ?? 'var(--ob-fg)',
      }}>
        {value}
      </span>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const backLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-stamp)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg-dim)',
  textDecoration: 'none',
  marginBottom: 'var(--ob-space-12)',
}

const h1Style: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-display)',
  fontWeight: 'var(--ob-fw-regular)',
  color: 'var(--ob-fg)',
  lineHeight: 'var(--ob-lh-snug)',
  margin: '0 0 var(--ob-space-6) 0',
}

const narrativeStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-small)',
  color: 'var(--ob-fg-dim)',
  lineHeight: 'var(--ob-lh-relaxed)',
  margin: 0,
}
