import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BARCELONA_ZONES, zoneForPoint } from '@/lib/barcelona/zones'

const VALID_SLUGS = new Set(BARCELONA_ZONES.map(z => z.slug))
const VALID_KINDS = new Set(['sighting', 'pickup', 'note'])

export interface FeedEvent {
  id: string
  kind: 'sighting' | 'pickup' | 'note' | 'object-found' | 'object-claimed'
  display_name: string | null
  zone_slug: string | null
  zone_name: string | null
  body: string
  lat: number | null
  lng: number | null
  registration_id: string | null
  created_at: string
}

function zoneName(slug: string | null): string | null {
  if (!slug) return null
  return BARCELONA_ZONES.find(z => z.slug === slug)?.name ?? null
}

/**
 * The feed merges two sources:
 *  1. barcelona_posts — what people write here (sightings, pickups, notes)
 *  2. registrations   — platform activity that happened inside a Barcelona
 *     zone (a found object assessed and dropped on the map, or one claimed)
 */
export async function GET() {
  const events: FeedEvent[] = []

  // 1. Community posts (table may not exist until the session-6 migration)
  const posts = await supabaseAdmin
    .from('barcelona_posts')
    .select('id, display_name, zone_slug, kind, body, lat, lng, registration_id, created_at')
    .order('created_at', { ascending: false })
    .limit(40)

  if (!posts.error && posts.data) {
    for (const p of posts.data) {
      events.push({
        id: `post-${p.id}`,
        kind: p.kind,
        display_name: p.display_name,
        zone_slug: p.zone_slug,
        zone_name: zoneName(p.zone_slug),
        body: p.body,
        lat: p.lat,
        lng: p.lng,
        registration_id: p.registration_id,
        created_at: p.created_at,
      })
    }
  }

  // 2. Found objects located inside Barcelona zones
  const found = await supabaseAdmin
    .from('registrations')
    .select('id, manual_product_name, manual_brand, biography_json, location_lat, location_lng, location_name, picked_up, picked_up_at, created_at')
    .eq('input_method', 'salvage')
    .not('location_lat', 'is', null)
    .order('created_at', { ascending: false })
    .limit(60)

  if (!found.error && found.data) {
    for (const r of found.data) {
      const zone = zoneForPoint(r.location_lat as number, r.location_lng as number)
      if (!zone) continue // outside Barcelona

      const bio = r.biography_json as { object_identified?: string } | null
      const name = r.manual_product_name || bio?.object_identified || 'Found object'

      events.push({
        id: `found-${r.id}`,
        kind: 'object-found',
        display_name: null,
        zone_slug: zone.slug,
        zone_name: zone.name,
        body: `${name} spotted${r.location_name ? ` near ${r.location_name}` : ''}`,
        lat: r.location_lat,
        lng: r.location_lng,
        registration_id: r.id,
        created_at: r.created_at,
      })

      if (r.picked_up && r.picked_up_at) {
        events.push({
          id: `claimed-${r.id}`,
          kind: 'object-claimed',
          display_name: null,
          zone_slug: zone.slug,
          zone_name: zone.name,
          body: `${name} was picked up`,
          lat: r.location_lat,
          lng: r.location_lng,
          registration_id: r.id,
          created_at: r.picked_up_at,
        })
      }
    }
  }

  events.sort((a, b) => b.created_at.localeCompare(a.created_at))
  return NextResponse.json({ events: events.slice(0, 50) })
}

export async function POST(req: NextRequest) {
  let body: string, kind: string, zone_slug: string | null, display_name: string | null
  let lat: number | null, lng: number | null

  try {
    const json = await req.json()
    body = String(json.body ?? '').trim().slice(0, 500)
    kind = VALID_KINDS.has(json.kind) ? json.kind : 'note'
    zone_slug = VALID_SLUGS.has(json.zone_slug) ? json.zone_slug : null
    display_name = json.display_name ? String(json.display_name).trim().slice(0, 40) : null
    lat = isFinite(Number(json.lat)) && json.lat !== null && json.lat !== undefined ? Number(json.lat) : null
    lng = isFinite(Number(json.lng)) && json.lng !== null && json.lng !== undefined ? Number(json.lng) : null
    if (!body) throw new Error('empty')
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('barcelona_posts')
    .insert({ body, kind, zone_slug, display_name, lat, lng })
    .select('id, created_at')
    .single()

  if (error) {
    if (/barcelona_posts/.test(error.message)) {
      return NextResponse.json({ error: 'The feed is not live yet — check back soon.' }, { status: 503 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id, created_at: data.created_at })
}
