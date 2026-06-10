'use client'

import { useState, useEffect } from 'react'

interface Props {
  userEmail?: string | null
}

export default function NavClient({ userEmail }: Props) {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu    = () => setMenuOpen(false)
  const displayName  = userEmail ? userEmail.split('@')[0] : null
  const accountHref  = displayName ? '/account' : '/auth/login'
  const accountLabel = displayName ?? 'Sign in'

  return (
    <nav
      className="ob-nav"
      style={{
        height: '52px',
        padding: '0 var(--ob-space-8)',
        background: scrolled ? 'rgba(27,27,23,0.96)' : 'var(--ob-bg)',
        transition: 'background 0.2s ease',
      }}
    >

      {/* Logo + BCN chip */}
      <div style={{ flexShrink: 0 }}>
        <a className="ob-nav__logo" href="/" style={{ display: 'block' }}>Object Biography</a>
        <a href="/barcelona" style={barcelonaChipStyle}>● BCN</a>
      </div>

      {/* Hamburger — mobile only */}
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

      {/* Centre links */}
      <div
        className={`ob-nav-links${menuOpen ? ' ob-nav-menu-open' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-5)', flex: 1, justifyContent: 'center' }}
      >
        <a href="/registry"  onClick={closeMenu} style={linkStyle}>Registry</a>
        <a href="/salvage"   onClick={closeMenu} style={actionBtnStyle}>Assess found object</a>
        <a href="/register"  onClick={closeMenu} style={actionBtnStyle}>Register dead object</a>
        <a href="/about"     onClick={closeMenu} style={linkStyle}>Who is it for?</a>
        <a href={accountHref} onClick={closeMenu} className="ob-nav-account-dropdown" style={linkStyle}>
          {accountLabel}
        </a>
      </div>

      {/* Account — desktop only */}
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
  display: 'inline-block',   // inline-block shrinks to content; not a flex item
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
