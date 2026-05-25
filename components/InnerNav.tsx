'use client'

import { useState, useEffect } from 'react'

type CurrentPage = 'salvage' | 'register' | 'other'

interface Props {
  currentPage?: CurrentPage
}

export default function InnerNav({ currentPage = 'other' }: Props) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change (any link click)
  function closeMenu() { setMenuOpen(false) }

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
      <a href="/" style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-stamp)',
        textTransform: 'uppercase',
        color: 'var(--ob-fg)',
        textDecoration: 'none',
      }}>
        Object Biography
      </a>

      {/* Hamburger button — visible only on ≤ 500px via CSS */}
      <button
        className="ob-innernav-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '18px',
          color: 'var(--ob-fg)',
          lineHeight: 1,
        }}
      >
        {menuOpen ? '×' : '≡'}
      </button>

      {/* Right links — hidden on mobile, replaced by hamburger dropdown */}
      <div
        className={`ob-innernav-links${menuOpen ? ' ob-menu-open' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-8)' }}
      >

        {/* Show generic "Assess object" only on pages that aren't salvage or register.
            The register page gets its own "Assess a found object" link below instead. */}
        {currentPage === 'other' && (
          <a href="/salvage" style={linkStyle} onClick={closeMenu}>Assess object</a>
        )}

        {/* Show "Register →" button everywhere except on the register page itself.
            On the salvage page, swap it for the register CTA (primary action). */}
        {currentPage === 'salvage' && (
          <a href="/register" className="ob-button" onClick={closeMenu}
             style={{ textDecoration: 'none', padding: '6px 14px', fontSize: 'var(--ob-fs-meta)' }}>
            Register an object →
          </a>
        )}

        {/* Show "Assess a found object" as a text link on the register page */}
        {currentPage === 'register' && (
          <a href="/salvage" style={linkStyle} onClick={closeMenu}>Assess a found object</a>
        )}

        <a href="/registry" style={linkStyle} onClick={closeMenu}>Registry</a>
        <a href="/account"  style={linkStyle} onClick={closeMenu}>Account</a>

        {/* Show "Register →" button on all pages except register and salvage (which handle it above) */}
        {currentPage === 'other' && (
          <a href="/register" className="ob-button" onClick={closeMenu}
             style={{ textDecoration: 'none', padding: '6px 14px', fontSize: 'var(--ob-fs-meta)' }}>
            Register →
          </a>
        )}

      </div>
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
}
