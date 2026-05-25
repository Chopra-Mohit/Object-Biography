'use client'

import type { BBox } from '@/lib/anthropic/quickInsightTypes'

export interface AnnotationTarget {
  component: string
  bbox: BBox | null
  type: 'salvageable' | 'non-salvageable'
}

interface Props {
  imageUrl: string
  activeComponent: AnnotationTarget | null
  allComponents: AnnotationTarget[]
}

const SALVAGE = { fill: 'rgba(76,175,80,0.22)', active: 'rgba(76,175,80,0.45)', border: 'rgba(76,175,80,0.85)', tag: 'rgba(76,175,80,0.95)' }
const DAMAGE  = { fill: 'rgba(196,30,30,0.22)',  active: 'rgba(196,30,30,0.45)',  border: 'rgba(196,30,30,0.85)',  tag: 'rgba(196,30,30,0.95)' }

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-meta)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
  color: 'var(--ob-fg-dim)',
  marginBottom: 'var(--ob-space-2)',
  height: '1.4em',            // fixed height so both panels align
  overflow: 'hidden',
  whiteSpace: 'nowrap',
}

export default function AnnotatedImage({ imageUrl, activeComponent, allComponents }: Props) {
  const valid = allComponents.filter(c => c.bbox !== null)
  const hasActive = activeComponent !== null

  return (
    <div className="ob-annotated-image-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ob-space-4)', alignItems: 'start' }}>

      {/* Left — clean original */}
      <div>
        <span style={LABEL_STYLE}>Original</span>
        <img src={imageUrl} alt="Assessed object" style={{ width: '100%', display: 'block' }} />
      </div>

      {/* Right — annotated */}
      <div>
        <span style={LABEL_STYLE}>Component map</span>
        <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
          <img src={imageUrl} alt="Annotated" style={{ width: '100%', display: 'block' }} />

          {valid.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(27,27,23,0.55)',
            }}>
              <span style={{
                fontFamily: "'Courier New', monospace", fontSize: '9px',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--ob-fg-dim)', textAlign: 'center', padding: '0 16px',
              }}>
                Component locations not available for this image
              </span>
            </div>
          )}

          {valid.map((c, i) => {
            const bbox = c.bbox!
            const p = c.type === 'salvageable' ? SALVAGE : DAMAGE
            const isActive = hasActive
              ? activeComponent?.component === c.component && activeComponent?.type === c.type
              : false
            const isDimmed = hasActive && !isActive
            const labelInside = bbox.y < 8

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left:    `${bbox.x}%`,
                  top:     `${bbox.y}%`,
                  width:   `${bbox.w}%`,
                  height:  `${bbox.h}%`,
                  background: isActive ? p.active : p.fill,
                  border: `1.5px solid ${p.border}`,
                  opacity: isDimmed ? 0.12 : 1,
                  transition: 'opacity 0.15s ease, background 0.15s ease',
                  pointerEvents: 'none',
                  boxSizing: 'border-box',
                  overflow: 'visible',
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: labelInside ? 2 : -17,
                  left: 0,
                  fontFamily: "'Courier New', monospace",
                  fontSize: '8px',
                  lineHeight: '15px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  background: c.type === 'salvageable' ? SALVAGE.tag : DAMAGE.tag,
                  padding: '0 5px',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  pointerEvents: 'none',
                  display: 'block',
                }}>
                  {c.component}
                </span>
              </div>
            )
          })}

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            display: 'flex', flexDirection: 'column', gap: 3,
            background: 'rgba(27,27,23,0.88)', padding: '5px 8px',
          }}>
            <LegendItem color={SALVAGE.border} label="Salvageable" />
            <LegendItem color={DAMAGE.border}  label="Not salvageable" />
          </div>
        </div>

        {/* Hover hint */}
        <p style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          color: 'var(--ob-fg-dim)', margin: 'var(--ob-space-2) 0 0 0',
          letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
        }}>
          Hover a component below to isolate it
        </p>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      fontFamily: "'Courier New', monospace", fontSize: '8px',
      letterSpacing: '0.12em', textTransform: 'uppercase', color,
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      <span style={{
        width: 10, height: 10,
        background: color.replace('0.85)', '0.22)'),
        border: `1.5px solid ${color}`,
        display: 'inline-block', flexShrink: 0,
      }} />
      {label}
    </span>
  )
}
