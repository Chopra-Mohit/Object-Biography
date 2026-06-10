import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  let product_image_url: string

  try {
    const body = await req.json()
    product_image_url = String(body.product_image_url ?? '')
    if (!/^https?:\/\//.test(product_image_url)) throw new Error('invalid url')
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('registrations')
    .update({ product_image_url })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, product_image_url })
}
