'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  registrationId: string
  objectName: string
  brand: string | null
}

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

/**
 * Shown on dead-object detail pages that have no photo.
 * Two paths to an image: upload your own, or accept a Wikipedia suggestion.
 * Either way the URL is PATCHed onto the registration and the page refreshes.
 */
export default function DeadObjectImageSection({ registrationId, objectName, brand }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [wikiSuggestion, setWikiSuggestion] = useState<string | null>(null) // '' = searched, nothing found
  const [savedUrl, setSavedUrl] = useState<string | null>(null)

  async function saveImageUrl(url: string) {
    const res = await fetch(`/api/registry/${registrationId}/image`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_image_url: url }),
    })
    if (!res.ok) throw new Error('save failed')
    setSavedUrl(url)
    router.refresh()
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setStatusMsg('Uploading…')
    try {
      const form = new FormData()
      form.append('image', file)
      form.append('folder', 'dead')
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      if (!res.ok) throw new Error('upload failed')
      const { url } = await res.json()
      await saveImageUrl(url)
      setStatusMsg(null)
    } catch {
      setStatusMsg('Upload failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function findWikipediaImage() {
    const query = [brand, objectName].filter(Boolean).join(' ').trim()
    if (!query) return
    setBusy(true)
    setStatusMsg('Searching Wikipedia…')
    setWikiSuggestion(null)
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setWikiSuggestion(data?.thumbnail?.source ?? '')
      } else {
        setWikiSuggestion('')
      }
      setStatusMsg(null)
    } catch {
      setWikiSuggestion('')
      setStatusMsg(null)
    } finally {
      setBusy(false)
    }
  }

  async function confirmWikiImage() {
    if (!wikiSuggestion) return
    setBusy(true)
    try {
      await saveImageUrl(wikiSuggestion)
      setWikiSuggestion(null)
    } catch {
      setStatusMsg('Could not save the image. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (savedUrl) {
    return (
      <div style={{ marginBottom: 'var(--ob-space-10)' }}>
        <img
          src={savedUrl}
          alt={objectName}
          style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div style={{ border: '1px dashed var(--ob-rule)', padding: 'var(--ob-space-6)', marginBottom: 'var(--ob-space-10)' }}>
      <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>
        No photograph on record
      </span>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {!wikiSuggestion && (
        <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            style={actionBtnStyle}
          >
            ⊞ Upload a photo
          </button>
          <button
            type="button"
            onClick={findWikipediaImage}
            disabled={busy}
            style={actionBtnStyle}
          >
            Find matching image →
          </button>
        </div>
      )}

      {statusMsg && (
        <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', marginTop: 'var(--ob-space-3)', marginBottom: 0 }}>
          {statusMsg}
        </p>
      )}

      {wikiSuggestion === '' && (
        <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', marginTop: 'var(--ob-space-3)', marginBottom: 0 }}>
          No image found on Wikipedia. You can upload your own.
        </p>
      )}

      {wikiSuggestion && (
        <div style={{ marginTop: 'var(--ob-space-4)' }}>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-3)' }}>
            Is this the object?
          </span>
          <img
            src={wikiSuggestion}
            alt={objectName}
            style={{ width: '100%', maxHeight: 180, objectFit: 'contain', marginBottom: 'var(--ob-space-4)', background: 'var(--ob-surface-raised)' }}
          />
          <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap' }}>
            <button type="button" onClick={confirmWikiImage} disabled={busy} className="ob-button" style={{ fontSize: 'var(--ob-fs-meta)' }}>
              Yes, use this image
            </button>
            <button type="button" onClick={() => setWikiSuggestion(null)} disabled={busy} className="ob-button--ghost ob-button" style={{ fontSize: 'var(--ob-fs-meta)' }}>
              No, skip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const actionBtnStyle: React.CSSProperties = {
  ...mono,
  flex: 1,
  minWidth: 150,
  background: 'transparent',
  border: '1px solid var(--ob-rule)',
  padding: 'var(--ob-space-3) var(--ob-space-4)',
  cursor: 'pointer',
  fontSize: 'var(--ob-fs-meta)',
  color: 'var(--ob-fg-dim)',
  letterSpacing: 'var(--ob-ls-eyebrow)',
  textTransform: 'uppercase',
}
