type Verdict = 'worth-picking-up' | 'parts-only' | 'recycle-only' | 'leave-it'

const VERDICT_CONFIG: Record<Verdict, { label: string; color: string; bg: string; border: string }> = {
  'worth-picking-up': {
    label: 'Worth picking up',
    color: '#4CAF50',
    bg: 'rgba(76, 175, 80, 0.08)',
    border: 'rgba(76, 175, 80, 0.3)',
  },
  'parts-only': {
    label: 'Parts only',
    color: '#FF9800',
    bg: 'rgba(255, 152, 0, 0.08)',
    border: 'rgba(255, 152, 0, 0.3)',
  },
  'recycle-only': {
    label: 'Recycle only',
    color: '#9C9990',
    bg: 'rgba(156, 153, 144, 0.08)',
    border: 'rgba(156, 153, 144, 0.3)',
  },
  'leave-it': {
    label: 'Leave it',
    color: 'var(--ob-red)',
    bg: 'rgba(196, 30, 30, 0.08)',
    border: 'rgba(196, 30, 30, 0.3)',
  },
}

interface Props {
  verdict: Verdict
  reason: string
}

export default function VerdictBadge({ verdict, reason }: Props) {
  const config = VERDICT_CONFIG[verdict]

  return (
    <div style={{
      border: `1px solid ${config.border}`,
      background: config.bg,
      padding: 'var(--ob-space-6)',
      marginBottom: 'var(--ob-space-8)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-3)', marginBottom: 'var(--ob-space-3)' }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: config.color,
          display: 'inline-block',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-eyebrow)',
          textTransform: 'uppercase',
          color: config.color,
          fontWeight: 600,
        }}>
          {config.label}
        </span>
      </div>
      <p style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-base)',
        color: 'var(--ob-fg)',
        lineHeight: 'var(--ob-lh-relaxed)',
        margin: 0,
      }}>
        {reason}
      </p>
    </div>
  )
}
