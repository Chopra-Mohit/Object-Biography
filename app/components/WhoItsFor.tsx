const cards = [
  {
    num: '01 / 04',
    title: 'Consumer',
    desc: 'You bought something. It broke. You suspected it wasn\'t your fault. Now you have the evidence — and a document worth keeping.',
    detail: 'Feels the moral weight of disposal but has no language for it. Suspects planned obsolescence but cannot prove it. Shares things that make the frustration feel legitimate.',
  },
  {
    num: '02 / 04',
    title: 'Finder',
    desc: 'You walk the streets on collection nights. You\'ve learned that what one household discards, another can live with for a decade.',
    detail: 'Street hunters, furniture flippers, repair tinkerers, students furnishing a flat. Needs an instant verdict on what\'s worth carrying home, a map of what\'s out there, and the zone calendar so they never miss their night.',
  },
  {
    num: '03 / 04',
    title: 'Researcher',
    desc: 'You are building the case for right-to-repair or designed obsolescence policy. You need citable, exportable evidence — not anecdote.',
    detail: 'Design researchers, critical designers, sustainability journalists, repair activists. Needs tools that produce outputs a policy argument can use. JSON export. Confidence tiers. Structured datasets.',
  },
  {
    num: '04 / 04',
    title: 'Institution',
    desc: 'You run a design school, repair café, or policy unit. You want Object Biography at scale — as a workshop tool, a documentation layer, a civic archive.',
    detail: 'Bulk registration. API access. Workshop toolkit. Policy export. White-label certificate. The registry becomes yours. Pedagogical and advocacy use at community level.',
  },
]

export default function WhoItsFor() {
  return (
    <section id="who" className="ob-section-padded" style={{ padding: '7rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">
        <span className="ob-eyebrow" style={{ marginBottom: '2.5rem' }}>06 — Who It&apos;s For</span>
        <div
          className="ob-who-grid"
          style={{
            border: '1px solid var(--ob-rule)',
            marginTop: '4rem',
          }}
        >
          {cards.map((card, i) => (
            <div
              key={card.num}
              style={{
                padding: '2.8rem 2.4rem',
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
