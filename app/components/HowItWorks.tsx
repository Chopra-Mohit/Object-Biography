const phases = [
  {
    numeral: 'I',
    name: 'Life',
    body: 'Where it was made and what it cost the world to exist. Supply chain, materials, labour conditions — traced as far as the record goes. Gaps in that record are noted.',
    accent: false,
  },
  {
    numeral: 'II',
    name: 'Death',
    body: 'The specific design decision that made failure likely from the start — named, sourced, and dated. Not user error. The business logic behind it is named too.',
    accent: true,
  },
  {
    numeral: 'III',
    name: 'Second Life',
    body: 'The years taken, not given. What repair would have cost. How many more cycles were possible. What materials can still be recovered from what remains.',
    accent: false,
  },
]

export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: '5rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">

        <div style={{
          display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <span className="ob-eyebrow">02 — How it works</span>
          <span style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-small)',
            color: 'var(--ob-fg-dim)',
            letterSpacing: 'var(--ob-ls-wide)',
          }}>
            Every biography has three acts.
          </span>
        </div>

        <div className="ob-how-cards">
          {phases.map((phase, i) => (
            <div
              key={phase.numeral}
              className="ob-how-card"
              style={{
                borderRight: i < phases.length - 1 ? '1px solid var(--ob-rule)' : 'none',
              }}
            >
              <span style={{
                display: 'block',
                fontFamily: 'var(--ob-font-mono)',
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: phase.accent ? 'var(--ob-red)' : 'var(--ob-fg-faint)',
                marginBottom: '1.4rem',
              }}>
                {phase.numeral}
              </span>

              <div style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: 'clamp(2rem, 2.8vw, 2.8rem)',
                fontWeight: 400,
                color: phase.accent ? 'var(--ob-red)' : 'var(--ob-fg)',
                lineHeight: 1.05,
                marginBottom: '1.4rem',
                letterSpacing: '-0.01em',
              }}>
                {phase.name}
              </div>

              <p style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: '12.5px',
                color: 'var(--ob-fg-dim)',
                lineHeight: 1.75,
                margin: 0,
              }}>
                {phase.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
