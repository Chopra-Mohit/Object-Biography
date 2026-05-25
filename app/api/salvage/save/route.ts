import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { QuickInsightResult } from '@/lib/anthropic/quickInsightTypes'

// Saves a quick-insight salvage assessment to the global registry.
// Auth required — the record is attributed to the signed-in user.
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let result: QuickInsightResult
  try {
    const body = await req.json()
    result = body.result
    if (!result?.object_identified) throw new Error('missing result')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Store the QuickInsightResult inside biography_json with a _type marker
  // so the registry can render the correct card.
  const biographyJson = { _type: 'quick_insight', ...result }

  const { data, error } = await supabase
    .from('registrations')
    .insert({
      user_id:              user.id,
      product_id:           null,
      manual_brand:         result.manufacturer || 'Unknown',
      manual_product_name:  result.object_identified,
      manual_model:         result.model || null,
      manual_year_purchased: result.estimated_manufacture_year
        ? parseInt(result.estimated_manufacture_year, 10) || null
        : null,
      date_of_death:        new Date().toISOString().split('T')[0],  // date found/assessed
      failure_description:  'Salvage assessment',  // required field — semantic placeholder
      input_method:         'salvage',
      biography_generated:  false,
      biography_json:       biographyJson,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Object Biography] salvage save:', error.message)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ registration_id: data.id }, { status: 201 })
}
