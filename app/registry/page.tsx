import { createServerSupabaseClient } from '@/lib/supabase/server'
import ObjectCard from '@/components/registry/ObjectCard'
import GlobalRegistryView from '@/components/registry/GlobalRegistryView'
import type { RegistrationRow } from '@/components/registry/ObjectCard'
import MoteAssistant from '@/components/MoteAssistant'
import InnerNav from '@/components/InnerNav'

export const metadata = {
  title: 'Registry — Object Biography',
  description: 'Browse the community registry of dead and found objects.',
}

type ViewType = 'mine' | 'all' | 'dead' | 'found'

interface Props {
  searchParams: Promise<{ view?: string }>
}

export default async function RegistryPage({ searchParams }: Props) {
  const params = await searchParams
  const raw    = params.view
  const view: ViewType =
    raw === 'all' || raw === 'dead' || raw === 'found' || raw === 'mine' ? raw : 'all'

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's own objects only when signed in
  let registrations: RegistrationRow[] = []
  if (user) {
    const { data } = await supabase
      .from('registrations')
      .select('*, certificates(share_token)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    registrations = (data ?? []) as RegistrationRow[]
  }

  const total    = registrations.length
  const withBio  = registrations.filter(r => r.biography_generated).length
  const withCert = registrations.filter(r => r.certificates?.length > 0).length

  // Pattern detection on own objects
  const failureCounts: Record<string, number> = {}
  for (const r of registrations) {
    const bio = r.biography_json as { death?: { failure_type?: string } } | null
    const ft  = bio?.death?.failure_type
    if (ft) failureCounts[ft] = (failureCounts[ft] ?? 0) + 1
  }
  const topFailure = Object.entries(failureCounts).sort((a, b) => b[1] - a[1])[0]

  const isGlobalView = view === 'all' || view === 'dead' || view === 'found'

  return (
    <>
      <InnerNav />
      <main style={{
        minHeight: '100vh',
        background: 'var(--ob-bg)',
        paddingTop: 'calc(52px + var(--ob-space-12))',
        paddingBottom: 'var(--ob-space-20)',
      }}>
        <div className="ob-container">

          <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 'var(--ob-space-6)', marginBottom: 'var(--ob-space-8)',
          }}>
            <div>
              <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Registry</span>
              <h1 style={{
                fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-display)',
                fontWeight: 'var(--ob-fw-regular)', color: 'var(--ob-fg)',
                lineHeight: 'var(--ob-lh-snug)', margin: 0,
              }}>
                {view === 'dead'  ? 'Dead objects'
               : view === 'found' ? 'Found objects'
               : view === 'mine'  ? (total === 0 ? 'No objects registered' : `${total} object${total !== 1 ? 's' : ''} on record`)
               :                    'Community registry'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap' }}>
              <a href="/salvage" className="ob-button--ghost ob-button" style={{ textDecoration: 'none' }}>
                Assess found object
              </a>
              <a href="/register" className="ob-button--ghost ob-button" style={{ textDecoration: 'none' }}>
                Register dead object
              </a>
            </div>
          </div>

          {/* ── Tab bar ─────────────────────────────────────────────────────── */}
          <div
            className="ob-tabs-row"
            style={{
              display: 'flex', gap: 0,
              borderBottom: '1px solid var(--ob-rule)',
              marginBottom: 'var(--ob-space-8)',
              overflowX: 'auto',
            }}
          >
            <TabLink href="/registry?view=all"   label="All"           active={view === 'all'} />
            <TabLink href="/registry?view=dead"  label="Dead objects"  active={view === 'dead'} />
            <TabLink href="/registry?view=found" label="Found objects" active={view === 'found'} />
            <TabLink
              href={user ? '/registry?view=mine' : '/auth/login?next=/registry?view=mine'}
              label={user ? `My objects${total > 0 ? ` (${total})` : ''}` : 'My objects'}
              active={view === 'mine'}
              dim={!user}
            />
          </div>

          {/* ── GLOBAL TABS ──────────────────────────────────────────────────── */}
          {isGlobalView && (
            <>
              <p style={{
                fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
                color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
                maxWidth: 560, marginBottom: 'var(--ob-space-8)',
              }}>
                {view === 'found'
                  ? 'Objects found and assessed by the community. What people picked up, and whether it was worth it.'
                  : view === 'dead'
                  ? 'Objects registered as dead. What broke, how it broke, and what the design decision behind it was.'
                  : 'The full community record. Dead objects, found objects, patterns across households.'}
              </p>
              <GlobalRegistryView type={view} />
            </>
          )}

          {/* ── MY OBJECTS TAB ─────────────────────────────────────────────── */}
          {view === 'mine' && !user && (
            <div style={{ paddingTop: 'var(--ob-space-20)' }}>
              <p style={{
                fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)',
                color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
                marginBottom: 'var(--ob-space-8)', maxWidth: 440,
              }}>
                Sign in to see your own registered objects and track patterns across your household.
              </p>
              <a href="/auth/login?next=/registry?view=mine" className="ob-button" style={{ textDecoration: 'none' }}>
                Sign in →
              </a>
            </div>
          )}

          {view === 'mine' && user && (
            <>
              {/* Stats */}
              {total > 0 && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--ob-space-4)', marginBottom: 'var(--ob-space-8)',
                }}>
                  <StatBox label="Objects registered"  value={String(total)} />
                  <StatBox label="Biographies written" value={`${withBio} / ${total}`} />
                  <StatBox label="Certificates filed"  value={`${withCert} / ${total}`} />
                </div>
              )}

              {/* Pattern callout */}
              {topFailure && topFailure[1] > 1 && (
                <div style={{
                  border: '1px solid var(--ob-rule)', borderLeft: '3px solid var(--ob-red)',
                  padding: 'var(--ob-space-4) var(--ob-space-5)', marginBottom: 'var(--ob-space-10)',
                  display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
                }}>
                  <span className="ob-eyebrow" style={{ color: 'var(--ob-red)', flexShrink: 0 }}>Pattern detected</span>
                  <span style={{
                    fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)',
                    color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-relaxed)',
                  }}>
                    {topFailure[1]} of your {total} registered object{total !== 1 ? 's' : ''} share the same failure mode:{' '}
                    <em>{topFailure[0]}</em>
                  </span>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

              {/* Empty state */}
              {total === 0 && (
                <div style={{ paddingTop: 'var(--ob-space-20)' }}>
                  <p style={{
                    fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)',
                    color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)',
                    marginBottom: 'var(--ob-space-8)', maxWidth: 440,
                  }}>
                    Nothing registered yet. When something breaks, this is where the record starts.
                  </p>
                  <a href="/register" className="ob-button" style={{ textDecoration: 'none' }}>
                    Register your first object →
                  </a>
                </div>
              )}

              {/* Card grid */}
              {total > 0 && (
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ob-space-5)' }}
                  className="ob-registry-grid"
                >
                  {registrations.map(r => (
                    <ObjectCard key={r.id} registration={r} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>

        <MoteAssistant context="home" />
      </main>
    </>
  )
}

// ── Server-only sub-components ────────────────────────────────────────────────

function TabLink({ href, label, active, dim }: { href: string; label: string; active: boolean; dim?: boolean }) {
  return (
    <a
      href={href}
      style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: active ? 'var(--ob-fg)' : dim ? 'var(--ob-fg-dim)' : 'var(--ob-fg-dim)',
        opacity: dim && !active ? 0.45 : 1,
        textDecoration: 'none',
        padding: 'var(--ob-space-3) var(--ob-space-5)',
        borderBottom: active ? '2px solid var(--ob-fg)' : '2px solid transparent',
        marginBottom: '-1px',
        transition: 'color 0.15s, border-color 0.15s',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </a>
  )
}

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
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-h3)', color: 'var(--ob-fg)', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  )
}
