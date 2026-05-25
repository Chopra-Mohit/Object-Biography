import QuickInsightUpload from '@/components/salvage/QuickInsightUpload'
import MoteAssistant from '@/components/MoteAssistant'
import InnerNav from '@/components/InnerNav'

export const metadata = {
  title: 'Quick Insight — Object Biography',
  description: 'Photograph a found or abandoned object. Mote tells you what it is, what can be salvaged, and whether it\'s worth picking up.',
}

export default function SalvagePage() {
  return (
    <>
    <InnerNav currentPage="salvage" />
    <main style={{
      minHeight: '100vh',
      background: 'var(--ob-bg)',
      paddingTop: 'calc(52px + var(--ob-space-12))',
      paddingBottom: 'var(--ob-space-20)',
    }}>
      <div className="ob-container--narrow">

        {/* Back nav */}
        <a href="/" style={{
          display: 'inline-block',
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-stamp)',
          textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
          textDecoration: 'none',
          marginBottom: 'var(--ob-space-12)',
        }}>
          ← Object Biography
        </a>

        <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        {/* Header */}
        <div style={{ marginBottom: 'var(--ob-space-12)' }}>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>
            Quick Insight
          </span>
          <h1 style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-h2)',
            fontWeight: 'var(--ob-fw-regular)',
            color: 'var(--ob-fg)',
            lineHeight: 'var(--ob-lh-tight)',
            marginBottom: 'var(--ob-space-6)',
          }}>
            Found something?
          </h1>
          <p style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-base)',
            color: 'var(--ob-fg-dim)',
            lineHeight: 'var(--ob-lh-loose)',
            maxWidth: '440px',
          }}>
            Photograph a found or abandoned object. Mote will assess what it is, what can be salvaged, and whether it&apos;s worth picking up.
          </p>
          <p style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-small)',
            color: 'var(--ob-fg-dim)',
            lineHeight: 'var(--ob-lh-relaxed)',
            marginTop: 'var(--ob-space-4)',
          }}>
            No account needed.
          </p>
        </div>

        <QuickInsightUpload />

      </div>

      <MoteAssistant context="salvage" />
    </main>
    </>
  )
}
