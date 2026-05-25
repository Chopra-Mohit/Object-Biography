'use client'

// Generates the biography PDF entirely in the browser using @react-pdf/renderer's
// browser API. All imports are dynamic (lazy on click) to avoid initial bundle bloat.

import { useState } from 'react'
import type { BiographyJSON } from '@/types/database'

interface Props {
  bio: BiographyJSON
  objectName: string
  style?: React.CSSProperties
}

export default function BiographyPdfButton({ bio, objectName, style }: Props) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'error'>('idle')

  async function handleDownload() {
    setStatus('generating')
    try {
      const [{ pdf, Document, Page, Text, View, StyleSheet }, React] = await Promise.all([
        import('@react-pdf/renderer'),
        import('react'),
      ])

      const e = React.createElement

      // ── Styles ──────────────────────────────────────────────────────────────
      const S = StyleSheet.create({
        page: {
          paddingTop: 60, paddingBottom: 72,
          paddingHorizontal: 56,
          backgroundColor: '#F8F5EB',
          fontFamily: 'Courier',
        },

        // Typography
        headerLabel: { fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: '#9B8A6A', marginBottom: 6 },
        title:       { fontSize: 20, color: '#1B1B17', lineHeight: 1.2, marginBottom: 4 },
        subtitle:    { fontSize: 10, color: '#9B8A6A', marginBottom: 28 },
        sectionLabel:{ fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: '#9B8A6A', marginBottom: 10 },
        narrative:   { fontSize: 10, color: '#1B1B17', lineHeight: 1.75, marginBottom: 18 },
        confidence:  { fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: '#9B8A6A' },

        // Rules
        ruleHeavy: { borderBottomWidth: 0.5, borderBottomColor: '#CCBDA0', marginBottom: 3 },
        ruleHeavy2:{ borderBottomWidth: 0.5, borderBottomColor: '#CCBDA0', marginBottom: 22 },
        rule:      { borderBottomWidth: 0.5, borderBottomColor: '#CCBDA0', marginBottom: 22, marginTop: 4 },

        // Meta: label + value block used standalone (full width)
        metaLabel: { fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: '#9B8A6A', marginBottom: 3 },
        metaValue: { fontSize: 10, color: '#1B1B17', lineHeight: 1.5 },

        // Two-column meta row
        metaRow:   { flexDirection: 'row', marginBottom: 14 },
        metaCol:   { width: '50%', paddingRight: 16 },

        // Red-accent box for failed component
        accentBox:  { borderLeftWidth: 2, borderLeftColor: '#C41E1E', paddingLeft: 10, marginBottom: 16 },
        accentLabel:{ fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: '#C41E1E', marginBottom: 3 },
        accentValue:{ fontSize: 10, color: '#1B1B17', lineHeight: 1.5 },

        // 2×2 metrics grid for Second Life
        metricsRow: { flexDirection: 'row', marginBottom: 8 },
        metricBox:  { width: '50%', borderWidth: 0.5, borderColor: '#CCBDA0', padding: 8, paddingRight: 10 },

        // Spacing helpers
        spacer6:  { marginBottom: 6 },
        spacer12: { marginBottom: 12 },
        spacer20: { marginBottom: 20 },
        spacer26: { marginBottom: 26 },

        // Fixed footer
        footer:    { position: 'absolute', bottom: 30, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between' },
        footerText:{ fontSize: 7, color: '#9B8A6A', letterSpacing: 1 },
      })

      // ── Reusable helpers ─────────────────────────────────────────────────────

      // Full-width label + value block
      const Field = (label: string, value: string | undefined | null) =>
        e(View, { style: S.spacer12 },
          e(Text, { style: S.metaLabel }, label),
          e(Text, { style: S.metaValue }, value ?? '—'),
        )

      // Two-column row: each item is a Field
      const TwoCol = (
        labelA: string, valueA: string | undefined | null,
        labelB: string, valueB: string | undefined | null,
      ) =>
        e(View, { style: S.metaRow },
          e(View, { style: S.metaCol },
            e(Text, { style: S.metaLabel }, labelA),
            e(Text, { style: S.metaValue }, valueA ?? '—'),
          ),
          e(View, { style: S.metaCol },
            e(Text, { style: S.metaLabel }, labelB),
            e(Text, { style: S.metaValue }, valueB ?? '—'),
          ),
        )

      // Metric box for the 2×2 Second Life grid
      const MetricBox = (label: string, value: string) =>
        e(View, { style: S.metricBox },
          e(Text, { style: S.metaLabel }, label),
          e(Text, { style: { ...S.metaValue, marginTop: 2 } }, value),
        )

      // ── Header metadata ──────────────────────────────────────────────────────
      const objectTitle   = [bio.manufacturer, bio.object_name].filter(Boolean).join(' ') || objectName
      const modelLine     = [bio.model, bio.year_of_manufacture ? String(bio.year_of_manufacture) : null].filter(Boolean).join(' · ')
      const generatedDate = new Date(bio.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

      // ── Document ─────────────────────────────────────────────────────────────
      const doc = e(Document,
        { title: `Object Biography — ${objectTitle}`, author: 'Object Biography' },

        e(Page, { size: 'A4', style: S.page },

          // ── Page header ──
          e(Text, { style: S.headerLabel }, 'Object Biography'),
          e(Text, { style: S.title }, objectTitle),
          modelLine ? e(Text, { style: S.subtitle }, modelLine) : e(View, { style: S.spacer20 }),
          e(View, { style: S.ruleHeavy }),
          e(View, { style: S.ruleHeavy2 }),

          // ── 01 LIFE ──────────────────────────────────────────────────────────
          e(Text, { style: S.sectionLabel }, '01 — Life'),
          e(Text, { style: S.narrative }, bio.life.narrative),

          TwoCol('Human cost', bio.life.human_cost_line, 'Environmental cost', bio.life.environmental_cost_line),

          Field('Supply chain', bio.life.supply_chain_summary),
          e(Text, { style: { ...S.confidence, marginBottom: 4 } }, `Confidence: ${bio.life.confidence_tier}`),
          e(View, { style: S.spacer6 }),

          e(View, { style: S.rule }),

          // ── 02 DEATH ─────────────────────────────────────────────────────────
          e(Text, { style: S.sectionLabel }, '02 — Death'),
          e(Text, { style: S.narrative }, bio.death.narrative),

          // Failed component — red accent
          e(View, { style: S.accentBox },
            e(Text, { style: S.accentLabel }, 'Failed component'),
            e(Text, { style: S.accentValue }, bio.death.failed_component),
          ),

          TwoCol('Failure type', bio.death.failure_type, 'Design decision', bio.death.design_decision),

          Field('Manufacturer rationale', bio.death.manufacturer_rationale),

          (bio.death.repair_cost_estimate || bio.death.replacement_cost)
            ? TwoCol(
                'Repair cost',       bio.death.repair_cost_estimate ?? '—',
                'Replacement cost',  bio.death.replacement_cost     ?? '—',
              )
            : null,

          e(Text, { style: { ...S.confidence, marginBottom: 4 } }, `Confidence: ${bio.death.confidence_tier}`),
          e(View, { style: S.spacer6 }),

          e(View, { style: S.rule }),

          // ── 03 SECOND LIFE ───────────────────────────────────────────────────
          e(Text, { style: S.sectionLabel }, '03 — Second Life'),
          e(Text, { style: S.narrative }, bio.second_life.narrative),

          // 2×2 metrics grid
          e(View, { style: S.metricsRow },
            MetricBox('Counterfactual lifespan', bio.second_life.counterfactual_lifespan),
            MetricBox('Repair cycles possible',  String(bio.second_life.repair_cycles_possible)),
          ),
          e(View, { style: S.metricsRow },
            MetricBox('Material recovery', bio.second_life.material_recovery_rate),
            MetricBox('Carbon avoided',    bio.second_life.carbon_delta),
          ),

          e(Text, { style: { ...S.confidence, marginTop: 8, marginBottom: 4 } }, 'Confidence: estimated'),
          e(View, { style: S.spacer6 }),

          e(View, { style: S.rule }),

          // ── Cause of death summary ────────────────────────────────────────────
          e(Text, { style: S.sectionLabel }, 'Cause of death'),
          e(Text, { style: { ...S.narrative, marginBottom: 8 } }, bio.certificate_summary.cause_of_death),
          e(Text, { style: { ...S.metaValue, marginBottom: 6 } },  bio.certificate_summary.design_decision_named),
          e(Text, { style: { ...S.metaValue, color: '#9B8A6A', marginBottom: 3 } }, bio.certificate_summary.material_cost_line),
          e(Text, { style: { ...S.metaValue, color: '#9B8A6A' } },                 bio.certificate_summary.human_cost_line),

          // ── Fixed footer ──────────────────────────────────────────────────────
          e(View, { style: S.footer, fixed: true } as object,
            e(Text, { style: S.footerText }, 'Object Biography · objectbiography.com'),
            e(Text, { style: S.footerText }, generatedDate),
            e(Text, {
              style: S.footerText,
              render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
                `${pageNumber} / ${totalPages}`,
            } as object),
          ),
        ),
      )

      // ── Generate & download ──────────────────────────────────────────────────
      const blob   = await pdf(doc).toBlob()
      const url    = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href  = url
      anchor.download = `${objectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-biography.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      setStatus('idle')
    } catch (err) {
      console.error('[Object Biography] PDF error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'generating'}
      style={{
        fontFamily: 'var(--ob-font-mono)',
        fontSize: 'var(--ob-fs-meta)',
        letterSpacing: 'var(--ob-ls-eyebrow)',
        textTransform: 'uppercase',
        color: status === 'error' ? 'var(--ob-red)' : 'var(--ob-fg)',
        background: 'none',
        border: '1px solid var(--ob-rule)',
        padding: '5px 12px',
        cursor: status === 'generating' ? 'wait' : 'pointer',
        opacity: status === 'generating' ? 0.6 : 1,
        whiteSpace: 'nowrap',
        transition: 'border-color 0.15s, color 0.15s',
        ...style,
      }}
    >
      {status === 'generating' ? 'Generating...' : status === 'error' ? 'Failed — retry?' : 'Biography PDF ↓'}
    </button>
  )
}
