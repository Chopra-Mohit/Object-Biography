'use client'

import { useState } from 'react'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleExport() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/export')
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `object-biography-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="ob-button"
        style={{
          cursor:  loading ? 'wait'    : 'pointer',
          opacity: loading ? 0.6       : 1,
        }}
      >
        {loading ? 'Preparing export...' : 'Export all objects as JSON ↓'}
      </button>
      {error && (
        <p style={{
          fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
          color: 'var(--ob-red)', marginTop: 'var(--ob-space-3)', margin: 0,
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
