'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { QuickInsightResult, BBox } from '@/lib/anthropic/quickInsightTypes'
import VerdictBadge from '@/components/salvage/VerdictBadge'
import SalvageCard from '@/components/salvage/SalvageCard'
import AnnotatedImage from '@/components/salvage/AnnotatedImage'
import LocationPicker from '@/components/salvage/LocationPicker'

const LocationDisplay = dynamic(() => import('@/components/registry/LocationDisplay'), { ssr: false })

interface HoveredComponent {
  component: string
  bbox: BBox | null
  type: 'salvageable' | 'non-salvageable'
}

interface Props {
  result: QuickInsightResult
  imageUrl?: string | null
  registrationId: string
  userEmail: string | null
  locationLat?: number | null
  locationLng?: number | null
  locationName?: string | null
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

export default function FoundObjectDetail({
  result, imageUrl,
  registrationId, userEmail,
  locationLat, locationLng, locationName,
}: Props) {
  const [hoveredComponent, setHoveredComponent] = useState<HoveredComponent | null>(null)

  // Location state — initialised from server-fetched coords
  const [lat,       setLat]       = useState<number | null>(locationLat ?? null)
  const [lng,       setLng]       = useState<number | null>(locationLng ?? null)
  const [locName,   setLocName]   = useState<string | null>(locationName ?? null)
  const [editing,   setEditing]   = useState(false)  // "Edit location" toggle

  const hasLocation = lat != null && lng != null
  const showPicker  = !hasLocation || editing

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
      {/* ── Location section — ALWAYS shown ──────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--ob-space-8)' }}>

        {/* If pinned and not editing: show map + edit button */}
        {hasLocation && !editing && (
          <div>
            <LocationDisplay lat={lat!} lng={lng!} locationName={locName} />
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                ...mono, fontSize: 'var(--ob-fs-meta)',
                letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                background: 'transparent', border: '1px solid var(--ob-rule)',
                color: 'var(--ob-fg-dim)', padding: '4px 12px',
                cursor: 'pointer', marginTop: 'var(--ob-space-3)',
              }}
            >
              Edit location
            </button>
          </div>
        )}

        {/* If no pin OR editing: show picker */}
        {showPicker && (
          <LocationPicker
            registrationId={registrationId}
            userEmail={userEmail}
            onSaved={loc => {
              setLat(loc.lat)
              setLng(loc.lng)
              setLocName(loc.name || null)
              setEditing(false)
            }}
            onSkip={() => setEditing(false)}
          />
        )}
      </div>

      {/* ── Annotated image ───────────────────────────────────────────────────── */}
      {imageUrl && (
        <div style={{ marginBottom: 'var(--ob-space-8)' }}>
          <AnnotatedImage
            imageUrl={imageUrl}
            activeComponent={hoveredComponent}
            allComponents={allAnnotations}
            onComponentHover={setHoveredComponent}
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
