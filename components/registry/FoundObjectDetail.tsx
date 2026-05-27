'use client'

import { useState } from 'react'
import type { QuickInsightResult, BBox } from '@/lib/anthropic/quickInsightTypes'
import VerdictBadge from '@/components/salvage/VerdictBadge'
import SalvageCard from '@/components/salvage/SalvageCard'
import AnnotatedImage from '@/components/salvage/AnnotatedImage'

interface HoveredComponent {
  component: string
  bbox: BBox | null
  type: 'salvageable' | 'non-salvageable'
}

interface Props {
  result: QuickInsightResult
  imageUrl?: string | null
}

/**
 * Renders the full salvage analysis on the registry detail page —
 * identical to what the live salvage page shows:
 *   AnnotatedImage (original + component-map side-by-side, hover-linked)
 *   VerdictBadge
 *   SalvageCard
 */
export default function FoundObjectDetail({ result, imageUrl }: Props) {
  const [hoveredComponent, setHoveredComponent] = useState<HoveredComponent | null>(null)

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
      {/* Annotated image — original on left, component map on right */}
      {imageUrl && (
        <div style={{ marginBottom: 'var(--ob-space-8)' }}>
          <AnnotatedImage
            imageUrl={imageUrl}
            activeComponent={hoveredComponent}
            allComponents={allAnnotations}
          />
        </div>
      )}

      {/* Verdict */}
      <VerdictBadge verdict={result.verdict} reason={result.verdict_reason} />

      {/* Full breakdown — hover on a component highlights its box above */}
      <SalvageCard result={result} onComponentHover={setHoveredComponent} />
    </div>
  )
}
