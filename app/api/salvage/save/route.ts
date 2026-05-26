import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { QuickInsightResult } from '@/lib/anthropic/quickInsightTypes'

// Saves a quick-insight salvage assessment to the global registry.
// Auth is optional — anonymous saves are allowed so the registry fills freely.
// If signed in, the record is linked to the user's account.
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let result: QuickInsightResult
  let imageUrl: string | null = null
  try {
    const body = await req.json()
    result = body.result
    imageUrl = body.image_url ?? null
    if (!result?.object_identified) throw new Error('missing result')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const biographyJson = { _type: 'quick_insight', ...result }

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .insert({
      user_id:              user?.id ?? null,
      product_id:           null,
      manual_brand:         result.manufacturer || 'Unknown',
      manual_product_name:  result.object_identified,
      manual_model:         result.model || null,
      manual_year_purchased: result.estimated_manufacture_year
        ? parseInt(result.estimated_manufacture_year, 10) || null
        : null,
      date_of_death:        new Date().toISOString().split('T')[0],
      failure_description:  'Salvage assessment',
      input_method:         'salvage',
      biography_generated:  false,
      biography_json:       biographyJson,
      product_image_url:    imageUrl,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Object Biography] salvage save:', error.message, error.code)
    return NextResponse.json({ error: 'Database error', detail: error.message, code: error.code }, { status: 500 })
  }

  return NextResponse.json({ registration_id: data.id }, { status: 201 })
}
