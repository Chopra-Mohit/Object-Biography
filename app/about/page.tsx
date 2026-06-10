import { createServerSupabaseClient } from '@/lib/supabase/server'
import InnerNav from '@/components/InnerNav'
import {
  barcelonaNow, zonesForWeekday, WEEKDAY_NAMES, WEEKDAY_COLORS, BARCELONA_ZONES,
} from '@/lib/barcelona/zones'

export const metadata = {
  title: 'Who is it for? — Object Biography',
  description: "Object Biography was built on one observation: most domestic objects are designed to fail. This page explains who it’s for and why.",
}

export const dynamic = 'force-dynamic'

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

const personas = [
  {
    title: 'The Consumer',
    desc: 'You bought something. It broke. You suspected it wasn\'t your fault — and you were right.',
    detail: 'Object Biography gives you the evidence: the design decision that caused the failure, named and dated. The result is a death certificate worth keeping — and, sometimes, sharing.',
    cta: { label: 'Register a dead object', href: '/register' },
  },
  {
    title: 'The Finder',
    desc: 'You walk streets on collection nights. You\'ve learned that what one household discards, another can live with for a decade.',
    detail: 'You need an instant verdict on what\'s worth carrying home, a map of what\'s already been spotted, and a zone calendar so you never miss your night. The platform handles all three.',
    cta: { label: 'Assess a found object', href: '/salvage' },
  },
  {
    title: 'The Researcher',
    desc: 'You\'re building the case for right-to-repair legislation, or documenting planned obsolescence. You need citable evidence — not anecdote.',
    detail: 'The registry produces structured data: failure types, confidence tiers, design decisions, material records. It\'s designed to be exportable and arguable.',
    cta: { label: 'Browse the registry', href: '/registry' },
  },
  {
    title: 'The Institution',
    desc: 'You run a repair café, a design school, or a policy unit. You want Object Biography at scale — as a workshop tool, a documentation layer, a civic archive.',
    detail: 'Bulk registration, structured datasets, and the full biography output for pedagogical and advocacy use. The registry becomes yours.',
    cta: null,
  },
]

export default async function WhoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { weekday } = barcelonaNow()
  const tonightZones = zonesForWeekday(weekday)

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

          {/* ── The Argument ────────────────────────────────────────────────── */}
          <section style={{ paddingBottom: 'var(--ob-space-12)', borderBottom: '1px solid var(--ob-rule)' }}>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-6)' }}>
              Object Biography
            </span>
            <p style={{
              ...mono,
              fontSize: 'clamp(1.35rem, 2.4vw, 1.8rem)',
              fontWeight: 400,
              color: 'var(--ob-fg)',
              lineHeight: 1.45,
              marginBottom: 'var(--ob-space-6)',
            }}>
              Most domestic objects are designed to fail. That decision is made upstream —
              never disclosed, never named,{' '}
              <em style={{ fontStyle: 'normal', borderBottom: '1px solid var(--ob-fg-dim)' }}>
                and never your fault.
              </em>
            </p>
            <p style={{
              ...mono,
              fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg-dim)',
              lineHeight: 'var(--ob-lh-relaxed)',
            }}>
              Object Biography names it. For every broken object registered here, the platform
              traces the supply chain, identifies the specific design decision that caused the
              failure, and produces a record worth keeping. The premise is that accountability
              begins with documentation.
            </p>
          </section>

          {/* ── Personas ────────────────────────────────────────────────────── */}
          <section style={{ paddingTop: 'var(--ob-space-10)', paddingBottom: 'var(--ob-space-12)', borderBottom: '1px solid var(--ob-rule)' }}>
            <p style={{
              ...mono,
              fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-faint)',
              marginBottom: 'var(--ob-space-10)',
            }}>
              Four kinds of people use this.
            </p>

            {personas.map((p, i) => (
              <div
                key={p.title}
                style={{
                  paddingBottom: 'var(--ob-space-8)',
                  marginBottom: i < personas.length - 1 ? 'var(--ob-space-8)' : 0,
                  borderBottom: i < personas.length - 1 ? '1px solid var(--ob-rule)' : 'none',
                }}
                className="ob-who-row"
              >
                {/* Left — title + description */}
                <div>
                  <span style={{
                    ...mono,
                    display: 'block',
                    fontSize: 'var(--ob-fs-caption)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--ob-fg-faint)',
                    marginBottom: 'var(--ob-space-3)',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 style={{
                    ...mono,
                    fontSize: 'clamp(1.4rem, 2vw, 1.9rem)',
                    fontWeight: 400,
                    color: 'var(--ob-fg)',
                    lineHeight: 1.15,
                    marginBottom: 'var(--ob-space-4)',
                  }}>
                    {p.title}
                  </h2>
                  <p style={{
                    ...mono,
                    fontSize: 'var(--ob-fs-small)',
                    color: 'var(--ob-fg)',
                    lineHeight: 'var(--ob-lh-relaxed)',
                    margin: 0,
                  }}>
                    {p.desc}
                  </p>
                </div>

                {/* Right — detail + optional CTA */}
                <div style={{ paddingTop: 'calc(var(--ob-fs-caption) + 0.2em + var(--ob-space-3) + 0.5rem)' }}>
                  <p style={{
                    ...mono,
                    fontSize: '12.5px',
                    color: 'var(--ob-fg-dim)',
                    lineHeight: 1.75,
                    margin: '0 0 var(--ob-space-5)',
                  }}>
                    {p.detail}
                  </p>
                  {p.cta && (
                    <a href={p.cta.href} style={{
                      ...mono,
                      fontSize: 'var(--ob-fs-meta)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--ob-fg-dim)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--ob-rule)',
                      paddingBottom: 2,
                      transition: 'color 0.15s',
                    }}>
                      {p.cta.label} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* ── Barcelona addendum ──────────────────────────────────────────── */}
          <section style={{ paddingTop: 'var(--ob-space-10)' }}>
            <p style={{
              ...mono,
              fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-faint)',
              marginBottom: 'var(--ob-space-8)',
            }}>
              And if you're in Barcelona —
            </p>

            <div className="ob-who-row">
              <div>
                <h2 style={{
                  ...mono,
                  fontSize: 'clamp(1.4rem, 2vw, 1.9rem)',
                  fontWeight: 400,
                  color: 'var(--ob-fg)',
                  lineHeight: 1.2,
                  marginBottom: 'var(--ob-space-5)',
                }}>
                  Every weekday night, the city puts its furniture on the street.
                </h2>
                <p style={{
                  ...mono,
                  fontSize: 'var(--ob-fs-small)',
                  color: 'var(--ob-fg-dim)',
                  lineHeight: 'var(--ob-lh-relaxed)',
                  marginBottom: 'var(--ob-space-6)',
                }}>
                  Barcelona's "Recollida de Mobles i Trastos" rotates zone by zone —
                  sofas, chairs, shelves out at 20:00, truck overnight. Object Biography
                  maps the zones, emails you on your zone's morning, and runs a live
                  community feed of what the neighbourhood is finding.
                </p>
                <a href="/barcelona" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  {tonightZones.length > 0
                    ? `Tonight: ${tonightZones.map(z => z.name).join(', ')} →`
                    : 'Open the Barcelona map →'}
                </a>
              </div>

              {/* Week rotation strip */}
              <div style={{ border: '1px solid var(--ob-rule)' }}>
                {[1, 2, 3, 4, 5].map(day => {
                  const isToday = day === weekday
                  return (
                    <div key={day} style={{
                      display: 'flex', gap: 'var(--ob-space-3)', alignItems: 'baseline',
                      padding: 'var(--ob-space-2) var(--ob-space-4)',
                      borderBottom: day < 5 ? '1px solid var(--ob-rule)' : 'none',
                      background: isToday ? 'rgba(255,255,255,0.025)' : 'transparent',
                    }}>
                      <span style={{
                        width: 7, height: 7, flexShrink: 0, alignSelf: 'center',
                        background: WEEKDAY_COLORS[day], opacity: isToday ? 1 : 0.45,
                      }} />
                      <span style={{
                        ...mono, fontSize: 'var(--ob-fs-caption)',
                        letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                        color: isToday ? 'var(--ob-fg)' : 'var(--ob-fg-dim)',
                        width: 80, flexShrink: 0,
                      }}>
                        {WEEKDAY_NAMES[day]}{isToday ? ' ●' : ''}
                      </span>
                      <span style={{ ...mono, fontSize: '11px', color: isToday ? 'var(--ob-fg-dim)' : 'var(--ob-fg-faint)', lineHeight: 1.55 }}>
                        {BARCELONA_ZONES.filter(z => z.weekday === day).map(z => z.name).join(', ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
