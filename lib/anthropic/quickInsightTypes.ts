// Client-safe types and constants — no server imports

// Bounding box as percentage of image dimensions (0–100)
export interface BBox {
  x: number  // left edge %
  y: number  // top edge %
  w: number  // width %
  h: number  // height %
}

export interface SalvageableComponent {
  component: string
  bbox: BBox | null
  condition: string
  why_salvageable: string
  potential_uses: string[]
  source_tracing: string | null
  estimated_value: string | null
}

export interface NonSalvageableComponent {
  component: string
  bbox: BBox | null
  reason: string
  disposal_method: string
}

export interface QuickInsightResult {
  object_identified: string
  manufacturer: string | null
  model: string | null
  estimated_manufacture_year: string | null
  country_of_origin: string | null
  condition: 'good' | 'fair' | 'poor' | 'parts-only'
  verdict: 'worth-picking-up' | 'parts-only' | 'recycle-only' | 'leave-it'
  verdict_reason: string
  object_history: {
    likely_age: string | null
    manufacture_context: string | null
    typical_lifespan: string | null
    supply_chain_note: string | null
  }
  salvageable_components: SalvageableComponent[]
  non_salvageable_components: NonSalvageableComponent[]
  materials: {
    material: string
    estimated_quantity: string
    origin_country: string | null
    recyclability: 'high' | 'medium' | 'low'
    recycling_method: string
    recycling_facility_type: string
  }[]
  reuse_scenarios: {
    scenario: string
    effort: 'minimal' | 'moderate' | 'significant'
    required_skills: string
    estimated_time: string
  }[]
  repair_difficulty: 'easy' | 'moderate' | 'expert'
  estimated_repair_cost: string | null
  confidence: 'high' | 'medium' | 'low'
  notes: string | null
}
