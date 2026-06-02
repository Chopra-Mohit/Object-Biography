'use client'

import { useEffect, useRef } from 'react'

export interface MapItem {
  id: string
  name: string
  lat: number
  lng: number
  verdict: string | null
  picked_up: boolean
}

interface Props {
  items: MapItem[]
}

const VERDICT_COLOR: Record<string, string> = {
  'worth-picking-up': '#4CAF50',
  'parts-only':       '#FF9800',
  'recycle-only':     '#9C9990',
  'leave-it':         '#C41E1E',
}

const VERDICT_LABEL: Record<string, string> = {
  'worth-picking-up': 'Worth picking up',
  'parts-only':       'Parts only',
  'recycle-only':     'Recycle only',
  'leave-it':         'Leave it',
}

export default function LeafletRegistryMap({ items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || items.length === 0) return

    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      // Centre on mean of all coords
      const avgLat = items.reduce((s, i) => s + i.lat, 0) / items.length
      const avgLng = items.reduce((s, i) => s + i.lng, 0) / items.length
      const zoom   = items.length === 1 ? 14 : 5

      const map = L.map(containerRef.current!, { zoomControl: true }).setView([avgLat, avgLng], zoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const markers: L.CircleMarker[] = []

      items.forEach(item => {
        const color  = item.picked_up ? '#444440' : (VERDICT_COLOR[item.verdict ?? ''] ?? '#ADAAA1')
        const marker = L.circleMarker([item.lat, item.lng], {
          radius:      item.picked_up ? 5 : 8,
          fillColor:   color,
          color:       color,
          weight:      1.5,
          opacity:     item.picked_up ? 0.4 : 0.9,
          fillOpacity: item.picked_up ? 0.25 : 0.55,
        })

        const verdictLabel = item.verdict ? (VERDICT_LABEL[item.verdict] ?? item.verdict) : null
        const statusLine   = item.picked_up
          ? '<span style="color:#9C9990;font-size:10px;letter-spacing:0.1em;text-transform:uppercase">Picked up</span>'
          : verdictLabel
            ? `<span style="color:${color};font-size:10px;letter-spacing:0.1em;text-transform:uppercase">${verdictLabel}</span>`
            : ''

        marker.bindPopup(`
          <div style="font-family:'Courier New',monospace;min-width:160px;padding:2px 0">
            <div style="font-size:12px;color:#EDEAE1;margin-bottom:4px;line-height:1.3">${item.name}</div>
            ${statusLine}
            <div style="margin-top:8px">
              <a href="/registry/${item.id}"
                 style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#EDEAE1;text-decoration:none;border-bottom:1px solid #444440">
                View →
              </a>
            </div>
          </div>
        `, {
          className: 'ob-map-popup',
        })

        marker.addTo(map)
        markers.push(marker)
      })

      // Fit bounds if multiple items
      if (items.length > 1) {
        const group = L.featureGroup(markers)
        map.fitBounds(group.getBounds().pad(0.2))
      }

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapRef.current as any).remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return (
    <>
      <style>{`
        .ob-map-popup .leaflet-popup-content-wrapper {
          background: #26261F;
          border: 1px solid #444440;
          border-radius: 0;
          box-shadow: none;
          padding: 0;
        }
        .ob-map-popup .leaflet-popup-content {
          margin: 10px 14px;
          line-height: 1;
        }
        .ob-map-popup .leaflet-popup-tip-container { display: none; }
        .ob-map-popup .leaflet-popup-close-button {
          color: #9C9990 !important;
          font-size: 16px !important;
          top: 4px !important; right: 6px !important;
        }
      `}</style>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}
