import { createServerSupabaseClient } from '@/lib/supabase/server'

// Server component — reads auth state to show Sign in vs Account.
// Scroll-section links (How It Works, Who It's For) are intentionally
// absent; users reach those by scrolling the homepage.

export default async function Nav() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="ob-nav">
      <a className="ob-nav__logo" href="/">Object Biography</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-6)' }}>

        <a href="/registry" style={linkStyle}>Registry</a>

        {user ? (
          <a href="/account" style={linkStyle}>Account</a>
        ) : (
          <a href="/auth/login" style={linkStyle}>Sign in</a>
        )}

        <a href="/salvage" style={{ ...btnStyle, ...btnGhostStyle }}>
          Assess a found object
        </a>

        <a href="/register" style={btnStyle}>
          Register an object →
        </a>

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

const btnStyle: React.CSSProperties = {
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg)',
  textDecoration: 'none',
  border: '1px solid var(--ob-fg)',
  padding: '6px 14px',
}

const btnGhostStyle: React.CSSProperties = {
  color: 'var(--ob-fg-dim)',
  border: '1px solid var(--ob-rule)',
}
