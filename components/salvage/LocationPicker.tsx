'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const LeafletMapPicker = dynamic(() => import('./LeafletMapPicker'), { ssr: false })

export interface LocationData {
  lat: number
  lng: number
  name: string
}

interface Props {
  registrationId: string
  onSaved: (loc: LocationData) => void
  onSkip: () => void
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

export default function LocationPicker({ registrationId, onSaved, onSkip }: Props) {
  const [lat, setLat]       = useState(48.8566)   // default: Paris (overridden by geolocation)
  const [lng, setLng]       = useState(2.3522)
  const [name, setName]     = useState('')
  const [hasPin, setHasPin] = useState(false)
  const [locating, setLocating] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Try geolocation automatically on mount
  useEffect(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setHasPin(true)
        setLocating(false)
      },
      () => {
        setLocating(false)
      },
      { timeout: 6000 }
    )
  }, [])

  function handleMapChange(newLat: number, newLng: number) {
    setLat(newLat)
    setLng(newLng)
    setHasPin(true)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported on this device.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setHasPin(true)
        setLocating(false)
      },
      () => {
        setGeoError('Could not get your location. Pin it on the map instead.')
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }

  async function handleSave() {
    if (!hasPin) return
    setSaving(true)
    try {
      await fetch(`/api/registry/${registrationId}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, location_name: name || null }),
      })
      onSaved({ lat, lng, name })
    } catch {
      // best-effort; don't block user
      onSaved({ lat, lng, name })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginTop: 'var(--ob-space-8)', border: '1px solid var(--ob-rule)' }}>

      {/* Header */}
      <div style={{
        padding: 'var(--ob-space-4) var(--ob-space-5)',
        borderBottom: '1px solid var(--ob-rule)',
        display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
      }}>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg)' }}>
          Pin where you found it
        </span>
        <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
          optional — helps others find it
        </span>
      </div>

      <div style={{ padding: 'var(--ob-space-5)' }}>

        {/* Map */}
        <div style={{ marginBottom: 'var(--ob-space-4)', position: 'relative' }}>
          {/* Leaflet CSS */}
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

          {locating && !hasPin && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(27,27,23,0.7)',
            }}>
              <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase' }}>
                Locating…
              </span>
            </div>
          )}

          <LeafletMapPicker lat={lat} lng={lng} onChange={handleMapChange} />

          {/* Crosshair hint overlay (shown before first pin) */}
          {!hasPin && !locating && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                background: 'rgba(27,27,23,0.78)',
                padding: '6px 14px',
              }}>
                <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase' }}>
                  Click the map to pin location
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Geolocation button */}
        <div style={{ marginBottom: 'var(--ob-space-4)', display: 'flex', gap: 'var(--ob-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            style={{
              ...mono, fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
              background: 'transparent', border: '1px solid var(--ob-rule)',
              color: locating ? 'var(--ob-fg-dim)' : 'var(--ob-fg)',
              padding: '5px 12px', cursor: locating ? 'default' : 'pointer',
            }}
          >
            ◎ {locating ? 'Locating…' : 'Use my current location'}
          </button>
          {hasPin && (
            <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          )}
          {geoError && (
            <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-red)' }}>
              {geoError}
            </span>
          )}
        </div>

        {/* Location description */}
        <div style={{ marginBottom: 'var(--ob-space-5)' }}>
          <span style={{ ...mono, fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase', color: 'var(--ob-fg-dim)', display: 'block', marginBottom: 'var(--ob-space-2)' }}>
            Description (optional)
          </span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Near the bins on Calle Serrano"
            style={{
              ...mono, fontSize: 'var(--ob-fs-base)',
              background: 'transparent',
              border: '1px solid var(--ob-rule)',
              color: 'var(--ob-fg)',
              padding: '8px 12px',
              width: '100%',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasPin || saving}
            className="ob-button"
            style={{ opacity: (!hasPin || saving) ? 0.45 : 1, cursor: (!hasPin || saving) ? 'default' : 'pointer' }}
          >
            {saving ? 'Saving…' : 'Save location →'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="ob-button--ghost ob-button"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
