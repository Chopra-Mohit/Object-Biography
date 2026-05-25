'use client'

import { useState } from 'react'

interface CTAProps {
  onGenerate: (objectName: string) => void
  isGenerating: boolean
}

export default function CTA({ onGenerate, isGenerating }: CTAProps) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    if (!value.trim()) return
    onGenerate(value.trim())
    setValue('')
  }

  return (
    <section
      id="cta"
      style={{ background: 'var(--ob-paper)', color: 'var(--ob-paper-ink)', padding: '8rem 0' }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '0 3rem' }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--ob-font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase' as const,
            color: '#7A7469',
            marginBottom: '2rem',
          }}
        >
          07 — Begin
        </span>
        <h2
          style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: '2.5rem',
          }}
        >
          Something just broke.<br />Tell us what it was.
        </h2>
        <div className="ob-input-row ob-input-row--paper" style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Name the object…"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button
            className="ob-button ob-button--paper"
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating…' : 'Generate biography'}
          </button>
        </div>
        <p
          style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: '11px',
            color: '#7A7469',
            letterSpacing: '0.05em',
          }}
        >
          Free to start.&nbsp; One certificate a month, forever.
        </p>
      </div>
    </section>
  )
}
