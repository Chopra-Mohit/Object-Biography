import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Public — no auth required.
// type param: 'all' (default) | 'dead' | 'found'
//   dead  = biography-generated registered objects
//   found = quick-insight salvage assessments (input_method = 'salvage')
//   all   = both combined

export async function GET(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get('type') ?? 'all') as 'all' | 'dead' | 'found'

  // privacy-safe fields only — personal_memory and user_id intentionally excluded
  let query = supabaseAdmin
    .from('registrations')
    .select(`
      id,
      manual_brand,
      manual_product_name,
      manual_model,
      manual_year_purchased,
      date_of_death,
      failure_description,
      biography_generated,
      biography_json,
      input_method,
      created_at,
      location_lat,
      location_lng,
      location_name,
      picked_up,
      product_image_url,
      certificates ( share_token, is_public )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (type === 'dead') {
    // All non-salvage registrations (manual, barcode, voice)
    query = query.neq('input_method', 'salvage')
  } else if (type === 'found') {
    query = query.eq('input_method', 'salvage')
  } else {
    // all: everything
    query = query.not('input_method', 'is', null)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Object Biography] Global registry error:', error.message)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Strip personal_memory from biography_json before sending
  type RawRow = typeof data extends (infer T)[] | null ? T : never
  const safeRegistrations = (data ?? []).map((r: RawRow) => {
    if (!r.biography_json) return r
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { personal_memory, ...safeBio } = r.biography_json as Record<string, unknown>
    return { ...r, biography_json: safeBio }
  })

  // ── Aggregate stats ─────────────────────────────────────────────────────────

  const failureCounts: Record<string, number> = {}
  const brandCounts:   Record<string, number> = {}
  const verdictCounts: Record<string, number> = {}

  for (const r of safeRegistrations) {
    if (r.manual_brand) {
      brandCounts[r.manual_brand] = (brandCounts[r.manual_brand] ?? 0) + 1
    }

    if (r.input_method === 'salvage') {
      // Found object — tally verdict
      const bio = r.biography_json as { verdict?: string } | null
      const v   = bio?.verdict
      if (v) verdictCounts[v] = (verdictCounts[v] ?? 0) + 1
    } else {
      // Dead object — tally failure type
      const bio = r.biography_json as { death?: { failure_type?: string } } | null
      const ft  = bio?.death?.failure_type
      if (ft) failureCounts[ft] = (failureCounts[ft] ?? 0) + 1
    }
  }

  const topFailure = Object.entries(failureCounts).sort((a, b) => b[1] - a[1])[0] ?? null
  const topBrand   = Object.entries(brandCounts).sort((a, b)   => b[1] - a[1])[0] ?? null
  const topVerdict = Object.entries(verdictCounts).sort((a, b) => b[1] - a[1])[0] ?? null

  const deadCount  = safeRegistrations.filter(r => r.input_method !== 'salvage').length
  const foundCount = safeRegistrations.filter(r => r.input_method === 'salvage').length

  return NextResponse.json({
    registrations: safeRegistrations,
    stats: {
      total:      safeRegistrations.length,
      deadCount,
      foundCount,
      topFailure: topFailure ? { type: topFailure[0],  count: topFailure[1]  } : null,
      topBrand:   topBrand   ? { brand: topBrand[0],   count: topBrand[1]    } : null,
      topVerdict: topVerdict ? { verdict: topVerdict[0], count: topVerdict[1] } : null,
    },
  })
}
