import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import DeathCertificate from '@/components/certificate/DeathCertificate'
import CertificateActions from '@/components/certificate/CertificateActions'
import type { BiographyJSON } from '@/types/database'

interface Props {
  params: Promise<{ token: string }>
}

export default async function CertificatePage({ params }: Props) {
  const { token } = await params

  // Increment view count + fetch — no auth required
  await supabaseAdmin.rpc('increment_certificate_views', { token })

  const { data, error } = await supabaseAdmin
    .from('certificates')
    .select('*, registrations(date_of_death, id)')
    .eq('share_token', token)
    .eq('is_public', true)
    .single()

  if (error || !data) return notFound()

  const biography = data.certificate_data as BiographyJSON
  const registration = data.registrations as { date_of_death: string; id: string } | null
  const dateOfDeath = registration?.date_of_death ?? data.created_at.split('T')[0]
  const registrationId = registration?.id ?? ''

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ob-bg)', paddingTop: 'var(--ob-space-20)', paddingBottom: 'var(--ob-space-20)' }}>
      <div className="ob-container--narrow">

        {/* Back nav */}
        <a href="/" style={{
          display: 'inline-block',
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          letterSpacing: 'var(--ob-ls-stamp)',
          textTransform: 'uppercase',
          color: 'var(--ob-fg-dim)',
          textDecoration: 'none',
          marginBottom: 'var(--ob-space-12)',
        }}>
          ← Object Biography
        </a>

        <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        <span className="ob-eyebrow" style={{ marginBottom: 'var(--ob-space-8)', display: 'block' }}>
          Death certificate · {data.view_count + 1} view{data.view_count !== 0 ? 's' : ''}
        </span>

        {/* The certificate */}
        <DeathCertificate
          biography={biography}
          dateOfDeath={dateOfDeath}
          registrationId={registrationId}
          shareToken={token}
        />

        {/* Actions */}
        <CertificateActions shareToken={token} />

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginTop: 'var(--ob-space-16)' }} />

        {/* Acquisition CTA */}
        <div style={{ marginTop: 'var(--ob-space-10)', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-base)',
            color: 'var(--ob-fg-dim)',
            marginBottom: 'var(--ob-space-5)',
            lineHeight: 'var(--ob-lh-relaxed)',
          }}>
            Every object deserves a record.
          </p>
          <a href="/register" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Register your own dead object →
          </a>
        </div>

      </div>
    </main>
  )
}
