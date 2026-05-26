import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  // Auth is optional — anonymous registrations are allowed.
  // If signed in, the registration is linked to the user.
  // If anonymous, user_id is null; the record is claimed when they sign up
  // and visit the biography page.
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let body: {
    manual_brand: string
    manual_product_name: string
    manual_model?: string
    manual_year_purchased?: number
    failure_description: string
    personal_memory?: string
    input_method?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    manual_brand,
    manual_product_name,
    manual_model,
    manual_year_purchased,
    failure_description,
    personal_memory,
    input_method = 'manual',
  } = body

  if (!manual_brand || !manual_product_name) {
    return NextResponse.json(
      { error: 'manual_brand and manual_product_name are required' },
      { status: 400 }
    )
  }

  if (!failure_description) {
    return NextResponse.json(
      { error: 'failure_description is required' },
      { status: 400 }
    )
  }

  // Use admin client to bypass RLS — works for both authenticated and anonymous inserts
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .insert({
      user_id: user?.id ?? null,
      product_id: null,
      manual_brand,
      manual_product_name,
      manual_model: manual_model ?? null,
      manual_year_purchased: manual_year_purchased ?? null,
      date_of_death: new Date().toISOString().split('T')[0],
      failure_description,
      personal_memory: personal_memory ?? null,
      input_method,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Object Biography] register:', error.message)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ registration_id: data.id }, { status: 201 })
}
