import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  let lat: number, lng: number, location_name: string | null

  try {
    const body = await req.json()
    lat  = Number(body.lat)
    lng  = Number(body.lng)
    location_name = body.location_name ?? null
    if (!isFinite(lat) || !isFinite(lng)) throw new Error('invalid coords')
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('registrations')
    .update({ location_lat: lat, location_lng: lng, location_name })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
