import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { BiographyJSON } from '@/types/database'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://objectbiography.com'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, { params }: Props) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('registrations')
    .select('manual_brand, manual_product_name, biography_generated, biography_json, certificates(share_token)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!data.biography_generated || !data.biography_json) {
    return NextResponse.json({ error: 'Biography not yet generated' }, { status: 400 })
  }

  const bio         = data.biography_json as BiographyJSON
  const objectName  = [data.manual_brand, data.manual_product_name].filter(Boolean).join(' ') || 'Object'
  const certs       = data.certificates as { share_token: string }[] | null
  const certToken   = certs?.[0]?.share_token ?? null

  const html = buildEmailHtml({ bio, objectName, certToken, recipientEmail: user.email })

  const { error: sendError } = await resend.emails.send({
    // Update 'from' to your verified Resend domain before deploying to production.
    // During development, Resend allows sending to your own account email only.
    from: 'Object Biography <onboarding@resend.dev>',
    to: [user.email],
    subject: `Your Object Biography — ${objectName}`,
    html,
  })

  if (sendError) {
    console.error('[Object Biography] Email send error:', sendError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ success: true, sentTo: user.email })
}

// ── Email HTML builder ────────────────────────────────────────────────────────

function buildEmailHtml({
  bio, objectName, certToken, recipientEmail,
}: {
  bio: BiographyJSON
  objectName: string
  certToken: string | null
  recipientEmail: string
}) {
  const certUrl = certToken ? `${APP_URL}/certificate/${certToken}` : null

  // Colour palette — matches the app's paper / certificate aesthetic
  const BG      = '#F8F5EB'
  const FG      = '#1B1B17'
  const DIM     = '#9B8A6A'
  const RULE    = '#CCBDA0'
  const RED     = '#C41E1E'
  const MONO    = "'Courier New', Courier, monospace"

  const section = (num: string, title: string, content: string) => `
    <tr><td style="padding:0 0 6px 0;">
      <p style="margin:0 0 10px 0;font-family:${MONO};font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${DIM};">
        ${num} — ${title}
      </p>
      ${content}
    </td></tr>
    <tr><td style="padding:0 0 28px 0;border-bottom:0.5px solid ${RULE};">&nbsp;</td></tr>
    <tr><td style="padding:12px 0 0 0;">&nbsp;</td></tr>
  `

  const field = (label: string, value: string) => `
    <p style="margin:0 0 2px 0;font-family:${MONO};font-size:8px;letter-spacing:2px;text-transform:uppercase;color:${DIM};">${label}</p>
    <p style="margin:0 0 14px 0;font-family:${MONO};font-size:10px;color:${FG};line-height:1.5;">${value}</p>
  `

  const narrative = (text: string) =>
    `<p style="margin:0 0 16px 0;font-family:${MONO};font-size:10px;color:${FG};line-height:1.8;">${text}</p>`

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#2A2A26;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#2A2A26;padding:40px 20px;">
  <tr><td align="center">
  <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:${BG};">

    <!-- Header -->
    <tr><td style="padding:40px 48px 28px 48px;border-bottom:0.5px solid ${RULE};">
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${APP_URL}" style="font-family:${MONO};font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${DIM};text-decoration:none;">
            Object Biography
          </a>
        </td>
        <td align="right">
          <a href="${APP_URL}" style="font-family:${MONO};font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${RULE};text-decoration:none;">
            objectbiography.com
          </a>
        </td>
      </tr>
      </table>
      <p style="margin:20px 0 4px 0;font-family:${MONO};font-size:24px;color:${FG};line-height:1.2;">${objectName}</p>
      ${bio.model ? `<p style="margin:0;font-family:${MONO};font-size:10px;color:${DIM};">${bio.model}${bio.year_of_manufacture ? ' · ' + bio.year_of_manufacture : ''}</p>` : ''}
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:28px 48px 0 48px;">
    <table width="100%" cellpadding="0" cellspacing="0">

      ${section('01', 'Life', `
        ${narrative(bio.life.narrative)}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr>
          <td width="50%" style="vertical-align:top;padding-right:16px;">
            ${field('Human cost', bio.life.human_cost_line)}
          </td>
          <td width="50%" style="vertical-align:top;">
            ${field('Environmental cost', bio.life.environmental_cost_line)}
          </td>
        </tr>
        </table>
        ${field('Supply chain', bio.life.supply_chain_summary)}
      `)}

      ${section('02', 'Death', `
        ${narrative(bio.death.narrative)}
        <div style="border-left:2px solid ${RED};padding-left:10px;margin-bottom:16px;">
          <p style="margin:0 0 2px 0;font-family:${MONO};font-size:8px;letter-spacing:2px;text-transform:uppercase;color:${RED};">Failed component</p>
          <p style="margin:0;font-family:${MONO};font-size:10px;color:${FG};">${bio.death.failed_component}</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr>
          <td width="50%" style="vertical-align:top;padding-right:16px;">
            ${field('Failure type', bio.death.failure_type)}
          </td>
          <td width="50%" style="vertical-align:top;">
            ${field('Design decision', bio.death.design_decision)}
          </td>
        </tr>
        </table>
        ${field('Manufacturer rationale', bio.death.manufacturer_rationale)}
        ${bio.death.repair_cost_estimate || bio.death.replacement_cost ? `
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${bio.death.repair_cost_estimate ? `<td width="50%" style="vertical-align:top;padding-right:16px;">${field('Repair cost', bio.death.repair_cost_estimate)}</td>` : ''}
          ${bio.death.replacement_cost     ? `<td width="50%" style="vertical-align:top;">${field('Replacement cost', bio.death.replacement_cost)}</td>`                : ''}
        </tr>
        </table>` : ''}
      `)}

      ${section('03', 'Second Life', `
        ${narrative(bio.second_life.narrative)}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr>
          <td width="50%" style="vertical-align:top;padding:8px;border:0.5px solid ${RULE};padding-right:10px;">
            ${field('Counterfactual lifespan', bio.second_life.counterfactual_lifespan)}
          </td>
          <td width="4px"></td>
          <td width="50%" style="vertical-align:top;padding:8px;border:0.5px solid ${RULE};">
            ${field('Repair cycles possible', String(bio.second_life.repair_cycles_possible))}
          </td>
        </tr>
        <tr><td colspan="3" height="4"></td></tr>
        <tr>
          <td width="50%" style="vertical-align:top;padding:8px;border:0.5px solid ${RULE};padding-right:10px;">
            ${field('Material recovery', bio.second_life.material_recovery_rate)}
          </td>
          <td width="4px"></td>
          <td width="50%" style="vertical-align:top;padding:8px;border:0.5px solid ${RULE};">
            ${field('Carbon avoided', bio.second_life.carbon_delta)}
          </td>
        </tr>
        </table>
      `)}

      <!-- Cause of death summary -->
      <tr><td style="padding:0 0 28px 0;">
        <p style="margin:0 0 10px 0;font-family:${MONO};font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${DIM};">Cause of death</p>
        <p style="margin:0 0 10px 0;font-family:${MONO};font-size:10px;color:${FG};line-height:1.75;">${bio.certificate_summary.cause_of_death}</p>
        <p style="margin:0 0 5px 0;font-family:${MONO};font-size:10px;color:${FG};line-height:1.5;">${bio.certificate_summary.design_decision_named}</p>
        <p style="margin:0 0 3px 0;font-family:${MONO};font-size:10px;color:${DIM};">${bio.certificate_summary.material_cost_line}</p>
        <p style="margin:0;font-family:${MONO};font-size:10px;color:${DIM};">${bio.certificate_summary.human_cost_line}</p>
      </td></tr>

      <!-- CTA -->
      ${certUrl ? `
      <tr><td style="padding:0 0 36px 0;">
        <a href="${certUrl}" style="display:inline-block;font-family:${MONO};font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${FG};text-decoration:none;border:1px solid ${FG};padding:10px 20px;">
          View Death Certificate →
        </a>
      </td></tr>` : `
      <tr><td style="padding:0 0 36px 0;">
        <a href="${APP_URL}/registry" style="display:inline-block;font-family:${MONO};font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${FG};text-decoration:none;border:1px solid ${FG};padding:10px 20px;">
          View in registry →
        </a>
      </td></tr>`}

    </table>
    </td></tr>

    <!-- Footer — subtle but always visible -->
    <tr><td style="padding:20px 48px 32px 48px;border-top:0.5px solid ${RULE};">
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <p style="margin:0 0 4px 0;font-family:${MONO};font-size:8px;letter-spacing:2px;text-transform:uppercase;color:${DIM};">
            Generated by
            <a href="${APP_URL}" style="color:${DIM};text-decoration:underline;">Object Biography</a>
          </p>
          <p style="margin:0;font-family:${MONO};font-size:8px;color:${RULE};">
            <a href="${APP_URL}" style="color:${RULE};text-decoration:none;">${APP_URL.replace(/^https?:\/\//, '')}</a>
            &nbsp;·&nbsp; Sent to ${recipientEmail}
          </p>
        </td>
      </tr>
      </table>
    </td></tr>

  </table>
  </td></tr>
  </table>

</body>
</html>`
}
