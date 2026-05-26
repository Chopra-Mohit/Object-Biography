import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { DBRegistration, DBCertificate } from '@/types/database'
import InnerNav from '@/components/InnerNav'
import MoteAssistant from '@/components/MoteAssistant'
import SignOutButton from '@/components/account/SignOutButton'
import DeleteAccountButton from '@/components/account/DeleteAccountButton'
import BiographyPdfButton from '@/components/account/BiographyPdfButton'
import EmailBiographyButton from '@/components/account/EmailBiographyButton'

export const metadata = {
  title: 'Account — Object Biography',
}

type RegistrationDownloadRow = Pick<DBRegistration,
  'id' | 'manual_brand' | 'manual_product_name' | 'biography_generated' | 'biography_json'
> & {
  certificates: Pick<DBCertificate, 'share_token' | 'png_url'>[]
}

function objectLabel(r: RegistrationDownloadRow) {
  return [r.manual_brand, r.manual_product_name].filter(Boolean).join(' ') || 'Unknown object'
}

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/account')

  // Fetch profile
  const { data: profile } = await supabase
    .from('users')
    .select('registry_count')
    .eq('id', user.id)
    .single()

  const registryCount = (profile as { registry_count?: number } | null)?.registry_count ?? 0

  // Fetch registrations for downloads section
  const { data: registrations } = await supabase
    .from('registrations')
    .select('id, manual_brand, manual_product_name, biography_generated, biography_json, certificates(share_token, png_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = (registrations ?? []) as RegistrationDownloadRow[]
  const downloadable = rows.filter(r => r.biography_generated || r.certificates?.length > 0)

  return (
    <>
      <InnerNav userEmail={user?.email ?? null} />
      <main style={{
        minHeight: '100vh',
        background: 'var(--ob-bg)',
        paddingTop: 'calc(52px + var(--ob-space-12))',
        paddingBottom: 'var(--ob-space-20)',
      }}>
        <div className="ob-container">

          <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Header */}
          <div style={{ marginBottom: 'var(--ob-space-10)' }}>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Account</span>
            <h1 style={{
              fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-display)',
              fontWeight: 'var(--ob-fw-regular)', color: 'var(--ob-fg)',
              lineHeight: 'var(--ob-lh-snug)', margin: 0,
            }}>
              Your account
            </h1>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Profile */}
          <section style={{ marginBottom: 'var(--ob-space-12)' }}>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-6)' }}>Profile</span>
            <div style={{
              border: '1px solid var(--ob-rule)',
              padding: 'var(--ob-space-6)',
              display: 'grid',
              gap: 'var(--ob-space-5)',
            }}>
              <ProfileRow label="Email"   value={user.email ?? '—'} />
              <ProfileRow label="Objects" value={`${registryCount} registered`} />
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Downloads */}
          <section style={{ marginBottom: 'var(--ob-space-12)' }}>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>Downloads</span>
            <p style={{
              fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
              maxWidth: 520, margin: '0 0 var(--ob-space-8) 0',
            }}>
              Death certificates as PNG and full biographies as PDF — one per object.
            </p>

            {downloadable.length === 0 ? (
              <p style={{
                fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
                color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
              }}>
                No downloads yet. Register an object and generate a biography to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {downloadable.map((r, i) => {
                  const cert = r.certificates?.[0]
                  return (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 'var(--ob-space-4)',
                        padding: 'var(--ob-space-4) var(--ob-space-5)',
                        borderTop: i === 0 ? '1px solid var(--ob-rule)' : 'none',
                        borderBottom: '1px solid var(--ob-rule)',
                      }}
                    >
                      {/* Object name */}
                      <span style={{
                        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
                        color: 'var(--ob-fg)', flex: 1, minWidth: 160,
                      }}>
                        {objectLabel(r)}
                      </span>

                      {/* Download buttons */}
                      <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap', flexShrink: 0 }}>
                        {/* Certificate PNG */}
                        {cert ? (
                          cert.png_url ? (
                            <a
                              href={cert.png_url}
                              download
                              style={downloadLinkStyle}
                            >
                              Certificate PNG ↓
                            </a>
                          ) : (
                            <a
                              href={`/certificate/${cert.share_token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={downloadLinkStyle}
                            >
                              Certificate ↗
                            </a>
                          )
                        ) : null}

                        {/* Biography PDF — generated client-side */}
                        {r.biography_generated && r.biography_json && (
                          <BiographyPdfButton
                            bio={r.biography_json as import('@/types/database').BiographyJSON}
                            objectName={objectLabel(r)}
                          />
                        )}

                        {/* Email biography */}
                        {r.biography_generated && (
                          <EmailBiographyButton
                            registrationId={r.id}
                            recipientEmail={user.email!}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* JSON export — tertiary option */}
            <div style={{ marginTop: 'var(--ob-space-6)' }}>
              <a
                href="/api/user/export"
                download
                style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
                  letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                  color: 'var(--ob-fg-dim)', textDecoration: 'none',
                  opacity: 0.6,
                }}
              >
                Export all data as JSON →
              </a>
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Sign out */}
          <section style={{ marginBottom: 'var(--ob-space-12)' }}>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Session</span>
            <p style={{
              fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
              maxWidth: 480, margin: '0 0 var(--ob-space-6) 0',
            }}>
              Signed in as {user.email}. Sessions last 60 days.
            </p>
            <SignOutButton />
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Danger zone */}
          <section>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)', color: 'var(--ob-red)' }}>
              Danger zone
            </span>
            <p style={{
              fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
              maxWidth: 480, margin: '0 0 var(--ob-space-6) 0',
            }}>
              Deleting your account removes all registered objects, biographies, and certificates permanently.
            </p>
            <DeleteAccountButton />
          </section>

        </div>
        <MoteAssistant context="home" />
      </main>
    </>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const downloadLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg-dim)',
  textDecoration: 'none',
  border: '1px solid var(--ob-rule)',
  padding: '5px 12px',
  transition: 'border-color 0.15s, color 0.15s',
  whiteSpace: 'nowrap',
}

// ── Server-only sub-component ─────────────────────────────────────────────────

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-6)' }}>
      <span style={{
        fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
        color: 'var(--ob-fg-dim)', minWidth: 80, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)' }}>
        {value}
      </span>
    </div>
  )
}
