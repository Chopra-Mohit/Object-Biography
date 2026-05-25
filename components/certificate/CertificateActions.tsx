'use client'

import { useState } from 'react'
import { toPng } from 'html-to-image'

interface Props {
  shareToken: string
}

export default function CertificateActions({ shareToken }: Props) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const shareUrl = `${window.location.origin}/certificate/${shareToken}`

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadPng() {
    const el = document.getElementById('death-certificate')
    if (!el) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `certificate-${shareToken}.png`
      a.click()
    } catch (err) {
      console.error('[Object Biography] PNG export failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--ob-space-4)',
      marginTop: 'var(--ob-space-8)',
      flexWrap: 'wrap',
    }}>
      <button onClick={copyLink} className="ob-button--ghost ob-button" style={{ fontSize: 'var(--ob-fs-meta)' }}>
        {copied ? 'Link copied' : 'Copy share link'}
      </button>
      <button onClick={downloadPng} className="ob-button--ghost ob-button" disabled={downloading} style={{ fontSize: 'var(--ob-fs-meta)' }}>
        {downloading ? 'Exporting…' : 'Download PNG'}
      </button>
    </div>
  )
}
