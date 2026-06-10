import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BARCELONA_ZONES } from '@/lib/barcelona/zones'

const VALID_SLUGS = new Set(BARCELONA_ZONES.map(z => z.slug))

export async function POST(req: NextRequest) {
  let email: string
  let zone_slugs: string[]

  try {
    const body = await req.json()
    email = String(body.email ?? '').trim().toLowerCase()
    zone_slugs = Array.isArray(body.zone_slugs) ? body.zone_slugs.map(String) : []
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('invalid email')
    zone_slugs = zone_slugs.filter(s => VALID_SLUGS.has(s))
    if (zone_slugs.length === 0) throw new Error('no zones')
  } catch {
    return NextResponse.json({ error: 'Provide a valid email and at least one zone.' }, { status: 400 })
  }

  const rows = zone_slugs.map(zone_slug => ({ email, zone_slug }))
  const { error } = await supabaseAdmin
    .from('barcelona_subscriptions')
    .upsert(rows, { onConflict: 'email,zone_slug', ignoreDuplicates: true })

  if (error) {
    // table missing until the session-6 migration runs
    if (/barcelona_subscriptions/.test(error.message)) {
      return NextResponse.json({ error: 'Alerts are not live yet — check back soon.' }, { status: 503 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, subscribed: zone_slugs })
}
