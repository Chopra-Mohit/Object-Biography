'use client'

import { useState } from 'react'
import type { HouseholdAnalysis } from '@/app/api/analysis/household/route'

interface Props {
  objectCount: number   // dead objects on this account
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

const SEVERITY_COLOR: Record<string, string> = {
  high:   'var(--ob-red)',
  medium: '#FF9800',
  low:    'var(--ob-fg-dim)',
}

/**
 * Cross-object diagnosis for a signed-in household: Mote reads every death
 * on the account and names the patterns — repeated failure modes, weak
 * component classes, brand-level observations, what is likely next.
 */
export default function HouseholdAnalysisPanel({ objectCount }: Props) {
  const [analysis, setAnalysis] = useState<HouseholdAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analysis/household', { method: 'POST' })
      const json = await res.json()
      if (res.ok) setAnalysis(json.analysis)
      else setError(json.error ?? 'Analysis failed.')
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (objectCount < 2) {
    return (
      <div style={{ border: '1px dashed var(--ob-rule)', padding: 'var(--ob-space-5)', marginBottom: 'var(--ob-space-10)' }}>
        <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>
          Household analysis
        </span>
        <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', margin: 0, lineHeight: 'var(--ob-lh-relaxed)' }}>
          Once two or more dead objects are on record, Mote can read across them —
          repeated failure modes, weak component classes, what in your home is
          statistically next. One object is an anecdote. Two is the start of a pattern.
        </p>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }}>

      <div style={{
        padding: 'var(--ob-space-4) var(--ob-space-5)',
        borderBottom: analysis || loading || error ? '1px solid var(--ob-rule)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
      }}>
        <div>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 4 }}>Household analysis</span>
          <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)' }}>
            Cross-examination of all {objectCount} deaths on your record.
          </span>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="ob-button"
          style={{ fontSize: 'var(--ob-fs-meta)', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Reading the record…' : analysis ? 'Run again' : 'Run analysis →'}
        </button>
      </div>

      {error && (
        <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-red)', padding: 'var(--ob-space-4) var(--ob-space-5)', margin: 0 }}>
          {error}
        </p>
      )}

      {analysis && (
        <div style={{ padding: 'var(--ob-space-5)' }}>

          {/* Headline */}
          <p style={{
            ...mono, fontSize: 'var(--ob-fs-base)', color: 'var(--ob-fg)',
            lineHeight: 'var(--ob-lh-relaxed)', margin: '0 0 var(--ob-space-6)',
            borderLeft: '3px solid var(--ob-red)', paddingLeft: 'var(--ob-space-4)',
          }}>
            {analysis.headline}
          </p>

          {/* Patterns */}
          {analysis.patterns.length > 0 && (
            <div style={{ marginBottom: 'var(--ob-space-6)' }}>
              <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>Patterns</span>
              {analysis.patterns.map((p, i) => (
                <div key={i} style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-3) var(--ob-space-4)', marginBottom: 'var(--ob-space-3)' }}>
                  <div style={{ display: 'flex', gap: 'var(--ob-space-3)', alignItems: 'baseline', marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)' }}>{p.title}</span>
                    <span style={{
                      ...mono, fontSize: 'var(--ob-fs-caption)', letterSpacing: 'var(--ob-ls-eyebrow)',
                      textTransform: 'uppercase', color: SEVERITY_COLOR[p.severity] ?? 'var(--ob-fg-dim)',
                    }}>
                      {p.severity}
                    </span>
                  </div>
                  <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', margin: 0, lineHeight: 'var(--ob-lh-relaxed)' }}>
                    {p.evidence}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Watchlist */}
          {analysis.component_watchlist.length > 0 && (
            <div style={{ marginBottom: 'var(--ob-space-6)' }}>
              <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)', color: 'var(--ob-red)' }}>
                Component watchlist
              </span>
              {analysis.component_watchlist.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--ob-space-3)', marginBottom: 'var(--ob-space-2)', alignItems: 'baseline' }}>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg)', flexShrink: 0 }}>· {w.component_class}</span>
                  <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', lineHeight: 'var(--ob-lh-relaxed)' }}>{w.reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* Brand notes */}
          {analysis.brand_notes.length > 0 && (
            <div style={{ marginBottom: 'var(--ob-space-6)' }}>
              <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>Brand notes</span>
              {analysis.brand_notes.map((n, i) => (
                <p key={i} style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', margin: '0 0 var(--ob-space-2)', lineHeight: 'var(--ob-lh-relaxed)' }}>
                  {n}
                </p>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div>
              <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>What to do</span>
              {analysis.recommendations.map((r, i) => (
                <p key={i} style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', margin: '0 0 var(--ob-space-2)', lineHeight: 'var(--ob-lh-relaxed)' }}>
                  {i + 1}. {r}
                </p>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
