import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ManualEntryForm from '@/components/registration/ManualEntryForm'
import RegistrationSidebar from '@/components/registration/RegistrationSidebar'
import MoteAssistant from '@/components/MoteAssistant'
import InnerNav from '@/components/InnerNav'
import type { DBRegistration } from '@/types/database'

export const metadata = {
  title: 'Register Object — Object Biography',
}

export default async function RegisterPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/register')

  const { data } = await supabase
    .from('registrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const registrations = (data ?? []) as DBRegistration[]

  return (
    <>
    <InnerNav currentPage="register" />
    <main style={{ minHeight: '100vh', background: 'var(--ob-bg)', paddingTop: 'calc(52px + var(--ob-space-12))', paddingBottom: 'var(--ob-space-20)' }}>
      <div className="ob-container">

        {/* Top nav */}
        <div style={{ marginBottom: 'var(--ob-space-12)' }}>
          <a href="/" style={{
            fontFamily: 'var(--ob-font-mono)',
            fontSize: 'var(--ob-fs-meta)',
            letterSpacing: 'var(--ob-ls-stamp)',
            textTransform: 'uppercase',
            color: 'var(--ob-fg-dim)',
            textDecoration: 'none',
          }}>
            ← Object Biography
          </a>
        </div>

        <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

        {/* Two-column layout */}
        <div className="ob-register-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 'var(--ob-space-12)',
          alignItems: 'start',
        }}>

          {/* Left — form */}
          <div>
            <div style={{ marginBottom: 'var(--ob-space-10)' }}>
              <span className="ob-eyebrow" style={{ marginBottom: 'var(--ob-space-4)' }}>
                Registry intake form
              </span>
              <h1 style={{
                fontFamily: 'var(--ob-font-mono)',
                fontSize: 'var(--ob-fs-display)',
                fontWeight: 'var(--ob-fw-regular)',
                color: 'var(--ob-fg)',
                lineHeight: 'var(--ob-lh-snug)',
                marginBottom: 'var(--ob-space-5)',
              }}>
                Register a dead object
              </h1>
              <p className="ob-body">
                Tell us what broke. Mote will write its biography.
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

            <ManualEntryForm />

            <hr style={{ border: 'none', borderTop: '1px solid var(--ob-rule)', marginTop: 'var(--ob-space-16)' }} />
            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)',
              color: 'var(--ob-fg-faint)',
              marginTop: 'var(--ob-space-5)',
              letterSpacing: '0.05em',
            }}>
              Your personal memory is never used to train AI.
            </p>
          </div>

          {/* Right — sidebar */}
          <RegistrationSidebar registrations={registrations} />

        </div>
      </div>

      <MoteAssistant context="register" />
    </main>
    </>
  )
}
