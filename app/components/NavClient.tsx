'use client'

import { useState } from 'react'

interface Props {
  displayName: string | null
}

export default function NavClient({ displayName }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)
  const accountHref  = displayName ? '/account' : '/auth/login'
  const accountLabel = displayName ?? 'Sign in'

  return (
    <nav className="ob-nav" style={{ height: '52px', padding: '0 var(--ob-space-8)' }}>

      {/* Logo + Barcelona badge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
        <a className="ob-nav__logo" href="/">Object Biography</a>
        <a href="/barcelona" style={barcelonaChipStyle}>● BCN</a>
      </div>

      {/* Hamburger — visible only on mobile (≤ 760px) */}
      <button
        className="ob-nav-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        style={{
          background: 'none',
          border: '1px solid var(--ob-rule)',
          cursor: 'pointer',
          fontSize: '20px',
          color: 'var(--ob-fg)',
          fontFamily: 'var(--ob-font-mono)',
          lineHeight: 1,
          padding: '6px 10px',
          minWidth: '40px',
          textAlign: 'center',
        }}
      >
        {menuOpen ? '×' : '≡'}
      </button>

      {/* Centre links — hidden on mobile, shown in dropdown when open */}
      <div
        className={`ob-nav-links${menuOpen ? ' ob-nav-menu-open' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-5)', flex: 1, justifyContent: 'center' }}
      >
        <a href="/registry" onClick={closeMenu} style={linkStyle}>Registry</a>
        <a href="/salvage"  onClick={closeMenu} style={actionBtnStyle}>Assess found object</a>
        <a href="/register" onClick={closeMenu} style={actionBtnStyle}>Register dead object</a>
        <a href="/about" onClick={closeMenu} style={linkStyle}>Who is it for?</a>
        {/* Account — appears inside dropdown on mobile only */}
        <a href={accountHref} onClick={closeMenu} className="ob-nav-account-dropdown" style={linkStyle}>
          {accountLabel}
        </a>
      </div>

      {/* Account — pinned right in nav bar on desktop only */}
      <a href={accountHref} className="ob-nav-account-bar" style={accountStyle}>
        {accountLabel}
      </a>

    </nav>
  )
}

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg-dim)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

const actionBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg)',
  textDecoration: 'none',
  border: '1px solid var(--ob-rule)',
  padding: '6px 14px',
  whiteSpace: 'nowrap',
}

const barcelonaChipStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: '8px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--ob-red)',
  textDecoration: 'none',
  border: '1px solid var(--ob-red)',
  padding: '2px 6px',
  display: 'inline-block',
  lineHeight: 1.5,
  opacity: 0.85,
}

const accountStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg-dim)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}
