import { NextRequest, NextResponse } from 'next/server'
import { generateQuickInsight } from '@/lib/anthropic/quickInsight'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function POST(request: NextRequest) {
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

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mimeType = file.type === 'image/heic' || file.type === 'image/heif' ? 'image/jpeg' : file.type

  let result
  try {
    result = await generateQuickInsight(base64, mimeType)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error('[Object Biography] Quick insight error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Upload image to Supabase Storage so it can be shown in the registry.
  // Non-critical — analysis is returned even if storage upload fails.
  let image_url: string | null = null
  try {
    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'
    const path = `salvage/${randomUUID()}.${ext}`
    const { error: storageErr } = await supabaseAdmin.storage
      .from('object-images')
      .upload(path, Buffer.from(arrayBuffer), { contentType: mimeType, upsert: false })
    if (storageErr) {
      console.error('[Object Biography] Salvage image upload failed:', storageErr.message)
    } else {
      const { data: { publicUrl } } = supabaseAdmin.storage.from('object-images').getPublicUrl(path)
      image_url = publicUrl
    }
  } catch (storageErr) {
    console.error('[Object Biography] Storage error:', storageErr)
  }

  return NextResponse.json({ ...result, image_url })
}
