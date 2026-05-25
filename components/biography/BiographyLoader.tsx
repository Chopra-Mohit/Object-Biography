'use client'

import { useEffect, useRef, useState } from 'react'
import type { BiographyJSON } from '@/types/database'

interface Props {
  registrationId: string
  objectName: string
  alreadyGenerated: boolean
  cachedBiography: BiographyJSON | null
}

type State =
  | { status: 'generating'; rawText: string }
  | { status: 'done'; biography: BiographyJSON }
  | { status: 'error'; message: string }

export default function BiographyLoader({
  registrationId,
  objectName,
  alreadyGenerated,
  cachedBiography,
}: Props) {
  const [state, setState] = useState<State>(
    alreadyGenerated && cachedBiography
      ? { status: 'done', biography: cachedBiography }
      : { status: 'generating', rawText: '' }
  )
  const started = useRef(false)

  useEffect(() => {
    if (alreadyGenerated && cachedBiography) return
    if (started.current) return
    started.current = true

    let cancelled = false

    async function run() {
      const res = await fetch('/api/generate-biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: registrationId }),
      })

      if (!res.ok || !res.body) {
        setState({ status: 'error', message: 'Failed to start biography generation.' })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (!cancelled) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const chunk = JSON.parse(jsonStr)

            if (chunk.type === 'delta') {
              setState(prev =>
                prev.status === 'generating'
                  ? { status: 'generating', rawText: prev.rawText + (chunk.text ?? '') }
                  : prev
              )
            } else if (chunk.type === 'done' && chunk.biography) {
              setState({ status: 'done', biography: chunk.biography })
            } else if (chunk.type === 'error') {
              setState({ status: 'error', message: chunk.error ?? 'Generation failed.' })
            }
          } catch {
            // Malformed SSE line — ignore
          }
        }
      }
    }

    run().catch(err => {
      if (!cancelled) {
        setState({ status: 'error', message: err.message ?? 'Unexpected error.' })
      }
    })

    return () => { cancelled = true }
  }, [registrationId, alreadyGenerated, cachedBiography])

  if (state.status === 'error') {
    return (
      <div>
        <span className="ob-eyebrow" style={{ marginBottom: 'var(--ob-space-4)', color: 'var(--ob-red)' }}>
          Generation failed
        </span>
        <p className="ob-body" style={{ marginTop: 'var(--ob-space-4)' }}>{state.message}</p>
      </div>
    )
  }

  if (state.status === 'generating') {
    return <GeneratingView objectName={objectName} rawText={state.rawText} />
  }

  return <BiographyView biography={state.biography} registrationId={registrationId} />
}

// ── Generating state ─────────────────────────────────────────────────────────

function GeneratingView({ objectName, rawText }: { objectName: string; rawText: string }) {
  const hasText = rawText.length > 0

  return (
    <div>
      <span className="ob-eyebrow" style={{ marginBottom: 'var(--ob-space-6)' }}>
        Biography generating
      </span>
      <p style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-base)',
        color: 'var(--ob-fg)',
        lineHeight: 'var(--ob-lh-relaxed)',
        marginBottom: 'var(--ob-space-4)',
      }}>
        Mote is reading the record for {objectName}.
      </p>
      <p style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-small)',
        color: 'var(--ob-fg-dim)',
        lineHeight: 'var(--ob-lh-relaxed)',
        marginBottom: 'var(--ob-space-8)',
      }}>
        Life. Death. Second life. It takes a moment.
      </p>

      {hasText ? (
        // Show raw streaming text while generating
        <pre style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '11px',
          color: 'var(--ob-fg-faint)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '200px',
          overflow: 'hidden',
          opacity: 0.6,
        }}>
          {rawText}
        </pre>
      ) : (
        // Placeholder skeleton lines before text arrives
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-3)' }}>
          {[80, 95, 70, 88, 60].map((w, i) => (
            <div key={i} style={{
              height: '13px',
              width: `${w}%`,
              background: 'var(--ob-rule)',
              opacity: 0.5,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Biography display ────────────────────────────────────────────────────────

function BiographyView({ biography, registrationId }: { biography: BiographyJSON; registrationId: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-16)' }}>

      {/* ── I. LIFE ── */}
      <section>
        <SectionHeader label="I. Life" tier={biography.life.confidence_tier} />
        <Narrative text={biography.life.narrative} />

        {/* Supply chain — full-width callout */}
        <Callout label="Supply chain" accent="neutral">
          {biography.life.supply_chain_summary}
        </Callout>

        {/* Materials */}
        {biography.life.materials_summary && (
          <MetaRow label="Materials" value={biography.life.materials_summary} />
        )}

        {/* Human + environmental cost — side by side */}
        <div className="ob-biography-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ob-space-4)', margin: 'var(--ob-space-6) 0' }}>
          <CostBox label="Human cost" value={biography.life.human_cost_line} />
          <CostBox label="Environmental cost" value={biography.life.environmental_cost_line} />
        </div>

        <Sources sources={biography.life.sources} />
      </section>

      <Divider />

      {/* ── II. DEATH ── */}
      <section>
        <SectionHeader label="II. Death" tier={biography.death.confidence_tier} />

        {/* Cause of death — prominent red callout */}
        <div style={{
          borderLeft: '3px solid var(--ob-red)',
          paddingLeft: 'var(--ob-space-5)',
          marginBottom: 'var(--ob-space-8)',
        }}>
          <span style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-eyebrow)',
            textTransform: 'uppercase',
            color: 'var(--ob-red)',
            display: 'block',
            marginBottom: 'var(--ob-space-2)',
          }}>
            Failed component
          </span>
          <span style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-base)',
            color: 'var(--ob-fg)',
            lineHeight: 'var(--ob-lh-relaxed)',
            display: 'block',
          }}>
            {biography.death.failed_component}
          </span>
          {biography.death.failure_type && (
            <span style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)',
              color: 'var(--ob-fg-dim)',
              display: 'block',
              marginTop: 'var(--ob-space-2)',
            }}>
              {biography.death.failure_type}
            </span>
          )}
        </div>

        <Narrative text={biography.death.narrative} />

        {/* Design decision — this is the editorial indictment */}
        <Callout label="The design decision" accent="red">
          {biography.death.design_decision}
        </Callout>

        {/* Technical detail table */}
        <div style={{ marginTop: 'var(--ob-space-4)' }}>
          <MetaRow label="Manufacturer rationale" value={biography.death.manufacturer_rationale} />
          {biography.death.repair_cost_estimate && (
            <MetaRow label="Repair cost" value={biography.death.repair_cost_estimate} />
          )}
          {biography.death.replacement_cost && (
            <MetaRow label="Replacement cost" value={biography.death.replacement_cost} />
          )}
        </div>

        <Sources sources={biography.death.sources} />
      </section>

      <Divider />

      {/* ── III. SECOND LIFE ── */}
      <section>
        <SectionHeader label="III. Second life" tier="estimated" />

        {/* Speculative narrative — serif italic */}
        <p style={{
          fontFamily: 'var(--ob-font-serif, Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 'var(--ob-fs-base)',
          color: 'var(--ob-fg-dim)',
          lineHeight: 'var(--ob-lh-loose)',
          marginBottom: 'var(--ob-space-8)',
          borderLeft: '2px solid var(--ob-rule)',
          paddingLeft: 'var(--ob-space-5)',
        }}>
          {biography.second_life.narrative}
        </p>

        {/* Metrics grid */}
        <div className="ob-biography-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ob-space-3)', marginBottom: 'var(--ob-space-6)' }}>
          <Metric label="Possible lifespan"    value={biography.second_life.counterfactual_lifespan} />
          <Metric label="Repair cycles"        value={String(biography.second_life.repair_cycles_possible)} />
          <Metric label="Material recovery"    value={biography.second_life.material_recovery_rate} />
          <Metric label="Carbon avoided"       value={biography.second_life.carbon_delta} />
        </div>

        {biography.second_life.assumptions.length > 0 && (
          <div>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>
              Assumptions
            </span>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
              {biography.second_life.assumptions.map((a, i) => (
                <li key={i} style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: 'var(--ob-fs-meta)',
                  color: 'var(--ob-fg-dim)',
                  lineHeight: 'var(--ob-lh-relaxed)',
                  paddingLeft: 'var(--ob-space-4)',
                  position: 'relative',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--ob-fg-dim)', opacity: 0.5 }}>—</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── Personal memory ── */}
      {biography.personal_memory && (
        <>
          <Divider />
          <section>
            <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-5)' }}>
              Personal record
            </span>
            <p style={{
              fontFamily: 'var(--ob-font-serif, Georgia, serif)',
              fontStyle: 'italic',
              fontSize: 'var(--ob-fs-base)',
              color: 'var(--ob-fg-dim)',
              lineHeight: 'var(--ob-lh-loose)',
              borderLeft: '2px solid var(--ob-rule)',
              paddingLeft: 'var(--ob-space-5)',
              margin: 0,
            }}>
              {biography.personal_memory}
            </p>
          </section>
        </>
      )}

      <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)' }} />

      {/* ── File certificate ── */}
      <section>
        <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-5)' }}>
          Death certificate
        </span>

        {/* Summary card */}
        <div style={{ border: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-6)' }}>
          <div style={{ padding: 'var(--ob-space-4) var(--ob-space-5)', borderBottom: '1px solid var(--ob-rule)', background: 'rgba(196,30,30,0.04)' }}>
            <span style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)',
              color: 'var(--ob-fg-dim)',
              display: 'block',
              marginBottom: 2,
              letterSpacing: 'var(--ob-ls-eyebrow)',
              textTransform: 'uppercase',
            }}>Cause of death</span>
            <span style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg)',
            }}>
              {biography.certificate_summary.cause_of_death}
            </span>
          </div>
          <MetaRow label="Design decision" value={biography.certificate_summary.design_decision_named} />
          <MetaRow label="Material cost"   value={biography.certificate_summary.material_cost_line} />
          <MetaRow label="Human cost"      value={biography.certificate_summary.human_cost_line} />
        </div>

        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          color: 'var(--ob-fg-dim)',
          lineHeight: 'var(--ob-lh-relaxed)',
          marginBottom: 'var(--ob-space-5)',
        }}>
          File a public death certificate. Anyone with the link can read the record.
        </p>

        <FileCertificateButton registrationId={registrationId} />
      </section>

    </div>
  )
}

// ── New display components ────────────────────────────────────────────────────

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', margin: 0 }} />
}

function Callout({ label, accent, children }: { label: string; accent: 'neutral' | 'red'; children: string }) {
  const borderColor = accent === 'red' ? 'var(--ob-red)' : 'var(--ob-rule)'
  const labelColor  = accent === 'red' ? 'var(--ob-red)' : 'var(--ob-fg-dim)'
  return (
    <div style={{
      border: '1px solid var(--ob-rule)',
      borderLeft: `3px solid ${borderColor}`,
      padding: 'var(--ob-space-5)',
      margin: 'var(--ob-space-6) 0',
    }}>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: labelColor,
        display: 'block',
        marginBottom: 'var(--ob-space-3)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-small)',
        color: 'var(--ob-fg)',
        lineHeight: 'var(--ob-lh-relaxed)',
        display: 'block',
      }}>
        {children}
      </span>
    </div>
  )
}

function CostBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-4)' }}>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: 'var(--ob-fg-dim)',
        display: 'block',
        marginBottom: 'var(--ob-space-2)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-small)',
        color: 'var(--ob-fg)',
        lineHeight: 'var(--ob-lh-relaxed)',
        display: 'block',
      }}>
        {value}
      </span>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-4)' }}>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: 'var(--ob-fg-dim)',
        display: 'block',
        marginBottom: 'var(--ob-space-2)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-base)',
        color: 'var(--ob-fg)',
        lineHeight: 1.2,
        display: 'block',
      }}>
        {value}
      </span>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionHeader({ label, tier }: { label: string; tier: string }) {
  const dotColor = tier === 'verified' ? '#4CAF50' : tier === 'inferred' ? '#FF9800' : '#9E9E9E'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-3)', marginBottom: 'var(--ob-space-6)' }}>
      <h2 style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-h3)',
        fontWeight: 'var(--ob-fw-regular)',
        color: 'var(--ob-fg)',
      }}>
        {label}
      </h2>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        color: 'var(--ob-fg-dim)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        {tier}
      </span>
    </div>
  )
}

function Narrative({ text, italic }: { text: string; italic?: boolean }) {
  return (
    <p style={{
      fontFamily: italic ? 'var(--ob-font-serif)' : 'var(--ob-font-mono)',
      fontStyle: italic ? 'italic' : 'normal',
      fontSize: 'var(--ob-fs-base)',
      color: 'var(--ob-fg)',
      lineHeight: 'var(--ob-lh-loose)',
      marginBottom: 'var(--ob-space-6)',
    }}>
      {text}
    </p>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ob-biography-meta-row" style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      gap: 'var(--ob-space-4)',
      paddingTop: 'var(--ob-space-3)',
      paddingBottom: 'var(--ob-space-3)',
      borderBottom: '1px solid var(--ob-rule)',
    }}>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: 'var(--ob-fg-dim)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-small)',
        color: 'var(--ob-fg)',
        lineHeight: 'var(--ob-lh-relaxed)',
      }}>
        {value}
      </span>
    </div>
  )
}

function Sources({ sources }: { sources: string[] }) {
  if (!sources || sources.length === 0) return null
  return (
    <p style={{
      fontFamily: 'var(--ob-font-mono)',
      fontSize: 'var(--ob-fs-meta)',
      color: 'var(--ob-fg-faint)',
      marginTop: 'var(--ob-space-4)',
      letterSpacing: 'var(--ob-ls-wide)',
    }}>
      Sources: {sources.join(' · ')}
    </p>
  )
}

function FileCertificateButton({ registrationId }: { registrationId: string }) {
  const [status, setStatus] = useState<'idle' | 'filing' | 'done' | 'error'>('idle')
  const [shareToken, setShareToken] = useState<string | null>(null)

  async function handleFile() {
    if (status === 'done' && shareToken) {
      window.location.href = `/certificate/${shareToken}`
      return
    }
    setStatus('filing')
    try {
      const res = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: registrationId }),
      })
      const json = await res.json()
      if (!res.ok) { setStatus('error'); return }
      setShareToken(json.share_token)
      setStatus('done')
      window.location.href = `/certificate/${json.share_token}`
    } catch {
      setStatus('error')
    }
  }

  return (
    <button
      className="ob-button"
      onClick={handleFile}
      disabled={status === 'filing'}
      style={{ marginTop: 'var(--ob-space-4)', opacity: status === 'filing' ? 0.5 : 1 }}
    >
      {status === 'filing' ? 'Filing…' : status === 'error' ? 'Failed — try again' : 'File death certificate'}
    </button>
  )
}
