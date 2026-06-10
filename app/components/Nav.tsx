import { createServerSupabaseClient } from '@/lib/supabase/server'
import NavClient from './NavClient'

export default async function Nav() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <NavClient userEmail={user?.email ?? null} />
}
