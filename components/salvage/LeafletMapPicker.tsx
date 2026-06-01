'use client'

import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

export default function LeafletMapPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamic import — Leaflet requires window
    import('leaflet').then(L => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, { zoomControl: true }).setView([lat, lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChange(pos.lat, pos.lng)
      })
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng])
        onChange(e.latlng.lat, e.latlng.lng)
      })

      mapRef.current = map
      markerRef.current = marker
    })

    return () => {
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapRef.current as any).remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync marker when lat/lng change from outside (e.g. geolocation)
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return
    import('leaflet').then(L => {
      const latlng = new L.LatLng(lat, lng)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(markerRef.current as any).setLatLng(latlng)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapRef.current as any).setView(latlng, 15)
    })
  }, [lat, lng])

  return <div ref={containerRef} style={{ width: '100%', height: 260 }} />
}
