const entries = [
  {
    num: '§ 01',
    title: 'The death registry',
    href: '/registry?view=dead',
    body: 'Every dead object on record: what broke, how it broke, and the design decision behind it. Each entry can carry a full material biography and a shareable death certificate.',
  },
  {
    num: '§ 02',
    title: 'Found-object assessments',
    href: '/salvage',
    body: 'Photograph anything abandoned on the street and get a component-by-component salvage verdict in seconds — worth picking up, parts only, recycle, or leave it. No account needed.',
  },
  {
    num: '§ 03',
    title: 'The street map',
    href: '/registry?view=found',
    body: 'Found objects get pinned where they sit. Anyone can see what’s still out there, and whoever takes something home marks it claimed — so the record closes properly.',
  },
  {
    num: '§ 04',
    title: 'Barcelona collection nights',
    href: '/barcelona',
    body: 'Every weekday evening a different part of Barcelona puts its furniture on the street. Zone map, day-of email alerts, and live street reports from the neighbourhood.',
    accent: true,
  },
  {
    num: '§ 05',
    title: 'Household patterns',
    href: '/registry?view=mine',
    body: 'Register what dies in your home and the registry starts noticing: the same failure mode twice, the same component class, the same brand. Evidence accumulates.',
  },
]

export default function PlatformNow() {
  return (
    <section id="platform" className="ob-section-padded" style={{ padding: '6rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="ob-eyebrow">04 — The Platform</span>
          <span style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-small)',
            color: 'var(--ob-fg-dim)',
            letterSpacing: 'var(--ob-ls-wide)',
          }}>
            One record, five ways in.
          </span>
        </div>

        <div style={{ border: '1px solid var(--ob-rule)' }}>
          {entries.map((e, i) => (
            <a
              key={e.num}
              href={e.href}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                textDecoration: 'none',
                borderBottom: i < entries.length - 1 ? '1px solid var(--ob-rule)' : 'none',
              }}
            >
              <div style={{
                borderRight: '1px solid var(--ob-rule)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                paddingTop: '1.6rem',
              }}>
                <span style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: '9px',
                  letterSpacing: '0.18em', color: e.accent ? 'var(--ob-red)' : 'var(--ob-fg-faint)',
                }}>
                  {e.num}
                </span>
              </div>
              <div style={{ padding: '1.5rem 1.8rem 1.6rem' }}>
                <span style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: 'var(--ob-fs-small)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: e.accent ? 'var(--ob-red)' : 'var(--ob-fg)',
                  display: 'block',
                  marginBottom: '0.6rem',
                }}>
                  {e.title} →
                </span>
                <p style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: '12.5px',
                  color: 'var(--ob-fg-dim)',
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: 640,
                }}>
                  {e.body}
                </p>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}
