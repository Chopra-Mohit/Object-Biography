'use client'

import { useRef, useState } from 'react'
import type { QuickInsightResult, BBox } from '@/lib/anthropic/quickInsightTypes'
import VerdictBadge from './VerdictBadge'
import SalvageCard from './SalvageCard'
import AnnotatedImage from './AnnotatedImage'

type State =
  | { status: 'idle' }
  | { status: 'analysing'; preview: string }
  | { status: 'done'; preview: string; result: QuickInsightResult }
  | { status: 'error'; preview: string | null; message: string }

type AutoSaveState = 'idle' | 'saving' | 'saved' | 'error'

interface HoveredComponent {
  component: string
  bbox: BBox | null
  type: 'salvageable' | 'non-salvageable'
}

export default function QuickInsightUpload() {
  const [state,         setState]         = useState<State>({ status: 'idle' })
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>('idle')
  const [hoveredComponent, setHoveredComponent] = useState<HoveredComponent | null>(null)
  const fileInputRef   = useRef<HTMLInputElement>(null)  // gallery / file picker
  const cameraInputRef = useRef<HTMLInputElement>(null)  // camera capture

  async function handleFile(file: File) {
    const preview = URL.createObjectURL(file)
    setState({ status: 'analysing', preview })
    setAutoSaveState('idle')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/quick-insight', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) {
        setState({ status: 'error', preview, message: json.error ?? 'Analysis failed.' })
        return
      }
      setState({ status: 'done', preview, result: json })
      // Auto-save to community registry — no sign-in needed
      autoSaveToRegistry(json)
    } catch (err) {
      setState({ status: 'error', preview, message: err instanceof Error ? err.message : 'Unexpected error.' })
    }
  }

  async function autoSaveToRegistry(result: QuickInsightResult) {
    setAutoSaveState('saving')
    try {
      const res = await fetch('/api/salvage/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        console.error('[Salvage] Auto-save failed:', json)
        setAutoSaveState('error')
        return
      }
      setAutoSaveState('saved')
    } catch (err) {
      console.error('[Salvage] Auto-save error:', err)
      setAutoSaveState('error')
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function reset() {
    setState({ status: 'idle' })
    setHoveredComponent(null)
    setAutoSaveState('idle')
  }

  return (
    <div>
      {/* Hidden: gallery / file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      {/* Hidden: camera capture (mobile rear camera) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Idle */}
      {state.status === 'idle' && (
        <div style={{
          border: '1px dashed var(--ob-rule)',
          padding: 'var(--ob-space-12) var(--ob-space-8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--ob-space-6)',
        }}>
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)', color: 'var(--ob-fg)', textAlign: 'center' }}>
            Photograph the object
          </span>
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', textAlign: 'center' }}>
            JPG · PNG · WEBP · HEIC — max 10MB
          </span>

          {/* Two options */}
          <div style={{ display: 'flex', gap: 'var(--ob-space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Take photo — opens device camera */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={captureButtonStyle}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ob-fg)'
                e.currentTarget.style.color = 'var(--ob-fg)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--ob-rule)'
                e.currentTarget.style.color = 'var(--ob-fg-dim)'
              }}
            >
              <span style={{ fontSize: '1.4em', lineHeight: 1 }}>◎</span>
              <span>Take photo</span>
              <span style={{ fontSize: 'var(--ob-fs-meta)', opacity: 0.6 }}>Opens camera</span>
            </button>

            {/* Upload — opens file picker / gallery */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={captureButtonStyle}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ob-fg)'
                e.currentTarget.style.color = 'var(--ob-fg)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--ob-rule)'
                e.currentTarget.style.color = 'var(--ob-fg-dim)'
              }}
            >
              <span style={{ fontSize: '1.4em', lineHeight: 1 }}>⊞</span>
              <span>Upload photo</span>
              <span style={{ fontSize: 'var(--ob-fs-meta)', opacity: 0.6 }}>From library</span>
            </button>
          </div>
        </div>
      )}

      {/* Analysing */}
      {state.status === 'analysing' && (
        <div>
          <div style={{ width: '100%', maxHeight: '300px', overflow: 'hidden', marginBottom: 'var(--ob-space-8)' }}>
            <img src={state.preview} alt="" style={{ width: '100%', objectFit: 'cover', opacity: 0.5 }} />
          </div>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>Analysing</span>
          <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-base)', color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-relaxed)', marginBottom: 'var(--ob-space-3)' }}>
            Mote is working through the components.
          </p>
          <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)' }}>
            Identification. Supply chain. What works. What doesn&apos;t. Why.
          </p>
        </div>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <div>
          {state.preview && (
            <div style={{ width: '100%', maxHeight: '200px', overflow: 'hidden', marginBottom: 'var(--ob-space-6)', opacity: 0.4 }}>
              <img src={state.preview} alt="" style={{ width: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)', color: 'var(--ob-red)' }}>Analysis failed</span>
          <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', marginBottom: 'var(--ob-space-6)' }}>
            {state.message}
          </p>
          <button onClick={reset} className="ob-button--ghost ob-button">Try again</button>
        </div>
      )}

      {/* Done */}
      {state.status === 'done' && (() => {
        const { result, preview } = state

        const allAnnotations = [
          ...result.salvageable_components.map(c => ({
            component: c.component,
            bbox: c.bbox,
            type: 'salvageable' as const,
          })),
          ...result.non_salvageable_components.map(c => ({
            component: c.component,
            bbox: c.bbox,
            type: 'non-salvageable' as const,
          })),
        ]

        return (
          <div>
            {/* Annotated image */}
            <div style={{ marginBottom: 'var(--ob-space-8)' }}>
              <AnnotatedImage
                imageUrl={preview}
                activeComponent={hoveredComponent}
                allComponents={allAnnotations}
              />
            </div>

            {/* Verdict */}
            <VerdictBadge verdict={result.verdict} reason={result.verdict_reason} />

            {/* Full breakdown */}
            <SalvageCard result={result} onComponentHover={setHoveredComponent} />

            <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', margin: 'var(--ob-space-12) 0' }} />

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)' }}>

              {/* Registry status — auto-saved */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-3)' }}>
                <span style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
                  letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                  color: autoSaveState === 'saved'  ? '#4CAF50'
                       : autoSaveState === 'error'  ? 'var(--ob-red)'
                       : 'var(--ob-fg-dim)',
                }}>
                  {autoSaveState === 'saving' ? 'Saving to community registry…'
                 : autoSaveState === 'saved'  ? '✓ Added to community registry'
                 : autoSaveState === 'error'  ? 'Registry save failed'
                 :                              ''}
                </span>
              </div>

              {/* Next steps */}
              <div>
                <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>
                  Next steps
                </span>
                <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', marginBottom: 'var(--ob-space-4)' }}>
                  This assessment is in the community registry. You can browse all found objects there, or assess something else.
                </p>
                <div style={{ display: 'flex', gap: 'var(--ob-space-4)', flexWrap: 'wrap' }}>
                  <a href="/registry?view=found" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    View in registry →
                  </a>
                  <button onClick={reset} className="ob-button--ghost ob-button">Assess another</button>
                </div>
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const captureButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--ob-space-2)',
  background: 'transparent',
  border: '1px solid var(--ob-rule)',
  padding: 'var(--ob-space-5) var(--ob-space-8)',
  cursor: 'pointer',
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-small)',
  color: 'var(--ob-fg-dim)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
  transition: 'border-color 0.15s, color 0.15s',
  minWidth: 140,
}
