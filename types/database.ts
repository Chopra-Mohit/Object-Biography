export type Tier = 'free' | 'personal' | 'research' | 'institutional'
export type InputMethod = 'barcode' | 'manual' | 'voice'
export type ConfidenceTier = 'verified' | 'inferred' | 'estimated'
export type CorrectionStatus = 'pending' | 'validated' | 'rejected'

export interface DBUser {
  id: string
  email: string
  tier: Tier
  registry_count: number
  created_at: string
  updated_at: string
}

export interface DBManufacturer {
  id: string
  name: string
  country_hq: string | null
  csr_report_url: string | null
  disclosure_score: number | null
  created_at: string
  updated_at: string
}

export interface DBProduct {
  id: string
  barcode: string | null
  name: string
  manufacturer_id: string | null
  model: string | null
  year_of_manufacture: number | null
  country_of_assembly: string | null
  repairability_score: number | null
  repairability_source: string | null
  is_user_submitted: boolean
  data_quality_tier: ConfidenceTier
  source_urls: string[] | null
  created_at: string
}

export interface DBFailureMode {
  id: string
  product_id: string
  component: string
  failure_type: string
  confidence_tier: ConfidenceTier
  source_url: string | null
  inferred_from: string | null
  validation_count: number
}

export interface DBMaterial {
  id: string
  product_id: string
  material_name: string
  weight_estimate_g: number | null
  source_country: string | null
  labour_score: number | null
  confidence_tier: ConfidenceTier
  source_url: string | null
}

export interface DBRegistration {
  id: string
  user_id: string
  product_id: string | null
  manual_brand: string | null
  manual_product_name: string | null
  manual_model: string | null
  manual_year_purchased: number | null
  date_of_death: string
  failure_description: string
  personal_memory: string | null
  biography_json: BiographyJSON | null
  biography_generated: boolean
  biography_version: number
  input_method: InputMethod
  created_at: string
  updated_at: string
}

export interface DBCertificate {
  id: string
  registration_id: string
  user_id: string
  pdf_url: string | null
  png_url: string | null
  json_url: string | null
  share_token: string
  is_public: boolean
  view_count: number
  revision_notes: unknown[] | null
  certificate_data: BiographyJSON
  created_at: string
}

export interface DBCorrection {
  id: string
  registration_id: string
  user_id: string
  field_name: string
  original_value: string | null
  corrected_value: string
  correction_note: string | null
  validation_count: number
  status: CorrectionStatus
  created_at: string
  updated_at: string
}

// ── Biography JSON (stored in registrations.biography_json) ──────────────────

export interface BiographyJSON {
  generated_at: string
  biography_version: number
  object_name: string
  manufacturer: string
  model?: string
  year_of_manufacture?: number

  life: {
    narrative: string
    supply_chain_summary: string
    materials_summary: string
    human_cost_line: string
    environmental_cost_line: string
    confidence_tier: ConfidenceTier
    sources: string[]
  }

  death: {
    narrative: string
    failed_component: string
    failure_type: string
    design_decision: string
    manufacturer_rationale: string
    repair_cost_estimate?: string
    replacement_cost?: string
    confidence_tier: ConfidenceTier
    sources: string[]
  }

  second_life: {
    narrative: string
    counterfactual_lifespan: string
    repair_cycles_possible: number
    material_recovery_rate: string
    carbon_delta: string
    confidence_tier: 'estimated'
    assumptions: string[]
  }

  personal_memory?: string

  certificate_summary: {
    cause_of_death: string
    design_decision_named: string
    material_cost_line: string
    human_cost_line: string
  }

  data_quality: {
    overall_tier: ConfidenceTier
    missing_data_reasons: string[]
    user_corrections_applied: number
  }
}

// ── Joined types (used in queries that select related tables) ────────────────

export interface RegistrationWithRelations extends DBRegistration {
  products: (DBProduct & {
    manufacturers: Pick<DBManufacturer, 'name' | 'country_hq'> | null
    failure_modes: Pick<DBFailureMode, 'component' | 'failure_type' | 'confidence_tier'>[]
    materials: Pick<DBMaterial, 'material_name' | 'weight_estimate_g' | 'source_country'>[]
  }) | null
  certificates: Pick<DBCertificate, 'share_token' | 'pdf_url' | 'png_url' | 'view_count'>[]
}
