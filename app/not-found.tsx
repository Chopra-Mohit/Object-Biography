import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Not Found — Object Biography',
}

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--ob-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--ob-space-10)',
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        <span style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
          display: 'block',
          marginBottom: 'var(--ob-space-4)',
        }}>
          404
        </span>

        <h1 style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-display)',
          fontWeight: 'var(--ob-fw-regular)',
          color: 'var(--ob-fg)',
          lineHeight: 'var(--ob-lh-snug)',
          marginBottom: 'var(--ob-space-6)',
        }}>
          Page not found.
        </h1>

        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-small)',
          color: 'var(--ob-fg-dim)',
          lineHeight: 'var(--ob-lh-relaxed)',
          marginBottom: 'var(--ob-space-10)',
        }}>
          This page does not exist or has been moved.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-8)' }} />

        <a href="/" style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
          textDecoration: 'none',
        }}>
          ← Object Biography
        </a>
      </div>
    </main>
  )
}
