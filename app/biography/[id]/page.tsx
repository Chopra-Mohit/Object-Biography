import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { DBRegistration } from '@/types/database'
import BiographyLoader from '@/components/biography/BiographyLoader'
import InnerNav from '@/components/InnerNav'
import MoteAssistant from '@/components/MoteAssistant'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BiographyPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  // No auth redirect — biography pages are open. Signing in unlocks the certificate.

  // Fetch using admin client so anonymous registrations (user_id = null) are visible
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return notFound()

  const registration = data as DBRegistration & { user_id: string | null }

  // Auto-claim: if an authenticated user visits an unclaimed registration, link it.
  // This handles the "register anonymous → sign up → come back" flow seamlessly.
  if (user && !registration.user_id) {
    await supabaseAdmin
      .from('registrations')
      .update({ user_id: user.id })
      .eq('id', id)
      .is('user_id', null)   // guard: only claim if still unclaimed
  }

  const brand = registration.manual_brand ?? 'Unknown brand'
  const productName = registration.manual_product_name ?? 'Unknown product'
  const objectName = `${brand} ${productName}`.trim()

  return (
    <>
    <InnerNav userEmail={user?.email ?? null} />
    <main className="ob-section" style={{ minHeight: '100vh', background: 'var(--ob-bg)', paddingTop: '52px' }}>
      <div className="ob-container--narrow">

        {/* Back nav */}
        <a
          href="/registry"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-stamp)',
            textTransform: 'uppercase',
            color: 'var(--ob-fg-dim)',
            textDecoration: 'none',
            marginBottom: 'var(--ob-space-12)',
          }}
        >
          ← Registry
        </a>

        <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        {/* Object identity */}
        <div style={{ marginBottom: 'var(--ob-space-10)' }}>
          <span className="ob-eyebrow" style={{ marginBottom: 'var(--ob-space-3)' }}>
            {brand} · {registration.date_of_death}
          </span>
          <h1 style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-display)',
            fontWeight: 'var(--ob-fw-regular)',
            color: 'var(--ob-fg)',
            lineHeight: 'var(--ob-lh-snug)',
          }}>
            {productName}
          </h1>
          {registration.manual_model && (
            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg-dim)',
              marginTop: 'var(--ob-space-2)',
              letterSpacing: 'var(--ob-ls-wide)',
            }}>
              {registration.manual_model}
            </p>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        <BiographyLoader
          registrationId={id}
          objectName={objectName}
          alreadyGenerated={registration.biography_generated}
          cachedBiography={registration.biography_json}
          isAuthenticated={!!user}
        />

        <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginTop: 'var(--ob-space-16)' }} />
        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          color: 'var(--ob-fg-faint)',
          marginTop: 'var(--ob-space-5)',
          letterSpacing: '0.05em',
        }}>
          Registration ID: {id}
        </p>

      </div>
    </main>
    <MoteAssistant context="biography" />
    </>
  )
}
