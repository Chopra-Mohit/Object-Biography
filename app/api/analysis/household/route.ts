import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { groq } from '@/lib/anthropic/client'
import type { BiographyJSON } from '@/types/database'

export interface HouseholdAnalysis {
  headline: string
  patterns: {
    title: string
    evidence: string
    severity: 'high' | 'medium' | 'low'
  }[]
  component_watchlist: {
    component_class: string
    reason: string
  }[]
  brand_notes: string[]
  recommendations: string[]
}

const SYSTEM = `You are Mote — the forensic engine inside Object Biography. You have just been handed the full death record of one household: every object they registered, what failed, and why.

Your job is cross-case analysis. Single objects get a biography; a household gets a diagnosis. Look for:
- Repeated failure modes across different objects (the same component class dying twice is a pattern, not a coincidence)
- Brand-level patterns (same manufacturer, same design philosophy, same outcome)
- Component classes that keep appearing (batteries, hinges, capacitors, seams, particleboard joints)
- Usage-environment signals (humidity damage across objects suggests the home; charge-cycle deaths suggest habits — name these gently, the household is not the defendant, the design decisions are)
- What in this household is statistically next to fail, given what has already died

VOICE: plain declarative sentences, second person, no enthusiasm, no hedging beyond stated confidence. Dry, precise, on the household's side.

Return ONLY raw JSON matching:
{
  "headline": "one sentence — the single most important thing this household's record shows",
  "patterns": [
    { "title": "short pattern name", "evidence": "2-3 sentences citing the specific objects and failures", "severity": "high | medium | low" }
  ],
  "component_watchlist": [
    { "component_class": "e.g. lithium-polymer pouch cells", "reason": "why this class is the household's weak point, citing their record" }
  ],
  "brand_notes": ["one observation per brand with 2+ objects, or empty array"],
  "recommendations": ["3-5 concrete, practical actions — what to check, what to buy differently, what to repair pre-emptively"]
}
1-4 patterns. 1-3 watchlist entries. Be specific to THIS record — generic advice is a failure.`

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to run household analysis.' }, { status: 401 })

  const { data: registrations, error } = await supabase
    .from('registrations')
    .select('manual_brand, manual_product_name, manual_year_purchased, date_of_death, failure_description, biography_json, input_method')
    .eq('user_id', user.id)
    .order('date_of_death', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const dead = (registrations ?? []).filter(r => r.input_method !== 'salvage')
  if (dead.length < 2) {
    return NextResponse.json(
      { error: 'Register at least two dead objects to compare across your household.' },
      { status: 400 },
    )
  }

  // Compact one-paragraph dossier per object — keeps the prompt small
  const dossier = dead.map((r, i) => {
    const bio = r.biography_json as BiographyJSON | null
    const lines = [
      `OBJECT ${i + 1}: ${[r.manual_brand, r.manual_product_name].filter(Boolean).join(' ')}`,
      r.manual_year_purchased ? `Purchased: ${r.manual_year_purchased}` : null,
      `Died: ${r.date_of_death}`,
      bio?.death?.failed_component ? `Failed component: ${bio.death.failed_component}` : null,
      bio?.death?.failure_type ? `Failure mode: ${bio.death.failure_type}` : null,
      bio?.death?.design_decision ? `Design decision: ${bio.death.design_decision}` : null,
      bio?.life?.materials_summary ? `Materials: ${bio.life.materials_summary}` : null,
      !bio && r.failure_description ? `Owner's description: ${r.failure_description}` : null,
    ].filter(Boolean)
    return lines.join('\n')
  }).join('\n\n')

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `HOUSEHOLD DEATH RECORD (${dead.length} objects):\n\n${dossier}\n\nReturn the household analysis as raw JSON.` },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw) as HouseholdAnalysis
    if (!parsed.headline || !Array.isArray(parsed.patterns)) {
      return NextResponse.json({ error: 'Analysis produced invalid output. Try again.' }, { status: 500 })
    }

    return NextResponse.json({ analysis: parsed, object_count: dead.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
