'use client'

import { useEffect, useRef } from 'react'
import {
  BARCELONA_ZONES, BARCELONA_CENTER, WEEKDAY_COLORS, WEEKDAY_NAMES,
} from '@/lib/barcelona/zones'

export interface BcnMapObject {
  id: string
  name: string
  lat: number
  lng: number
  verdict: string | null
  picked_up: boolean
}

interface Props {
  tonightWeekday: number          // 0–6, Barcelona local
  objects: BcnMapObject[]         // found objects located inside the city
}

const VERDICT_COLOR: Record<string, string> = {
  'worth-picking-up': '#4CAF50',
  'parts-only':       '#FF9800',
  'recycle-only':     '#9C9990',
  'leave-it':         '#C41E1E',
}

export default function BarcelonaZoneMap({ tonightWeekday, objects }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(containerRef.current!, { zoomControl: true })
        .setView(BARCELONA_CENTER, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Zone polygons — coloured by collection weekday; tonight's zones pop
      BARCELONA_ZONES.forEach(zone => {
        const color = WEEKDAY_COLORS[zone.weekday] ?? '#9C9990'
        const isTonight = zone.weekday === tonightWeekday

        const poly = L.polygon(zone.polygon, {
          color,
          weight: isTonight ? 2.5 : 1,
          opacity: isTonight ? 0.95 : 0.45,
          fillColor: color,
          fillOpacity: isTonight ? 0.35 : 0.12,
          dashArray: isTonight ? undefined : '4 4',
        })

        poly.bindPopup(`
          <div style="font-family:'Courier New',monospace;min-width:170px;padding:2px 0">
            <div style="font-size:12px;color:#EDEAE1;margin-bottom:4px;line-height:1.3">${zone.name}</div>
            <span style="color:${color};font-size:10px;letter-spacing:0.1em;text-transform:uppercase">
              ${WEEKDAY_NAMES[zone.weekday]} · 20:00–22:00
            </span>
            ${isTonight ? '<div style="margin-top:6px;color:#4CAF50;font-size:10px;letter-spacing:0.12em;text-transform:uppercase">● Collection tonight</div>' : ''}
          </div>
        `, { className: 'ob-map-popup' })

        poly.addTo(map)
      })

      // Found objects already pinned inside the city
      objects.forEach(item => {
        const color = item.picked_up ? '#444440' : (VERDICT_COLOR[item.verdict ?? ''] ?? '#ADAAA1')
        const marker = L.circleMarker([item.lat, item.lng], {
          radius: item.picked_up ? 4 : 7,
          fillColor: color,
          color,
          weight: 1.5,
          opacity: item.picked_up ? 0.4 : 0.95,
          fillOpacity: item.picked_up ? 0.25 : 0.6,
        })

        marker.bindPopup(`
          <div style="font-family:'Courier New',monospace;min-width:160px;padding:2px 0">
            <div style="font-size:12px;color:#EDEAE1;margin-bottom:4px;line-height:1.3">${item.name}</div>
            ${item.picked_up
              ? '<span style="color:#9C9990;font-size:10px;letter-spacing:0.1em;text-transform:uppercase">Picked up</span>'
              : '<span style="color:#4CAF50;font-size:10px;letter-spacing:0.1em;text-transform:uppercase">Still on the street</span>'}
            <div style="margin-top:8px">
              <a href="/registry/${item.id}"
                 style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#EDEAE1;text-decoration:none;border-bottom:1px solid #444440">
                View →
              </a>
            </div>
          </div>
        `, { className: 'ob-map-popup' })

        marker.addTo(map)
      })

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
  }, [tonightWeekday, objects])

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
