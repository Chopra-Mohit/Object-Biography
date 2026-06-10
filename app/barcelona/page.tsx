import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import InnerNav from '@/components/InnerNav'
import MoteAssistant from '@/components/MoteAssistant'
import BarcelonaZoneMap, { type BcnMapObject } from '@/components/barcelona/BarcelonaZoneMap'
import SubscribeBox from '@/components/barcelona/SubscribeBox'
import BarcelonaFeed from '@/components/barcelona/BarcelonaFeed'
import {
  barcelonaNow, zonesForWeekday, zoneForPoint,
  WEEKDAY_NAMES, WEEKDAY_COLORS, COLLECTION_START_HOUR, COLLECTION_END_HOUR,
  BARCELONA_ZONES,
} from '@/lib/barcelona/zones'

export const metadata = {
  title: 'Barcelona — Recollida de Mobles i Trastos — Object Biography',
  description:
    'Every night a different part of Barcelona puts its furniture on the street. Zone map, collection-night alerts, and live street reports.',
}

export const dynamic = 'force-dynamic'

const mono: React.CSSProperties = { fontFamily: 'var(--ob-font-mono)' }

export default async function BarcelonaPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userEmail = user?.email ?? null

  // Found objects pinned inside one of the city zones
  const { data } = await supabaseAdmin
    .from('registrations')
    .select('id, manual_product_name, biography_json, location_lat, location_lng, picked_up')
    .eq('input_method', 'salvage')
    .not('location_lat', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const objects: BcnMapObject[] = (data ?? [])
    .filter(r => zoneForPoint(r.location_lat as number, r.location_lng as number) !== null)
    .map(r => {
      const bio = r.biography_json as { object_identified?: string; verdict?: string } | null
      return {
        id: r.id,
        name: r.manual_product_name || bio?.object_identified || 'Found object',
        lat: r.location_lat as number,
        lng: r.location_lng as number,
        verdict: bio?.verdict ?? null,
        picked_up: Boolean(r.picked_up),
      }
    })

  const { weekday, hour } = barcelonaNow()
  const tonightZones = zonesForWeekday(weekday)
  const isLive = tonightZones.length > 0 && hour >= COLLECTION_START_HOUR && hour < COLLECTION_END_HOUR

  return (
    <>
      <InnerNav userEmail={userEmail} />
      <main style={{
        minHeight: '100vh',
        background: 'var(--ob-bg)',
        paddingTop: 'calc(52px + var(--ob-space-12))',
        paddingBottom: 'var(--ob-space-20)',
      }}>
        <div className="ob-container">

          <hr style={{ border: 'none', borderTop: '3px double var(--ob-rule)', marginBottom: 'var(--ob-space-10)' }} />

          {/* Header */}
          <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>
            Barcelona · Recollida de Mobles i Trastos
          </span>
          <h1 style={{
            ...mono, fontSize: 'var(--ob-fs-display)', fontWeight: 'var(--ob-fw-regular)',
            color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-snug)', margin: '0 0 var(--ob-space-5) 0',
          }}>
            Every night, a different part of the city puts its furniture on the street.
          </h1>
          <p style={{
            ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)',
            lineHeight: 'var(--ob-lh-relaxed)', maxWidth: 640, marginBottom: 'var(--ob-space-8)',
          }}>
            Barcelona's free bulky-waste collection works zone by zone: on your street's
            designated evening, sofas, chairs, doors, shelves and lamps go out in front
            of building entrances between 20:00 and 22:00, and the truck passes overnight.
            Which means every weekday evening, somewhere in the city, the streets briefly
            become an open-air free shop. This page tells you where and when — and what
            people are finding.
          </p>

          {/* Tonight banner */}
          <div style={{
            border: '1px solid var(--ob-rule)',
            borderLeft: `3px solid ${tonightZones.length > 0 ? '#4CAF50' : 'var(--ob-rule)'}`,
            padding: 'var(--ob-space-4) var(--ob-space-5)',
            marginBottom: 'var(--ob-space-8)',
            display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', flexWrap: 'wrap',
          }}>
            {tonightZones.length > 0 ? (
              <>
                <span className="ob-eyebrow" style={{ color: '#4CAF50', flexShrink: 0 }}>
                  {isLive ? '● Live now' : `Tonight · ${WEEKDAY_NAMES[weekday]}`}
                </span>
                <span style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg)', lineHeight: 'var(--ob-lh-relaxed)' }}>
                  Collection in <strong style={{ fontWeight: 400, borderBottom: '1px solid var(--ob-fg-dim)' }}>
                    {tonightZones.map(z => z.name).join(', ')}
                  </strong>
                  {' — '}items out 20:00–22:00.
                  {isLive ? ' The streets are filling up right now.' : ''}
                </span>
              </>
            ) : (
              <>
                <span className="ob-eyebrow" style={{ flexShrink: 0 }}>Weekend</span>
                <span style={{ ...mono, fontSize: 'var(--ob-fs-small)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)' }}>
                  No street collection tonight. It starts again Monday in{' '}
                  {zonesForWeekday(1).map(z => z.name).join(', ')}.
                </span>
              </>
            )}
          </div>

          {/* Split: map + sidebar */}
          <div className="ob-bcn-split" style={{ marginBottom: 'var(--ob-space-10)' }}>
            <div style={{ border: '1px solid var(--ob-rule)', minHeight: 420, height: 560 }}>
              <BarcelonaZoneMap tonightWeekday={weekday} objects={objects} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-5)' }}>
              {/* Weekday legend / schedule */}
              <div style={{ border: '1px solid var(--ob-rule)' }}>
                <div style={{ padding: 'var(--ob-space-4) var(--ob-space-5)', borderBottom: '1px solid var(--ob-rule)' }}>
                  <span className="ob-eyebrow">The week's rotation</span>
                </div>
                <div style={{ padding: 'var(--ob-space-3) var(--ob-space-5) var(--ob-space-4)' }}>
                  {[1, 2, 3, 4, 5].map(day => (
                    <div key={day} style={{
                      display: 'flex', gap: 'var(--ob-space-3)', alignItems: 'baseline',
                      padding: '6px 0',
                      borderBottom: day < 5 ? '1px solid var(--ob-rule)' : 'none',
                    }}>
                      <span style={{
                        width: 9, height: 9, flexShrink: 0, alignSelf: 'center',
                        background: WEEKDAY_COLORS[day],
                        opacity: day === weekday ? 1 : 0.55,
                      }} />
                      <span style={{
                        ...mono, fontSize: 'var(--ob-fs-meta)',
                        letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                        color: day === weekday ? 'var(--ob-fg)' : 'var(--ob-fg-dim)',
                        width: 84, flexShrink: 0,
                      }}>
                        {WEEKDAY_NAMES[day]}
                      </span>
                      <span style={{ ...mono, fontSize: 'var(--ob-fs-caption)', color: 'var(--ob-fg-faint)', lineHeight: 1.6 }}>
                        {BARCELONA_ZONES.filter(z => z.weekday === day).map(z => z.name).join(' · ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts signup */}
              <SubscribeBox userEmail={userEmail} />
            </div>
          </div>

          {/* Feed + how it works */}
          <div className="ob-bcn-split" style={{ marginBottom: 'var(--ob-space-12)' }}>
            <BarcelonaFeed userEmail={userEmail} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-5)' }}>
              <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-5)' }}>
                <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>
                  What goes out
                </span>
                <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', margin: '0 0 var(--ob-space-4)' }}>
                  Sofas, doors, furniture, chairs, wooden boxes and slats, blinds,
                  broken toys — anything bulky and domestic.
                </p>
                <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)', color: 'var(--ob-red)' }}>
                  What doesn't
                </span>
                <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', margin: 0 }}>
                  Construction rubble and sanitaryware. Fridges, freezers and air
                  conditioners with CFC gases must go to a Punt Verd instead —
                  if you spot one on the street, it shouldn't be there.
                </p>
              </div>

              <div style={{ border: '1px solid var(--ob-rule)', padding: 'var(--ob-space-5)' }}>
                <span className="ob-eyebrow" style={{ display: 'block', marginBottom: 'var(--ob-space-4)' }}>
                  Found something tonight?
                </span>
                <p style={{ ...mono, fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)', lineHeight: 'var(--ob-lh-relaxed)', margin: '0 0 var(--ob-space-5)' }}>
                  Photograph it, get an instant salvage verdict, and pin it on this
                  map so the neighbourhood knows it's there. When someone takes it
                  home, they mark it claimed.
                </p>
                <a href="/salvage" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block', fontSize: 'var(--ob-fs-meta)' }}>
                  Assess a found object →
                </a>
              </div>

              <p style={{ ...mono, fontSize: 'var(--ob-fs-caption)', color: 'var(--ob-fg-faint)', lineHeight: 'var(--ob-lh-relaxed)', margin: 0 }}>
                Zone boundaries are a community approximation. The official
                per-street day lives in the Assistent de reciclatge on Cuidem
                Barcelona, or call 010 / 900 226 226 (free). Residents of
                Vallvidrera, el Rectoret, Mas Guimbau, Mas Sauró, Font del Mont
                and Tibidabo must request collection by phone. For large volumes
                there's a paid home pickup service (free for people with
                certified disabilities or reduced mobility).
              </p>
            </div>
          </div>

        </div>

        <MoteAssistant context="home" />
      </main>
    </>
  )
}
