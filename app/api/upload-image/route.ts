import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 * Called from the dead-object registration form after the user selects a photo.
 * Folder param: 'dead' (default) | 'salvage'
 */
export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Image must be under 10 MB' }, { status: 400 })

  const folder = (formData.get('folder') as string | null) ?? 'dead'
  const contentType = (file.type === 'image/heic' || file.type === 'image/heif') ? 'image/jpeg' : file.type
  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const path = `${folder}/${randomUUID()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from('object-images')
    .upload(path, buffer, { contentType, upsert: false })

  if (error) {
    console.error('[Object Biography] Storage upload error:', error.message)
    return NextResponse.json({ error: 'Upload failed', detail: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from('object-images').getPublicUrl(path)
  return NextResponse.json({ url: publicUrl })
}
