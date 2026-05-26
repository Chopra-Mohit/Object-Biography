'use client'

import { useState } from 'react'
import type { QuickInsightResult, BBox } from '@/lib/anthropic/quickInsightTypes'
import VerdictBadge from '@/components/salvage/VerdictBadge'
import SalvageCard from '@/components/salvage/SalvageCard'

interface HoveredComponent {
  component: string
  bbox: BBox | null
  type: 'salvageable' | 'non-salvageable'
}

interface Props {
  result: QuickInsightResult
}

/**
 * Client wrapper: renders the full salvage analysis (VerdictBadge + SalvageCard)
 * on the registry detail page.  No image to annotate here, so onComponentHover
 * is a no-op.  The image itself is rendered above this component in the page.
 */
export default function FoundObjectDetail({ result }: Props) {
  const [, setHovered] = useState<HoveredComponent | null>(null)

  return (
    <div>
      <VerdictBadge verdict={result.verdict} reason={result.verdict_reason} />
      <SalvageCard result={result} onComponentHover={setHovered} />
    </div>
  )
}
