import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import FoundObjectDetail from '@/components/registry/FoundObjectDetail'
import PickedUpToggle from '@/components/registry/PickedUpToggle'
import DeadObjectImageSection from '@/components/registry/DeadObjectImageSection'
import type { BiographyJSON } from '@/types/database'
import type { QuickInsightResult } from '@/lib/anthropic/quickInsightTypes'

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
  product_image_url: string | null
  location_lat: number | null
  location_lng: number | null
  location_name: string | null
  picked_up: boolean
  picked_up_at: string | null
  picked_up_by?: string | null
  certificates: Certificate[]
}

const REGISTRATION_FIELDS = `
  id, manual_brand, manual_product_name, manual_model, manual_year_purchased,
  date_of_death, failure_description, biography_json, biography_generated,
  input_method, created_at, product_image_url,
  location_lat, location_lng, location_name, picked_up, picked_up_at,
  certificates(share_token, is_public)
`

// picked_up_by only exists after the session-6 migration — fall back without it
async function fetchRegistration(id: string) {
  const withColumn = await supabaseAdmin
    .from('registrations')
    .select(`${REGISTRATION_FIELDS}, picked_up_by`)
    .eq('id', id)
    .single()
  if (!withColumn.error) return withColumn

  return supabaseAdmin
    .from('registrations')
    .select(REGISTRATION_FIELDS)
    .eq('id', id)
    .single()
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
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

  // Get current user for auth-gated features (pickup identity, location gate)
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userEmail = user?.email ?? null

  const { data, error } = await fetchRegistration(id)

  if (error || !data) return notFound()

  const r = data as unknown as RegistrationRow
  const isFound = r.input_method === 'salvage'
  const cert = r.certificates?.find(c => c.is_public) ?? r.certificates?.[0]

  // ── Found object (salvage assessment) ────────────────────────────────────────
  if (isFound) {
    // biography_json is stored as { _type: 'quick_insight', ...QuickInsightResult }
    const raw = r.biography_json as ({ _type: 'quick_insight' } & QuickInsightResult) | null
    const name  = r.manual_product_name || raw?.object_identified || 'Found object'
    const brand = r.manual_brand !== 'Unknown' ? r.manual_brand : (raw?.manufacturer ?? null)

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
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Full analysis — location picker/map is now inside FoundObjectDetail */}
          {raw ? (
            <FoundObjectDetail
              result={raw}
              imageUrl={r.product_image_url}
              registrationId={r.id}
              userEmail={userEmail}
              locationLat={r.location_lat}
              locationLng={r.location_lng}
              locationName={r.location_name}
            />
          ) : (
            <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)' }}>
              No analysis data available.
            </p>
          )}

          {/* Picked-up availability toggle */}
          <PickedUpToggle
            registrationId={r.id}
            userEmail={userEmail}
            initialPickedUp={r.picked_up ?? false}
            initialPickedUpAt={r.picked_up_at ?? null}
            initialPickedUpBy={r.picked_up_by ?? null}
            locationName={r.location_name ?? null}
          />

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

        {/* Object image — shown when available, otherwise offer upload/Wikipedia */}
        {r.product_image_url ? (
          <div style={{ marginBottom: 'var(--ob-space-10)' }}>
            <img
              src={r.product_image_url}
              alt={r.manual_product_name ?? 'Object'}
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <DeadObjectImageSection
            registrationId={r.id}
            objectName={r.manual_product_name || bio?.object_name || 'object'}
            brand={r.manual_brand}
          />
        )}

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

            {/* Supply chain trace — biography_version >= 2 */}
            {bio.supply_chain_trace && bio.supply_chain_trace.length > 0 && (
              <Section title="Supply chain trace">
                <div style={{ border: '1px solid var(--ob-rule)' }}>
                  {bio.supply_chain_trace.map((s, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '28px 1fr',
                      borderBottom: i < bio.supply_chain_trace!.length - 1 ? '1px solid var(--ob-rule)' : 'none',
                    }}>
                      <div style={{
                        borderRight: '1px solid var(--ob-rule)',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                        paddingTop: 'var(--ob-space-3)',
                      }}>
                        <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-caption)', color: 'var(--ob-fg-faint)' }}>
                          {i + 1}
                        </span>
                      </div>
                      <div style={{ padding: 'var(--ob-space-3) var(--ob-space-4)' }}>
                        <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 2 }}>
                          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg)' }}>
                            {s.stage}
                          </span>
                          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: s.location.toLowerCase() === 'undisclosed' ? 'var(--ob-red)' : 'var(--ob-fg-dim)' }}>
                            {s.location}
                          </span>
                          <ConfidenceTag tier={s.confidence_tier} />
                        </div>
                        <p style={{ ...narrativeStyle, fontSize: 'var(--ob-fs-meta)' }}>{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Material passport — biography_version >= 2 */}
            {bio.material_passport && bio.material_passport.length > 0 && (
              <Section title="Material passport">
                <div style={{ border: '1px solid var(--ob-rule)' }}>
                  {bio.material_passport.map((m, i) => (
                    <div key={i} style={{
                      padding: 'var(--ob-space-3) var(--ob-space-4)',
                      borderBottom: i < bio.material_passport!.length - 1 ? '1px solid var(--ob-rule)' : 'none',
                    }}>
                      <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 2 }}>
                        <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)' }}>
                          {m.material}
                        </span>
                        <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)' }}>
                          {m.component} · {m.est_weight}
                        </span>
                        <span style={{
                          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-caption)',
                          letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                          color: m.recyclable ? '#4CAF50' : 'var(--ob-red)',
                          marginLeft: 'auto',
                        }}>
                          {m.recyclable ? 'Recoverable' : 'Lost'}
                        </span>
                      </div>
                      <p style={{ ...narrativeStyle, fontSize: 'var(--ob-fs-meta)' }}>
                        {m.likely_origin}
                        {m.recovery_note ? ` — ${m.recovery_note}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Repair economics — biography_version >= 2 */}
            {bio.repair_economics && (
              <Section title="Repair economics">
                <div style={{ border: '1px solid var(--ob-rule)', borderLeft: '3px solid var(--ob-red)', padding: 'var(--ob-space-4) var(--ob-space-5)' }}>
                  <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', display: 'block', marginBottom: 'var(--ob-space-4)' }}>
                    {bio.repair_economics.verdict}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--ob-space-8)', flexWrap: 'wrap' }}>
                    <MetaItem label="Repair" value={bio.repair_economics.repair_cost} />
                    <MetaItem label="Replacement" value={bio.repair_economics.replacement_cost} />
                    <MetaItem label="Repair time" value={bio.repair_economics.repair_time} />
                    <MetaItem label="Parts" value={bio.repair_economics.parts_availability} />
                  </div>
                </div>
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

function ConfidenceTag({ tier }: { tier: string }) {
  const color = tier === 'verified' ? '#4CAF50' : tier === 'inferred' ? '#FF9800' : 'var(--ob-fg-faint)'
  return (
    <span style={{
      fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-caption)',
      letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color,
    }}>
      {tier}
    </span>
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
