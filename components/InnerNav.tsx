'use client'

import { useState, useEffect } from 'react'

interface Props {
  userEmail?: string | null   // pass user?.email from each server page
}

export default function InnerNav({ userEmail }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function closeMenu() { setMenuOpen(false) }

  // Show email prefix (e.g. "mohit" from "mohit@gmail.com") when signed in
  const displayName  = userEmail ? userEmail.split('@')[0] : null
  const accountHref  = displayName ? '/account' : '/auth/login'
  const accountLabel = displayName ?? 'Sign in'

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--ob-space-8)',
      background: scrolled ? 'rgba(27,27,23,0.96)' : 'var(--ob-bg)',
      borderBottom: `1px solid ${scrolled ? 'var(--ob-rule)' : 'transparent'}`,
      transition: 'background 0.2s ease, border-color 0.2s ease',
    }}>

      {/* Logo */}
      <a href="/" style={logoStyle}>Object Biography</a>

      {/* Hamburger — visible on narrow screens (≤ 640px) */}
      <button
        className="ob-innernav-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        style={{
          background: 'none',
          border: '1px solid var(--ob-rule)',
          cursor: 'pointer',
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '20px',
          color: 'var(--ob-fg)',
          lineHeight: 1,
          padding: '6px 10px',
          minWidth: '40px',
          textAlign: 'center',
        }}
      >
        {menuOpen ? '×' : '≡'}
      </button>

      {/* Centre links + account — hidden on mobile, shown in dropdown */}
      <div
        className={`ob-innernav-links${menuOpen ? ' ob-menu-open' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-5)', flex: 1, justifyContent: 'center' }}
      >
        <a href="/registry" style={linkStyle} onClick={closeMenu}>Registry</a>
        <a href="/salvage"  style={actionBtnStyle} onClick={closeMenu}>Assess found object</a>
        <a href="/register" style={actionBtnStyle} onClick={closeMenu}>Register dead object</a>
        {/* Account link — shown inside dropdown on mobile only */}
        <a href={accountHref} style={linkStyle} onClick={closeMenu} className="ob-innernav-account-dropdown">
          {accountLabel}
        </a>
      </div>

      {/* Account — pinned far right in nav bar on desktop only */}
      <a href={accountHref} style={accountStyle} onClick={closeMenu} className="ob-innernav-account-bar">
        {accountLabel}
      </a>

    </nav>
  )
}

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-stamp)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg)',
  textDecoration: 'none',
  flexShrink: 0,
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

// Both action buttons use identical ghost styling — equal visual weight
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
