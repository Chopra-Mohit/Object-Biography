import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  let picked_up: boolean
  let picked_up_by: string | null

  try {
    const body = await req.json()
    picked_up    = Boolean(body.picked_up)
    picked_up_by = body.picked_up_by ?? null
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const picked_up_at = picked_up ? new Date().toISOString() : null

  let { error } = await supabaseAdmin
    .from('registrations')
    .update({
      picked_up,
      picked_up_at,
      picked_up_by: picked_up ? picked_up_by : null,   // clear on un-pickup
    })
    .eq('id', id)

  // picked_up_by column may not exist until the session-6 migration runs
  if (error && /picked_up_by/.test(error.message)) {
    const retry = await supabaseAdmin
      .from('registrations')
      .update({ picked_up, picked_up_at })
      .eq('id', id)
    error = retry.error
    picked_up_by = null
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, picked_up_at, picked_up_by: picked_up ? picked_up_by : null })
}
