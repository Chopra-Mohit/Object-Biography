import { createServerSupabaseClient } from '@/lib/supabase/server'

// Server component — reads auth state to show name vs Sign in.
export default async function Nav() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Derive a short display name from email (e.g. "mohit@gmail.com" → "mohit")
  const displayName = user?.email
    ? user.email.split('@')[0]
    : null

  return (
    <nav className="ob-nav">
      <a className="ob-nav__logo" href="/">Object Biography</a>

      {/* Centre actions — equal weight */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-5)', flex: 1, justifyContent: 'center' }}>
        <a href="/registry" style={linkStyle}>Registry</a>
        <a href="/salvage" style={actionBtnStyle}>Assess found object</a>
        <a href="/register" style={actionBtnStyle}>Register dead object</a>
      </div>

      {/* Account — always pinned to the far right */}
      {user ? (
        <a href="/account" style={accountStyle}>{displayName}</a>
      ) : (
        <a href="/auth/login" style={linkStyle}>Sign in</a>
      )}
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
