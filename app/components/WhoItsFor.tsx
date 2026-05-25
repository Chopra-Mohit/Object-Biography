const cards = [
  {
    num: '01 / 03',
    title: 'Consumer',
    desc: 'You bought something. It broke. You suspected it wasn\'t your fault. Now you have the evidence — and a document worth keeping.',
    detail: 'Feels the moral weight of disposal but has no language for it. Suspects planned obsolescence but cannot prove it. Shares things that make the frustration feel legitimate.',
    tier: 'Free · Personal €4.99/mo',
  },
  {
    num: '02 / 03',
    title: 'Researcher',
    desc: 'You are building the case for right-to-repair or designed obsolescence policy. You need citable, exportable evidence — not anecdote.',
    detail: 'Design researchers, critical designers, sustainability journalists, repair activists. Needs tools that produce outputs a policy argument can use. JSON export. Confidence tiers. Structured datasets.',
    tier: 'Research €19.99/mo',
  },
  {
    num: '03 / 03',
    title: 'Institution',
    desc: 'You run a design school, repair café, or policy unit. You want Object Biography at scale — as a workshop tool, a documentation layer, a civic archive.',
    detail: 'Bulk registration. API access. Workshop toolkit. Policy export. White-label certificate. The registry becomes yours. Pedagogical and advocacy use at community level.',
    tier: 'Institutional €200–500/mo',
  },
]

export default function WhoItsFor() {
  return (
    <section id="who" style={{ padding: '7rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">
        <span className="ob-eyebrow" style={{ marginBottom: '2.5rem' }}>04 — Who It&apos;s For</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            border: '1px solid var(--ob-rule)',
            marginTop: '4rem',
          }}
        >
          {cards.map((card, i) => (
            <div
              key={card.num}
              style={{
                padding: '2.8rem 2.4rem',
                borderRight: i < cards.length - 1 ? '1px solid var(--ob-rule)' : 'none',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  color: 'var(--ob-fg-dim)',
                  marginBottom: '1.8rem',
                }}
              >
                {card.num}
              </span>
              <div
                style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: '13px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  fontWeight: 400,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: '12.5px',
                  color: 'var(--ob-fg-dim)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                }}
              >
                {card.desc}
              </div>
              <div
                style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: '11px',
                  color: 'var(--ob-fg-faint)',
                  lineHeight: 1.65,
                  borderTop: '1px solid var(--ob-rule)',
                  paddingTop: '1rem',
                }}
              >
                {card.detail}
              </div>
              <span className="ob-tier" style={{ marginTop: '1.2rem' }}>{card.tier}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
