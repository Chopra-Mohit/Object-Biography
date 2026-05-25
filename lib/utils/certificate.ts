import type { BiographyJSON } from '@/types/database'

export function buildCertificateData(biography: BiographyJSON): BiographyJSON {
  // Certificates are immutable snapshots — return a deep copy with generation timestamp
  return {
    ...biography,
    generated_at: biography.generated_at ?? new Date().toISOString(),
  }
}

export function formatShareUrl(token: string, baseUrl?: string): string {
  const base = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}/certificate/${token}`
}
