import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateBiography } from '@/lib/anthropic/biography'
import type { BiographyJSON, DBRegistration } from '@/types/database'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // No auth required — biography generation is open.
  // Registration IDs are UUIDs (128-bit random) and effectively unguessable.

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

  // Fetch by ID only — no user_id scope (supports anonymous registrations)
  const { data: reg, error: regError } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single()

  if (regError || !reg) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  const registration = reg as DBRegistration

  // Already generated — return cached result
  if (registration.biography_generated && registration.biography_json) {
    return NextResponse.json(registration.biography_json)
  }

  const brand = registration.manual_brand ?? 'Unknown brand'
  const productName = registration.manual_product_name ?? 'Unknown product'

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let finalBiography: BiographyJSON | null = null

      try {
        for await (const chunk of generateBiography({
          brand,
          productName,
          model: registration.manual_model,
          yearPurchased: registration.manual_year_purchased,
          failureDescription: registration.failure_description,
          personalMemory: registration.personal_memory,
        })) {
          controller.enqueue(encoder.encode(chunk))

          try {
            const parsed = JSON.parse(chunk.replace(/^data: /, '').trim())
            if (parsed.type === 'done' && parsed.biography) {
              finalBiography = parsed.biography
            }
          } catch {
            // Not a done chunk — continue
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`)
        )
      } finally {
        if (finalBiography) {
          const { error: saveError } = await supabaseAdmin
            .from('registrations')
            .update({
              biography_json: finalBiography,
              biography_generated: true,
              biography_version: (registration.biography_version ?? 0) + 1,
            })
            .eq('id', registrationId)

          if (saveError) {
            console.error('[Object Biography] Failed to save biography:', saveError.message)
          }
        }

        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
