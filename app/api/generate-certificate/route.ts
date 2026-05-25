import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildCertificateData } from '@/lib/utils/certificate'
import type { DBRegistration, BiographyJSON } from '@/types/database'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let registrationId: string
  try {
    const body = await request.json()
    registrationId = body.registration_id
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!registrationId) {
    return NextResponse.json({ error: 'registration_id is required' }, { status: 400 })
  }

  // Fetch registration
  const { data: reg, error: regError } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .eq('user_id', user.id)
    .single()

  if (regError || !reg) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  const registration = reg as DBRegistration

  if (!registration.biography_generated || !registration.biography_json) {
    return NextResponse.json({ error: 'Biography not yet generated' }, { status: 400 })
  }

  // Check if certificate already exists for this registration
  const { data: existing } = await supabaseAdmin
    .from('certificates')
    .select('share_token, pdf_url, png_url')
    .eq('registration_id', registrationId)
    .single()

  if (existing) {
    return NextResponse.json({
      share_token: existing.share_token,
      pdf_url: existing.pdf_url,
      png_url: existing.png_url,
    })
  }

  const certificateData = buildCertificateData(registration.biography_json as BiographyJSON)

  // Insert certificate row — Supabase generates share_token automatically
  const { data: cert, error: certError } = await supabaseAdmin
    .from('certificates')
    .insert({
      registration_id: registrationId,
      user_id: user.id,
      certificate_data: certificateData,
      is_public: true,
      revision_notes: [],
    })
    .select('id, share_token')
    .single()

  if (certError || !cert) {
    console.error('[Object Biography] Certificate insert error:', certError?.message)
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }

  return NextResponse.json({
    share_token: cert.share_token,
    pdf_url: null,
    png_url: null,
  }, { status: 201 })
}
