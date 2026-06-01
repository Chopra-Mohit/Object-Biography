'use client'

import dynamic from 'next/dynamic'

const LeafletMapDisplay = dynamic(() => import('./LeafletMapDisplay'), { ssr: false })

interface Props {
  lat: number
  lng: number
  locationName?: string | null
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

export default function LocationDisplay({ lat, lng, locationName }: Props) {
  return (
    <div style={{ border: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-8)' }}>

      {/* Header */}
      <div style={{
        padding: 'var(--ob-space-3) var(--ob-space-5)',
        borderBottom: '1px solid var(--ob-rule)',
        display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
      }}>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg)' }}>
          Where it was found
        </span>
        {locationName && (
          <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
            {locationName}
          </span>
        )}
      </div>

      {/* Map */}
      <div style={{ position: 'relative' }}>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <LeafletMapDisplay lat={lat} lng={lng} />
      </div>

      {/* Coords */}
      <div style={{ padding: 'var(--ob-space-3) var(--ob-space-5)', borderTop: '1px solid var(--ob-rule)' }}>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', letterSpacing: '0.05em' }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
    </div>
  )
}
