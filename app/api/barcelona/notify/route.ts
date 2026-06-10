import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { barcelonaNow, zonesForWeekday, WEEKDAY_NAMES } from '@/lib/barcelona/zones'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://objectbiography.com'

const MONO = "'Courier New', Courier, monospace"

/**
 * Day-of collection alert. Invoked by Vercel Cron (see vercel.json) every
 * weekday around midday Barcelona time. Emails every subscriber whose zone
 * collects tonight: items go out 20:00–22:00, truck passes overnight.
 *
 * When CRON_SECRET is set in Vercel env, Vercel sends it as a Bearer token
 * and we reject anything else.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { weekday } = barcelonaNow()
  const tonightZones = zonesForWeekday(weekday)
  if (tonightZones.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: 'No collection tonight (weekend).' })
  }

  const slugs = tonightZones.map(z => z.slug)
  const { data: subs, error } = await supabaseAdmin
    .from('barcelona_subscriptions')
    .select('email, zone_slug')
    .in('zone_slug', slugs)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subs || subs.length === 0) return NextResponse.json({ ok: true, sent: 0 })

  // Group zones per subscriber so each person gets one email
  const byEmail = new Map<string, string[]>()
  for (const s of subs) {
    const zone = tonightZones.find(z => z.slug === s.zone_slug)
    if (!zone) continue
    const list = byEmail.get(s.email) ?? []
    list.push(zone.name)
    byEmail.set(s.email, list)
  }

  let sent = 0
  const failures: string[] = []

  for (const [email, zoneNames] of byEmail) {
    const { error: sendError } = await resend.emails.send({
      // Update 'from' to your verified Resend domain before production.
      from: 'Object Biography <onboarding@resend.dev>',
      to: [email],
      subject: `Tonight in ${zoneNames.join(' & ')} — furniture goes out on the street`,
      html: buildAlertHtml(zoneNames, WEEKDAY_NAMES[weekday] ?? ''),
    })
    if (sendError) failures.push(email)
    else sent++
  }

  return NextResponse.json({ ok: true, sent, failed: failures.length })
}

function buildAlertHtml(zoneNames: string[], dayName: string) {
  const zones = zoneNames.join(' and ')
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#2A2A26;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#2A2A26;padding:40px 20px;">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#F8F5EB;">
    <tr><td style="padding:36px 44px 24px 44px;border-bottom:0.5px solid #CCBDA0;">
      <p style="margin:0;font-family:${MONO};font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#9B8A6A;">
        Object Biography · Barcelona
      </p>
      <p style="margin:18px 0 0 0;font-family:${MONO};font-size:20px;color:#1B1B17;line-height:1.35;">
        Tonight is collection night in ${zones}.
      </p>
    </td></tr>
    <tr><td style="padding:24px 44px 8px 44px;">
      <p style="margin:0 0 14px 0;font-family:${MONO};font-size:11px;color:#1B1B17;line-height:1.8;">
        It's ${dayName} — "Recollida de Mobles i Trastos" runs in your zone tonight.
        Furniture and bulky items go out on the street between
        <strong>20:00 and 22:00</strong>, in front of building entrances.
        The truck passes overnight.
      </p>
      <p style="margin:0 0 14px 0;font-family:${MONO};font-size:11px;color:#1B1B17;line-height:1.8;">
        Discarding something? Put it out in the window. Hunting? The two hours
        before the truck are when the streets are full — sofas, chairs, doors,
        shelves, lamps. If you find something worth saving, assess it and pin
        it on the map so others know.
      </p>
      <p style="margin:0 0 24px 0;">
        <a href="${APP_URL}/barcelona" style="display:inline-block;font-family:${MONO};font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#1B1B17;text-decoration:none;border:1px solid #1B1B17;padding:10px 18px;">
          Open the Barcelona map →
        </a>
      </p>
    </td></tr>
    <tr><td style="padding:18px 44px 30px 44px;border-top:0.5px solid #CCBDA0;">
      <p style="margin:0;font-family:${MONO};font-size:8px;letter-spacing:1px;color:#9B8A6A;line-height:1.7;">
        Zone days are approximate — confirm your street at the Assistent de
        reciclatge (Cuidem Barcelona) or call 900 226 226.
        You receive this because you subscribed to zone alerts on
        <a href="${APP_URL}" style="color:#9B8A6A;">Object Biography</a>.
      </p>
    </td></tr>
  </table>
  </td></tr>
  </table>
</body>
</html>`
}
