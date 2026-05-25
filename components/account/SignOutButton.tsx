'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: 'var(--ob-fg-dim)',
        background: 'none',
        border: '1px solid var(--ob-rule)',
        padding: '8px 16px',
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.5 : 1,
        transition: 'border-color 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--ob-fg-dim)'
        e.currentTarget.style.color = 'var(--ob-fg)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--ob-rule)'
        e.currentTarget.style.color = 'var(--ob-fg-dim)'
      }}
    >
      {loading ? 'Signing out...' : 'Sign out →'}
    </button>
  )
}
