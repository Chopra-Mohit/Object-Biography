export default function Argument() {
  return (
    <section
      id="argument"
      className="ob-section-padded"
      style={{ padding: '7rem 0', borderBottom: '1px solid var(--ob-rule)', textAlign: 'center' }}
    >
      <div className="ob-container">
        <span className="ob-eyebrow" style={{ marginBottom: '2.5rem' }}>02 — The Argument</span>
        <p
          className="ob-editorial"
          style={{ maxWidth: '680px', margin: '0 auto', color: 'var(--ob-fg)' }}
        >
          Most objects are designed to fail. That decision is made upstream,{' '}
          <strong style={{ fontStyle: 'italic', fontWeight: 400 }}>
            never named, and never your fault.
          </strong>{' '}
          Object Biography names it.
        </p>
      </div>
    </section>
  )
}
