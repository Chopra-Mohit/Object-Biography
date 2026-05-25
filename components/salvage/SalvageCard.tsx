'use client'

import type { QuickInsightResult, SalvageableComponent, NonSalvageableComponent, BBox } from '@/lib/anthropic/quickInsightTypes'

const RECYCLABILITY_COLOR: Record<string, string> = { high: '#4CAF50', medium: '#FF9800', low: '#9C9990' }
const DIFFICULTY_LABEL: Record<string, string>    = { easy: 'Easy', moderate: 'Moderate', expert: 'Expert required' }
const EFFORT_COLOR: Record<string, string>         = { minimal: '#4CAF50', moderate: '#FF9800', significant: '#9C9990' }
const CONDITION_CONFIG: Record<string, { label: string; color: string }> = {
  good:         { label: 'Good',       color: '#4CAF50' },
  fair:         { label: 'Fair',       color: '#FF9800' },
  poor:         { label: 'Poor',       color: '#C0873A' },
  'parts-only': { label: 'Parts only', color: '#9C9990' },
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

interface HoveredComponent {
  component: string
  bbox: BBox | null
  type: 'salvageable' | 'non-salvageable'
}

interface Props {
  result: QuickInsightResult
  onComponentHover: (c: HoveredComponent | null) => void
}

export default function SalvageCard({ result, onComponentHover }: Props) {
  const condition = CONDITION_CONFIG[result.condition] ?? { label: result.condition, color: '#9C9990' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-10)', marginTop: 'var(--ob-space-8)' }}>

      {/* ── Object name + condition ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', flexWrap: 'wrap' }}>
        <h2 style={{ ...mono, fontSize: 'var(--ob-fs-h3)', fontWeight: 'var(--ob-fw-regular)', color: 'var(--ob-fg)', margin: 0 }}>
          {result.object_identified}
        </h2>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: condition.color }}>
          {condition.label}
        </span>
      </div>

      {/* ── Top info boxes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ob-space-4)' }}>

        {/* Object history */}
        <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-5)' }}>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Object history</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-3)' }}>
            {result.object_history.likely_age         && <InfoRow label="Age"       value={result.object_history.likely_age} />}
            {result.object_history.typical_lifespan   && <InfoRow label="Lifespan"  value={result.object_history.typical_lifespan} />}
            {result.object_history.manufacture_context && <InfoRow label="Made in"  value={result.object_history.manufacture_context} />}
            {result.object_history.supply_chain_note  && <InfoRow label="Supply chain" value={result.object_history.supply_chain_note} />}
            {!result.object_history.likely_age && !result.object_history.typical_lifespan &&
              !result.object_history.manufacture_context && !result.object_history.supply_chain_note && (
              <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>No history data available.</span>
            )}
          </div>
        </div>

        {/* Object details */}
        <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-5)' }}>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Object details</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-3)' }}>
            {result.manufacturer               && <InfoRow label="Manufacturer" value={result.manufacturer} />}
            {result.model                      && <InfoRow label="Model"        value={result.model} />}
            {result.estimated_manufacture_year && <InfoRow label="Year"         value={result.estimated_manufacture_year} />}
            {result.country_of_origin          && <InfoRow label="Origin"       value={result.country_of_origin} />}
            <InfoRow label="Repair"      value={DIFFICULTY_LABEL[result.repair_difficulty] ?? result.repair_difficulty} />
            {result.estimated_repair_cost      && <InfoRow label="Repair cost"  value={result.estimated_repair_cost} />}
            <InfoRow label="Confidence"  value={result.confidence} />
          </div>
        </div>
      </div>

      {/* ── Materials ── */}
      {result.materials.length > 0 && (
        <div>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Materials</span>
          <div style={{ border: '1px solid var(--ob-rule)' }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 52px 1fr',
              gap: 'var(--ob-space-3)', padding: 'var(--ob-space-2) var(--ob-space-4)',
              borderBottom: '1px solid var(--ob-rule)',
            }}>
              {['Material', 'Quantity', 'Recycle', 'Disposal route'].map(h => (
                <span key={h} style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg-dim)' }}>{h}</span>
              ))}
            </div>
            {result.materials.map((m, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 52px 1fr',
                gap: 'var(--ob-space-3)', padding: 'var(--ob-space-3) var(--ob-space-4)',
                borderBottom: i < result.materials.length - 1 ? '1px solid var(--ob-rule)' : 'none',
                alignItems: 'start',
              }}>
                <div>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', display: 'block' }}>{m.material}</span>
                  {m.origin_country && (
                    <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', display: 'block', marginTop: 2 }}>
                      Origin: {m.origin_country}
                    </span>
                  )}
                </div>
                <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>{m.estimated_quantity}</span>
                <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', textTransform: 'uppercase', letterSpacing: 'var(--ob-ls-eyebrow)', color: RECYCLABILITY_COLOR[m.recyclability] ?? '#9C9990' }}>
                  {m.recyclability}
                </span>
                <div>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', display: 'block' }}>{m.recycling_method}</span>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', opacity: 0.6, display: 'block', marginTop: 2 }}>{m.recycling_facility_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Components — two columns ── */}
      {(result.salvageable_components.length > 0 || result.non_salvageable_components.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ob-space-4)', alignItems: 'start' }}>

          {/* Has remaining life */}
          <div style={{ border: '1px solid var(--ob-rule)' }}>
            <div style={{ padding: 'var(--ob-space-3) var(--ob-space-4)', borderBottom: '1px solid var(--ob-rule)', background: 'rgba(76,175,80,0.06)' }}>
              <span className="ob-eyebrow" style={{ color: '#4CAF50' }}>
                Has remaining life{result.salvageable_components.length > 0 ? ` — ${result.salvageable_components.length}` : ''}
              </span>
            </div>
            {result.salvageable_components.length === 0 ? (
              <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', padding: 'var(--ob-space-4)', margin: 0 }}>None identified.</p>
            ) : (
              <div>
                {result.salvageable_components.map((c, i) => (
                  <SalvageableRow
                    key={i}
                    component={c}
                    isLast={i === result.salvageable_components.length - 1}
                    onHover={(hovered) => onComponentHover(hovered ? { component: c.component, bbox: c.bbox, type: 'salvageable' } : null)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Beyond saving */}
          <div style={{ border: '1px solid var(--ob-rule)' }}>
            <div style={{ padding: 'var(--ob-space-3) var(--ob-space-4)', borderBottom: '1px solid var(--ob-rule)', background: 'rgba(196,30,30,0.06)' }}>
              <span className="ob-eyebrow" style={{ color: 'var(--ob-red)' }}>
                Beyond saving{result.non_salvageable_components.length > 0 ? ` — ${result.non_salvageable_components.length}` : ''}
              </span>
            </div>
            {result.non_salvageable_components.length === 0 ? (
              <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', padding: 'var(--ob-space-4)', margin: 0 }}>None identified.</p>
            ) : (
              <div>
                {result.non_salvageable_components.map((c, i) => (
                  <NonSalvageableRow
                    key={i}
                    component={c}
                    isLast={i === result.non_salvageable_components.length - 1}
                    onHover={(hovered) => onComponentHover(hovered ? { component: c.component, bbox: c.bbox, type: 'non-salvageable' } : null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Reuse scenarios ── */}
      {result.reuse_scenarios.length > 0 && (
        <div>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Project blueprints</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-3)' }}>
            {result.reuse_scenarios.map((s, i) => (
              <div key={i} style={{
                border: '1px solid var(--ob-rule)',
                padding: 'var(--ob-space-4)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 'var(--ob-space-4)',
                alignItems: 'start',
              }}>
                <div>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', display: 'block', marginBottom: 'var(--ob-space-2)' }}>
                    {s.scenario}
                  </span>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
                    {s.required_skills} · {s.estimated_time}
                  </span>
                </div>
                <span style={{
                  ...mono, fontSize: 'var(--ob-fs-meta)',
                  letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                  color: EFFORT_COLOR[s.effort] ?? '#9C9990',
                  whiteSpace: 'nowrap',
                }}>
                  {s.effort}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SalvageableRow({ component, isLast, onHover }: {
  component: SalvageableComponent
  isLast: boolean
  onHover: (hovered: boolean) => void
}) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        padding: 'var(--ob-space-4)',
        borderBottom: isLast ? 'none' : '1px solid var(--ob-rule)',
        cursor: 'default',
      }}
    >
      {/* Component name */}
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: '#4CAF50', fontWeight: 500, display: 'block', marginBottom: 'var(--ob-space-2)' }}>
        {component.component}
      </span>

      {/* Why it still has life */}
      <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', margin: '0 0 var(--ob-space-3) 0' }}>
        {component.why_salvageable}
      </p>

      {/* What you can build — the core section */}
      {component.potential_uses.length > 0 && (
        <div style={{ marginBottom: 'var(--ob-space-3)' }}>
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg-dim)', display: 'block', marginBottom: 'var(--ob-space-2)' }}>
            What you could make
          </span>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {component.potential_uses.map((u, i) => (
              <li key={i} style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg)', paddingLeft: 'var(--ob-space-5)', position: 'relative', lineHeight: 'var(--ob-lh-relaxed)' }}>
                <span style={{ position: 'absolute', left: 0, color: 'rgba(76,175,80,0.7)' }}>→</span>
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Secondary: supply chain + value */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {component.source_tracing && (
          <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', opacity: 0.6, lineHeight: 'var(--ob-lh-relaxed)', margin: 0, fontStyle: 'italic' }}>
            Supply chain: {component.source_tracing}
          </p>
        )}
        {component.estimated_value && (
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', opacity: 0.6 }}>
            If sold: ~{component.estimated_value}
          </span>
        )}
      </div>
    </div>
  )
}

function NonSalvageableRow({ component, isLast, onHover }: {
  component: NonSalvageableComponent
  isLast: boolean
  onHover: (hovered: boolean) => void
}) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        padding: 'var(--ob-space-4)',
        borderBottom: isLast ? 'none' : '1px solid var(--ob-rule)',
        cursor: 'default',
      }}
    >
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-red)', display: 'block', marginBottom: 'var(--ob-space-2)', fontWeight: 500 }}>
        {component.component}
      </span>
      <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', margin: '0 0 var(--ob-space-2) 0' }}>
        {component.reason}
      </p>
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', opacity: 0.65, fontStyle: 'italic' }}>
        Disposal: {component.disposal_method}
      </span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 'var(--ob-space-3)', alignItems: 'start' }}>
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg-dim)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-relaxed)' }}>
        {value}
      </span>
    </div>
  )
}
