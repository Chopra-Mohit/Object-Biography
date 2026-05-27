import { createServerSupabaseClient } from '@/lib/supabase/server'
import NavClient from './NavClient'

// Server component — reads auth, passes display name down to client nav
export default async function Nav() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.email ? user.email.split('@')[0] : null

  return <NavClient displayName={displayName} />
}
