import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { groq } from '@/lib/anthropic/client'

export interface ProductIdentification {
  brand: string | null
  product_name: string | null
  model: string | null
  estimated_year: number | null
  visible_damage: string | null
  confidence: 'high' | 'medium' | 'low'
  notes: string | null
}

const VISION_PROMPT = `You are identifying a domestic product from a photo for an object biography registry.

Examine the image carefully and return a JSON object with these fields:
- brand: manufacturer name (e.g. "Sony", "Dyson", "Philips") — null if not visible
- product_name: what type of product it is (e.g. "PS4 Controller", "Cordless vacuum cleaner", "Electric kettle") — be specific
- model: model number or name if visible on the product (e.g. "DualShock 4", "V11 Absolute") — null if not visible
- estimated_year: approximate year of manufacture or purchase if determinable from design/markings — null if unknown
- visible_damage: describe any visible damage, wear, or failure points you can see (e.g. "cracked trigger button", "frayed cable near connector", "burnt plastic on base") — null if no damage visible
- confidence: "high" if you can clearly identify the product, "medium" if reasonably sure, "low" if uncertain
- notes: any additional relevant observations about the product's condition or identity — null if none

Return only raw JSON. No markdown. No explanation outside the JSON.`

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('image') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type. Use JPEG, PNG, or WebP.' }, { status: 400 })
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Image too large. Maximum 10MB.' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const dataUrl = `data:${file.type};base64,${base64}`

  try {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: VISION_PROMPT,
            },
          ],
        },
      ],
    })

    const raw = response.choices[0]?.message?.content ?? ''

    let identification: ProductIdentification
    try {
      identification = JSON.parse(raw)
    } catch {
      console.error('[Object Biography] Vision output not parseable:', raw.slice(0, 300))
      return NextResponse.json({ error: 'Could not parse identification result.' }, { status: 500 })
    }

    return NextResponse.json(identification)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Vision API error'
    console.error('[Object Biography] identify-product:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
