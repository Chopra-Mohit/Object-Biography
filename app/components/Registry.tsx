const stackCerts = [
  {
    title: 'Kettle — Russell Hobbs 23210',
    fields: [
      { label: 'Death', value: 'Limescale ingress, heating element' },
      { label: 'Age', value: '2 yrs 4 mo · £34.99 RRP' },
      { label: 'Design', value: 'Single-element, non-descaleable' },
    ],
    rotation: 'rotate(-5deg) translate(-30px, 20px)',
    zIndex: 1,
    opacity: 0.5,
  },
  {
    title: 'Wireless Earbuds — Sony WF-1000XM4',
    fields: [
      { label: 'Death', value: 'Battery degradation, left channel' },
      { label: 'Age', value: '2 yrs 1 mo · €279 RRP' },
      { label: 'Design', value: 'Glued enclosure, no cell access' },
    ],
    rotation: 'rotate(-1.5deg) translate(10px, -10px)',
    zIndex: 2,
    opacity: 0.7,
  },
  {
    title: 'Dyson V11 Cordless Vacuum',
    fields: [
      { label: 'Death', value: 'Battery failure — designed component' },
      { label: 'Age', value: '3 yrs 2 mo · €599 RRP' },
      { label: 'Design', value: 'Non-serviceable battery, glued cell' },
    ],
    rotation: 'rotate(3deg) translate(-5px, 0px)',
    zIndex: 3,
    opacity: 1,
  },
]

export default function Registry() {
  return (
    <section id="registry" style={{ padding: '7rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">
        <span className="ob-eyebrow" style={{ marginBottom: '2.5rem' }}>06 — The Registry</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6rem',
            alignItems: 'start',
            marginTop: '4rem',
          }}
        >
          {/* Left: text */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                lineHeight: 1.25,
                marginBottom: '2rem',
                fontWeight: 400,
              }}
            >
              One certificate is an artifact.<br />Fifteen is a political archive.
            </h2>
            <p
              style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: '13px',
                color: 'var(--ob-fg-dim)',
                lineHeight: 1.75,
                marginBottom: '2rem',
              }}
            >
              The registry is your household as a dataset. Every object you document adds to a
              private ledger of designed failures — which manufacturers appear most, which failure
              modes repeat, which design decisions span a decade and a hundred brands.
            </p>
            <p
              style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: '13px',
                color: 'var(--ob-fg-dim)',
                lineHeight: 1.75,
                marginBottom: '2rem',
              }}
            >
              At scale, across users, the registry becomes something else: evidence. A distributed,
              citizen-sourced record of the decisions that manufacturers make and do not disclose.
            </p>
            <div className="ob-pattern-note">
              Three objects registered in this household were manufactured by the same supplier in
              Guangdong between 2019–2021. All three share the same battery cell configuration.
              All three failed within 6 months of each other.
            </div>
          </div>

          {/* Right: stacked certificate thumbnails */}
          <div
            aria-hidden="true"
            style={{ position: 'relative', height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {stackCerts.map((sc) => (
              <div
                key={sc.title}
                style={{
                  position: 'absolute',
                  background: 'var(--ob-paper)',
                  border: '1px solid #C8C3B0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                  width: 300,
                  height: 220,
                  transform: sc.rotation,
                  zIndex: sc.zIndex,
                  opacity: sc.opacity,
                }}
              >
                <div
                  style={{
                    padding: '1.2rem 1.4rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: '8px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#7A7469',
                      borderBottom: '1px solid #C8C3B0',
                      paddingBottom: '0.5rem',
                      marginBottom: '0.8rem',
                    }}
                  >
                    Object Biography Registry &nbsp;·&nbsp; Certificate of Object Death
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#2A2720',
                      letterSpacing: '0.05em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {sc.title}
                  </div>
                  {sc.fields.map(f => (
                    <div
                      key={f.label}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        fontFamily: 'var(--ob-font-mono)',
                        fontSize: '9px',
                        color: '#5A5550',
                        marginBottom: '0.3rem',
                      }}
                    >
                      <span style={{ color: '#9A9590', letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: 55 }}>{f.label}</span>
                      <span>{f.value}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      right: 16,
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: '#C41E1E',
                      border: '2px solid #C41E1E',
                      padding: '0.15rem 0.4rem',
                      opacity: 0.75,
                      transform: 'rotate(-15deg)',
                    }}
                  >
                    Deceased
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
