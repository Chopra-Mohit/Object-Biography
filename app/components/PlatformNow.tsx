const tiles = [
  {
    action: 'Register a dead object',
    href: '/register',
    body: 'Name what broke. Mote generates a full material biography — supply chain, cause of death, repair economics — and a shareable death certificate.',
    cta: 'Register now',
    accent: false,
    primary: true,
  },
  {
    action: 'Assess something found',
    href: '/salvage',
    body: 'Photograph anything abandoned. Get a component-by-component salvage verdict in seconds. No account needed.',
    cta: 'Assess object',
    accent: false,
    primary: false,
  },
  {
    action: 'Barcelona collection nights',
    href: '/barcelona',
    body: 'Zone map, morning email alerts, and live street reports for Barcelona\'s weekly bulky-waste collection. Every weekday, somewhere in the city.',
    cta: 'Open map',
    accent: true,
    primary: false,
  },
  {
    action: 'The registry',
    href: '/registry',
    body: 'Every dead object on record. Every found object pinned on the map. Signed-in users see their household\'s failure pattern across every registration.',
    cta: 'Browse registry',
    accent: false,
    primary: false,
  },
]

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

export default function PlatformNow() {
  return (
    <section id="platform" style={{ padding: '5rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">

        <div style={{
          display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <span className="ob-eyebrow">03 — What you can do</span>
        </div>

        <div className="ob-platform-tiles">
          {tiles.map(tile => (
            <a
              key={tile.action}
              href={tile.href}
              className="ob-platform-tile"
              style={{
                borderColor: tile.accent ? 'var(--ob-red)' : 'var(--ob-rule)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ flex: 1 }}>
                <span style={{
                  ...mono,
                  display: 'block',
                  fontSize: 'var(--ob-fs-small)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: tile.accent ? 'var(--ob-red)' : 'var(--ob-fg)',
                  marginBottom: 'var(--ob-space-3)',
                  fontWeight: 400,
                }}>
                  {tile.action}
                </span>
                <p style={{
                  ...mono,
                  fontSize: '12.5px',
                  color: 'var(--ob-fg-dim)',
                  lineHeight: 1.75,
                  margin: 0,
                }}>
                  {tile.body}
                </p>
              </div>
              <span style={{
                ...mono,
                display: 'block',
                marginTop: 'var(--ob-space-5)',
                fontSize: 'var(--ob-fs-meta)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: tile.accent ? 'var(--ob-red)' : 'var(--ob-fg-dim)',
              }}>
                {tile.cta} →
              </span>
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}
