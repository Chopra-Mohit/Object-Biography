import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = user.id

  // 1. Delete certificates first (reference registrations)
  const { error: certError } = await supabaseAdmin
    .from('certificates')
    .delete()
    .eq('user_id', uid)
  if (certError) {
    console.error('[Object Biography] Delete certificates error:', certError.message)
    return NextResponse.json({ error: 'Failed to delete certificates' }, { status: 500 })
  }

  // 2. Delete corrections
  const { error: corrError } = await supabaseAdmin
    .from('corrections')
    .delete()
    .eq('user_id', uid)
  if (corrError) {
    console.error('[Object Biography] Delete corrections error:', corrError.message)
    return NextResponse.json({ error: 'Failed to delete corrections' }, { status: 500 })
  }

  // 3. Delete registrations
  const { error: regError } = await supabaseAdmin
    .from('registrations')
    .delete()
    .eq('user_id', uid)
  if (regError) {
    console.error('[Object Biography] Delete registrations error:', regError.message)
    return NextResponse.json({ error: 'Failed to delete registrations' }, { status: 500 })
  }

  // 4. Delete public.users row
  const { error: userRowError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', uid)
  if (userRowError) {
    console.error('[Object Biography] Delete user row error:', userRowError.message)
    return NextResponse.json({ error: 'Failed to delete user record' }, { status: 500 })
  }

  // 5. Delete auth user — must be last
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(uid)
  if (authError) {
    console.error('[Object Biography] Delete auth user error:', authError.message)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
