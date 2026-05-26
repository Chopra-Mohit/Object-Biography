'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductIdentification } from '@/app/api/identify-product/route'

interface FormState {
  manual_brand: string
  manual_product_name: string
  manual_model: string
  manual_year_purchased: string
  failure_description: string
  personal_memory: string
}

const EMPTY: FormState = {
  manual_brand: '',
  manual_product_name: '',
  manual_model: '',
  manual_year_purchased: '',
  failure_description: '',
  personal_memory: '',
}

export default function ManualEntryForm() {
  const router = useRouter()
  const fileInputRef   = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Image identification state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [identifying, setIdentifying] = useState(false)
  const [identified, setIdentified] = useState<ProductIdentification | null>(null)
  const [identifyError, setIdentifyError] = useState<string | null>(null)

  // Persistent image URL (uploaded to Supabase Storage)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  // Wikipedia auto-suggest state
  const [wikiSearching, setWikiSearching] = useState(false)
  const [wikiSuggestion, setWikiSuggestion] = useState<string | null>(null) // suggested image URL
  const [wikiConfirmed, setWikiConfirmed] = useState(false)
  const [confirmedImageUrl, setConfirmedImageUrl] = useState<string | null>(null)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setError(null)
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIdentifyError(null)
    setIdentified(null)
    setUploadedImageUrl(null)
    // Clear any Wikipedia suggestion since user now has their own photo
    setWikiSuggestion(null)
    setWikiConfirmed(false)
    setConfirmedImageUrl(null)

    // Preview
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setIdentifying(true)

    // Run identify-product and upload-image in parallel
    const identifyForm = new FormData()
    identifyForm.append('image', file)

    const uploadForm = new FormData()
    uploadForm.append('image', file)
    uploadForm.append('folder', 'dead')

    const [identifyRes, uploadRes] = await Promise.allSettled([
      fetch('/api/identify-product', { method: 'POST', body: identifyForm }),
      fetch('/api/upload-image', { method: 'POST', body: uploadForm }),
    ])

    setIdentifying(false)

    // Handle identification result
    if (identifyRes.status === 'fulfilled') {
      const res = identifyRes.value
      const json = await res.json()
      if (res.ok) {
        const id = json as ProductIdentification
        setIdentified(id)
        setForm(prev => ({
          ...prev,
          manual_brand: prev.manual_brand || id.brand || '',
          manual_product_name: prev.manual_product_name || id.product_name || '',
          manual_model: prev.manual_model || id.model || '',
          manual_year_purchased: prev.manual_year_purchased || (id.estimated_year ? String(id.estimated_year) : ''),
          failure_description: prev.failure_description || id.visible_damage || '',
        }))
      } else {
        setIdentifyError(json.error ?? 'Could not identify product.')
      }
    } else {
      setIdentifyError('Network error during identification.')
    }

    // Handle upload result (non-critical)
    if (uploadRes.status === 'fulfilled') {
      const res = uploadRes.value
      if (res.ok) {
        const { url } = await res.json()
        setUploadedImageUrl(url)
      }
    }
  }

  function clearImage() {
    setImagePreview(null)
    setIdentified(null)
    setIdentifyError(null)
    setUploadedImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  // Wikipedia image auto-suggest — fires when user clicks "Find image"
  async function findWikipediaImage() {
    const query = `${form.manual_brand} ${form.manual_product_name}`.trim()
    if (!query) return
    setWikiSearching(true)
    setWikiSuggestion(null)
    try {
      // Wikipedia REST API supports CORS from the browser
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const thumb = data?.thumbnail?.source ?? null
        if (thumb) {
          setWikiSuggestion(thumb)
        } else {
          setWikiSuggestion('') // empty string = searched but no image found
        }
      } else {
        setWikiSuggestion('')
      }
    } catch {
      setWikiSuggestion('')
    } finally {
      setWikiSearching(false)
    }
  }

  function confirmWikiImage() {
    if (!wikiSuggestion) return
    setConfirmedImageUrl(wikiSuggestion)
    setWikiConfirmed(true)
    setWikiSuggestion(null)
  }

  function rejectWikiImage() {
    setWikiSuggestion(null)
    setWikiConfirmed(false)
    setConfirmedImageUrl(null)
  }

  function removeConfirmedImage() {
    setConfirmedImageUrl(null)
    setWikiConfirmed(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.manual_brand.trim() || !form.manual_product_name.trim()) {
      setError('Brand and product name are required.')
      return
    }
    if (!form.failure_description.trim()) {
      setError('Please describe what broke.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual_brand: form.manual_brand.trim(),
          manual_product_name: form.manual_product_name.trim(),
          manual_model: form.manual_model.trim() || undefined,
          manual_year_purchased: form.manual_year_purchased
            ? parseInt(form.manual_year_purchased, 10)
            : undefined,
          failure_description: form.failure_description.trim(),
          personal_memory: form.personal_memory.trim() || undefined,
          input_method: 'manual',
          product_image_url: uploadedImageUrl || confirmedImageUrl || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push(`/biography/${json.registration_id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canFindImage = !imagePreview && !confirmedImageUrl && form.manual_brand.trim().length > 0 && form.manual_product_name.trim().length > 0

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)' }}>

      {/* ── Image upload ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
        <span className="ob-eyebrow">
          Photo of the object{' '}
          <span style={{ color: 'var(--ob-fg-faint)' }}>(optional — AI will identify it)</span>
        </span>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />

        {!imagePreview ? (
          <div style={{
            border: '1px dashed var(--ob-rule)',
            padding: 'var(--ob-space-6)',
            display: 'flex',
            gap: 'var(--ob-space-3)',
            flexWrap: 'wrap',
          }}>
            {/* Take photo */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={imgPickerBtnStyle}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ob-fg-dim)'
                e.currentTarget.style.color = 'var(--ob-fg-dim)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--ob-rule)'
                e.currentTarget.style.color = 'var(--ob-fg-faint)'
              }}
            >
              <span style={{ fontSize: '1.2em' }}>◎</span>
              <span>Take photo</span>
            </button>

            {/* Upload from library */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={imgPickerBtnStyle}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ob-fg-dim)'
                e.currentTarget.style.color = 'var(--ob-fg-dim)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--ob-rule)'
                e.currentTarget.style.color = 'var(--ob-fg-faint)'
              }}
            >
              <span style={{ fontSize: '1.2em' }}>⊞</span>
              <span>Upload photo</span>
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <img
              src={imagePreview}
              alt="Product"
              style={{
                width: '100%',
                maxHeight: '220px',
                objectFit: 'contain',
                border: '1px solid var(--ob-rule)',
                background: 'var(--ob-surface-raised)',
              }}
            />
            <button
              type="button"
              onClick={clearImage}
              style={{
                position: 'absolute',
                top: 'var(--ob-space-2)',
                right: 'var(--ob-space-2)',
                background: 'var(--ob-bg)',
                border: '1px solid var(--ob-rule)',
                color: 'var(--ob-fg-dim)',
                fontFamily: 'var(--ob-font-mono)',
                fontSize: 'var(--ob-fs-meta)',
                letterSpacing: 'var(--ob-ls-wide)',
                padding: '0.25rem 0.6rem',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </div>
        )}

        {/* Identification status */}
        {identifying && (
          <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', letterSpacing: 'var(--ob-ls-wide)' }}>
            Identifying product…
          </p>
        )}

        {identified && !identifying && (
          <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-4) var(--ob-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
            <span style={{
              fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
              color: identified.confidence === 'high' ? '#4CAF50' : identified.confidence === 'medium' ? '#FF9800' : 'var(--ob-fg-dim)',
            }}>
              ● Identified · {identified.confidence} confidence
            </span>
            <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)' }}>
              {[identified.brand, identified.product_name, identified.model].filter(Boolean).join(' · ')}
              {identified.notes && ` — ${identified.notes}`}
            </p>
            <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', letterSpacing: 'var(--ob-ls-wide)' }}>
              Fields pre-filled below. Edit anything before submitting.
            </p>
          </div>
        )}

        {identifyError && (
          <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', letterSpacing: 'var(--ob-ls-wide)' }}>
            Could not identify: {identifyError}. Fill in the fields manually.
          </p>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)' }} />

      {/* ── Brand ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
        <label htmlFor="manual_brand" className="ob-eyebrow">Brand / Manufacturer</label>
        <div className="ob-input-row">
          <input
            id="manual_brand"
            type="text"
            placeholder="e.g. Dyson, Bosch, Philips"
            value={form.manual_brand}
            onChange={set('manual_brand')}
            disabled={submitting}
            autoComplete="off"
          />
        </div>
      </div>

      {/* ── Product name ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
        <label htmlFor="manual_product_name" className="ob-eyebrow">Product name / type</label>
        <div className="ob-input-row">
          <input
            id="manual_product_name"
            type="text"
            placeholder="e.g. Cordless vacuum cleaner"
            value={form.manual_product_name}
            onChange={set('manual_product_name')}
            disabled={submitting}
            autoComplete="off"
          />
        </div>
      </div>

      {/* ── Wikipedia image auto-suggest (only when no photo uploaded) ─ */}
      {canFindImage && !wikiSuggestion && !wikiSearching && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-3)' }}>
          <button
            type="button"
            onClick={findWikipediaImage}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--ob-fg-faint)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Find matching image →
          </button>
        </div>
      )}

      {wikiSearching && (
        <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', letterSpacing: 'var(--ob-ls-wide)' }}>
          Searching…
        </p>
      )}

      {/* Wikipedia suggestion — ask user to confirm */}
      {wikiSuggestion && !wikiConfirmed && (
        <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-5)' }}>
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>
            Is this your {form.manual_product_name}?
          </span>
          <img
            src={wikiSuggestion}
            alt={form.manual_product_name}
            style={{ width: '100%', maxHeight: 180, objectFit: 'contain', marginBottom: 'var(--ob-space-4)', background: 'var(--ob-surface-raised)' }}
          />
          <div style={{ display: 'flex', gap: 'var(--ob-space-3)', flexWrap: 'wrap' }}>
            <button type="button" onClick={confirmWikiImage} className="ob-button" style={{ fontSize: 'var(--ob-fs-meta)' }}>
              Yes, use this image
            </button>
            <button type="button" onClick={rejectWikiImage} className="ob-button--ghost ob-button" style={{ fontSize: 'var(--ob-fs-meta)' }}>
              No, skip
            </button>
          </div>
        </div>
      )}

      {/* Wikipedia search returned no image */}
      {wikiSuggestion === '' && (
        <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', letterSpacing: 'var(--ob-ls-wide)' }}>
          No image found. You can upload your own above, or continue without one.
        </p>
      )}

      {/* Confirmed Wikipedia image preview */}
      {confirmedImageUrl && (
        <div style={{ position: 'relative' }}>
          <img
            src={confirmedImageUrl}
            alt={form.manual_product_name}
            style={{ width: '100%', maxHeight: 180, objectFit: 'contain', border: '1px solid var(--ob-rule)', background: 'var(--ob-surface-raised)' }}
          />
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-faint)', display: 'block', marginTop: 4 }}>
            Image from Wikipedia
          </span>
          <button
            type="button"
            onClick={removeConfirmedImage}
            style={{
              position: 'absolute', top: 'var(--ob-space-2)', right: 'var(--ob-space-2)',
              background: 'var(--ob-bg)', border: '1px solid var(--ob-rule)',
              color: 'var(--ob-fg-dim)', fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)', letterSpacing: 'var(--ob-ls-wide)',
              padding: '0.25rem 0.6rem', cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      )}

      {/* ── Model + Year ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ob-space-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
          <label htmlFor="manual_model" className="ob-eyebrow">
            Model <span style={{ color: 'var(--ob-fg-faint)' }}>(optional)</span>
          </label>
          <div className="ob-input-row">
            <input
              id="manual_model"
              type="text"
              placeholder="e.g. V11 Absolute"
              value={form.manual_model}
              onChange={set('manual_model')}
              disabled={submitting}
              autoComplete="off"
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
          <label htmlFor="manual_year_purchased" className="ob-eyebrow">
            Year purchased <span style={{ color: 'var(--ob-fg-faint)' }}>(optional)</span>
          </label>
          <div className="ob-input-row">
            <input
              id="manual_year_purchased"
              type="number"
              placeholder="e.g. 2019"
              min={1970}
              max={new Date().getFullYear()}
              value={form.manual_year_purchased}
              onChange={set('manual_year_purchased')}
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      {/* ── What broke ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
        <label htmlFor="failure_description" className="ob-eyebrow">What broke</label>
        <textarea
          id="failure_description"
          placeholder="Describe what failed. Be specific — the battery no longer holds charge, the motor seized, the hinge snapped."
          value={form.failure_description}
          onChange={set('failure_description')}
          disabled={submitting}
          rows={4}
          style={{
            background: 'transparent',
            border: '1px solid var(--ob-fg-dim)',
            padding: '0.9rem 1.1rem',
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-input)',
            color: 'var(--ob-fg)',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 'var(--ob-lh-relaxed)',
            letterSpacing: 'var(--ob-ls-wide)',
            borderRadius: 'var(--ob-radius)',
            width: '100%',
          }}
        />
      </div>

      {/* ── Personal memory ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
        <label htmlFor="personal_memory" className="ob-eyebrow">
          Anything you remember about this object{' '}
          <span style={{ color: 'var(--ob-fg-faint)' }}>(optional)</span>
        </label>
        <textarea
          id="personal_memory"
          placeholder="Where you got it. What it meant to you. The last day it worked."
          value={form.personal_memory}
          onChange={set('personal_memory')}
          disabled={submitting}
          rows={3}
          style={{
            background: 'transparent',
            border: '1px solid var(--ob-fg-dim)',
            padding: '0.9rem 1.1rem',
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-input)',
            color: 'var(--ob-fg)',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 'var(--ob-lh-relaxed)',
            letterSpacing: 'var(--ob-ls-wide)',
            borderRadius: 'var(--ob-radius)',
            width: '100%',
          }}
        />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-small)', color: 'var(--ob-red)', letterSpacing: 'var(--ob-ls-wide)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        className="ob-button"
        disabled={submitting || identifying}
        style={{ alignSelf: 'flex-start', opacity: (submitting || identifying) ? 0.5 : 1 }}
      >
        {submitting ? 'Registering…' : 'Register object'}
      </button>

    </form>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const imgPickerBtnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--ob-space-2)',
  background: 'transparent',
  border: '1px solid var(--ob-rule)',
  padding: 'var(--ob-space-4) var(--ob-space-5)',
  cursor: 'pointer',
  fontFamily: 'var(--ob-font-mono)',
  fontSize: 'var(--ob-fs-small)',
  color: 'var(--ob-fg-faint)',
  letterSpacing: 'var(--ob-ls-wide)',
  textTransform: 'uppercase',
  transition: 'border-color 0.15s, color 0.15s',
}
