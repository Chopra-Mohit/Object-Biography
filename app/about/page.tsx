import { createServerSupabaseClient } from '@/lib/supabase/server'
import InnerNav from '@/components/InnerNav'
import Argument from '@/app/components/Argument'
import WhoItsFor from '@/app/components/WhoItsFor'
import BarcelonaHighlight from '@/app/components/BarcelonaHighlight'

export const metadata = {
  title: 'About — Object Biography',
  description: 'Who Object Biography is for, the argument behind it, and how the Barcelona collection-nights feature works.',
}

export default async function AboutPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <InnerNav userEmail={user?.email ?? null} />
      <main style={{
        minHeight: '100vh',
        background: 'var(--ob-bg)',
        paddingTop: 'calc(52px + var(--ob-space-8))',
        paddingBottom: 'var(--ob-space-16)',
      }}>
        <Argument />
        <WhoItsFor />
        <BarcelonaHighlight />
      </main>
    </>
  )
}
