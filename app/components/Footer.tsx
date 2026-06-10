const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

const links = [
  { label: 'Registry',             href: '/registry' },
  { label: 'Assess found object',  href: '/salvage' },
  { label: 'Register dead object', href: '/register' },
  { label: 'Barcelona',            href: '/barcelona' },
  { label: 'Who is it for?',       href: '/about' },
]

export default function Footer() {
  return (
    <footer style={{
      ...mono,
      background: 'var(--ob-bg)',
      borderTop: '1px solid var(--ob-rule)',
      padding: 'var(--ob-space-8) var(--ob-space-12)',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 'var(--ob-space-10)',
      alignItems: 'center',
    }} className="ob-footer-outer">

      {/* Brand block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-1)' }}>
        <span style={{
          fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-stamp)',
          textTransform: 'uppercase',
          color: 'var(--ob-fg)',
        }}>
          Object Biography
        </span>
        <span style={{
          fontSize: '11px',
          letterSpacing: '0.08em',
          color: 'var(--ob-fg-faint)',
        }}>
          Barcelona, 2026 &nbsp;·&nbsp; Civic technology for material accountability
        </span>
      </div>

      {/* Links */}
      <ul style={{
        display: 'flex',
        gap: 'var(--ob-space-6)',
        listStyle: 'none',
        margin: 0, padding: 0,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }} className="ob-footer-links">
        {links.map(l => (
          <li key={l.href}>
            <a href={l.href} className="ob-footer-link" style={{
              ...mono,
              fontSize: 'var(--ob-fs-meta)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-dim)',
              textDecoration: 'none',
            }}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>

    </footer>
  )
}
