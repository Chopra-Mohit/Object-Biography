import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildCertificateData } from '@/lib/utils/certificate'
import type { DBRegistration, BiographyJSON } from '@/types/database'

export async function POST(request: NextRequest) {
  // Auth is optional — anyone can generate and VIEW a certificate.
  // Downloading or emailing is gated on the certificate page itself.
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  // Fetch by ID only — supports anonymous registrations
  const { data: reg, error: regError } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single()

  if (regError || !reg) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  const registration = reg as DBRegistration

  if (!registration.biography_generated || !registration.biography_json) {
    return NextResponse.json({ error: 'Biography not yet generated' }, { status: 400 })
  }

  // Return existing certificate if one already exists
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

  const { data: cert, error: certError } = await supabaseAdmin
    .from('certificates')
    .insert({
      registration_id: registrationId,
      user_id: user?.id ?? null,   // null for anonymous — fine, download gate is on the page
      certificate_data: certificateData,
      is_public: true,
      revision_notes: [],
    })
    .select('id, share_token')
    .single()

  if (certError || !cert) {
    console.error('[Object Biography] Certificate insert error:', certError?.message, certError?.code)
    return NextResponse.json({ error: 'Failed to create certificate', detail: certError?.message }, { status: 500 })
  }

  return NextResponse.json({
    share_token: cert.share_token,
    pdf_url: null,
    png_url: null,
  }, { status: 201 })
}
