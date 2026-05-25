const phases = [
  {
    numeral: 'I',
    name: 'Life',
    body: 'Where it was made. What it cost the world to exist. Supply chain, materials, labour conditions — traced as far as the record goes. Most manufacturers have not released this data. That absence is noted.',
    quote: '"Manufactured in Malaysia, 2020. Battery cells sourced from CATL, Ningde, China. Lithium-ion pack rated at 500–800 charge cycles — approximately 18–24 months of daily use."',
    accent: false,
    note: null,
  },
  {
    numeral: 'II',
    name: 'Death',
    body: 'Why it really failed. Not user error. Not bad luck. The specific design decision — named, sourced, and dated — that made this outcome likely from the start. The business logic behind it is named too.',
    quote: '"Decision to use non-user-serviceable battery made at design stage, 2018. That decision was not disclosed to the consumer at point of sale."',
    accent: true,
    note: null,
  },
  {
    numeral: 'III',
    name: 'Second Life',
    body: 'The life this object was designed never to have. What repair would have cost. How many more years were possible. What materials could still be recovered.',
    quote: '"At that rate, it would have served the same household for an estimated 11 years, consumed 64% less embodied energy, and ended as recoverable components rather than composite waste."',
    accent: false,
    note: 'This chapter belongs to two people. For the owner who registered it, Second Life is a counterfactual — the years that were taken. For whoever finds it abandoned on a street corner and photographs it, Second Life is the question still open: is any of this still possible?',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: '6rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="ob-eyebrow">03 — How It Works</span>
          <span style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-small)',
            color: 'var(--ob-fg-dim)',
            letterSpacing: 'var(--ob-ls-wide)',
          }}>
            Every biography has three acts.
          </span>
        </div>

        {/* Stacked phase rows */}
        <div style={{ border: '1px solid var(--ob-rule)' }}>
          {phases.map((phase, i) => (
            <div
              key={phase.numeral}
              style={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr',
                borderBottom: i < phases.length - 1 ? '1px solid var(--ob-rule)' : 'none',
              }}
            >
              {/* Numeral column */}
              <div style={{
                borderRight: '1px solid var(--ob-rule)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '2.4rem',
              }}>
                <span style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: phase.accent ? 'var(--ob-red)' : 'var(--ob-fg-dim)',
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  opacity: 0.7,
                }}>
                  {phase.numeral}
                </span>
              </div>

              {/* Content column */}
              <div style={{ padding: '2.4rem 2.4rem 2.4rem 2.6rem' }}>

                {/* Phase name — large, commanding */}
                <div style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                  fontWeight: 400,
                  color: phase.accent ? 'var(--ob-red)' : 'var(--ob-fg)',
                  lineHeight: 1.05,
                  marginBottom: '1.8rem',
                  letterSpacing: '-0.01em',
                }}>
                  {phase.name}
                </div>

                {/* Body + quote — two columns */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2.5rem',
                  alignItems: 'start',
                }}>
                  <p style={{
                    fontFamily: 'var(--ob-font-mono)',
                    fontSize: '12.5px',
                    color: 'var(--ob-fg-dim)',
                    lineHeight: 1.75,
                    margin: 0,
                  }}>
                    {phase.body}
                  </p>

                  <blockquote style={{
                    fontFamily: 'var(--ob-font-serif)',
                    fontStyle: 'italic',
                    fontSize: '12px',
                    color: 'var(--ob-fg-dim)',
                    lineHeight: 1.8,
                    borderLeft: `2px solid ${phase.accent ? 'var(--ob-red)' : 'var(--ob-rule)'}`,
                    paddingLeft: '1.2rem',
                    margin: 0,
                    opacity: 0.85,
                  }}>
                    {phase.quote}
                  </blockquote>
                </div>

                {/* Second life note — both perspectives */}
                {phase.note && (
                  <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--ob-rule)',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: '1.2rem',
                    alignItems: 'start',
                  }}>
                    <span style={{
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--ob-fg-dim)',
                      paddingTop: '2px',
                    }}>
                      Note
                    </span>
                    <p style={{
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: '11.5px',
                      color: 'var(--ob-fg-dim)',
                      lineHeight: 1.75,
                      margin: 0,
                    }}>
                      {phase.note}
                    </p>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
