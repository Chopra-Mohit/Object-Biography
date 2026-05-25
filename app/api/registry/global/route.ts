import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  // Auth required — must be signed in to browse the global registry
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all biography-complete registrations — privacy-safe fields only.
  // personal_memory is intentionally excluded from the select list.
  // user_id is intentionally excluded.
  const { data, error } = await supabaseAdmin
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
      created_at,
      certificates ( share_token, is_public )
    `)
    .eq('biography_generated', true)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[Object Biography] Global registry error:', error.message)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Strip personal_memory from biography_json before sending —
  // it should not have been selected above, but belt-and-suspenders.
  type RawRow = typeof data extends (infer T)[] | null ? T : never
  const safeRegistrations = (data ?? []).map((r: RawRow) => {
    if (!r.biography_json) return r
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { personal_memory, ...safeBio } = r.biography_json as Record<string, unknown>
    return { ...r, biography_json: safeBio }
  })

  // Build aggregate stats
  const failureCounts: Record<string, number> = {}
  const brandCounts:   Record<string, number> = {}

  for (const r of safeRegistrations) {
    const bio = r.biography_json as { death?: { failure_type?: string } } | null
    const ft = bio?.death?.failure_type
    if (ft) failureCounts[ft] = (failureCounts[ft] ?? 0) + 1

    const brand = r.manual_brand
    if (brand) brandCounts[brand] = (brandCounts[brand] ?? 0) + 1
  }

  const topFailure = Object.entries(failureCounts).sort((a, b) => b[1] - a[1])[0] ?? null
  const topBrand   = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0] ?? null

  return NextResponse.json({
    registrations: safeRegistrations,
    stats: {
      total:      safeRegistrations.length,
      topFailure: topFailure ? { type: topFailure[0], count: topFailure[1] } : null,
      topBrand:   topBrand   ? { brand: topBrand[0],  count: topBrand[1]  } : null,
    },
  })
}
