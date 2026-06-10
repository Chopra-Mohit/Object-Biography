import {
  barcelonaNow, zonesForWeekday, WEEKDAY_NAMES, WEEKDAY_COLORS, BARCELONA_ZONES,
} from '@/lib/barcelona/zones'

/**
 * Homepage spotlight for the Barcelona collection-nights feature.
 * Server component — "tonight" is computed per request in Madrid time.
 */
export default function BarcelonaHighlight() {
  const { weekday } = barcelonaNow()
  const tonightZones = zonesForWeekday(weekday)

  return (
    <section id="barcelona" className="ob-section-padded" style={{ padding: '6rem 0', borderBottom: '1px solid var(--ob-rule)' }}>
      <div className="ob-container">

        <span className="ob-eyebrow" style={{ marginBottom: '2.5rem', display: 'block' }}>
          05 — Barcelona
        </span>

        <h2 style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
          fontWeight: 400,
          color: 'var(--ob-fg)',
          lineHeight: 1.25,
          maxWidth: 720,
          margin: '0 0 1.6rem',
        }}>
          Every weekday night, one part of the city becomes an open-air free shop.
        </h2>

        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: '12.5px',
          color: 'var(--ob-fg-dim)',
          lineHeight: 1.75,
          maxWidth: 640,
          marginBottom: '2.5rem',
        }}>
          Barcelona&apos;s &ldquo;Recollida de Mobles i Trastos&rdquo; rotates zone by
          zone: sofas, chairs, doors and shelves go out on the street between 20:00
          and 22:00, and the truck passes overnight. The two hours in between are the
          window. We map the zones, email you on your zone&apos;s morning, and run a
          live feed of what the neighbourhood is finding — so a discarded object
          finds a new home before it becomes waste.
        </p>

        {/* Week strip */}
        <div style={{ border: '1px solid var(--ob-rule)', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4, 5].map(day => {
            const isToday = day === weekday
            return (
              <div key={day} style={{
                display: 'flex', gap: '1rem', alignItems: 'baseline', flexWrap: 'wrap',
                padding: '0.7rem 1.4rem',
                borderBottom: day < 5 ? '1px solid var(--ob-rule)' : 'none',
                background: isToday ? 'var(--ob-surface-raised, rgba(255,255,255,0.03))' : 'transparent',
              }}>
                <span style={{
                  width: 8, height: 8, flexShrink: 0, alignSelf: 'center',
                  background: WEEKDAY_COLORS[day], opacity: isToday ? 1 : 0.5,
                }} />
                <span style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)',
                  letterSpacing: 'var(--ob-ls-eyebrow)', textTransform: 'uppercase',
                  color: isToday ? 'var(--ob-fg)' : 'var(--ob-fg-dim)',
                  width: 90, flexShrink: 0,
                }}>
                  {WEEKDAY_NAMES[day]}{isToday ? ' ●' : ''}
                </span>
                <span style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: '11px',
                  color: isToday ? 'var(--ob-fg-dim)' : 'var(--ob-fg-faint)', lineHeight: 1.6,
                }}>
                  {BARCELONA_ZONES.filter(z => z.weekday === day).map(z => z.name).join(' · ')}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/barcelona" className="ob-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
            {tonightZones.length > 0
              ? `Tonight: ${tonightZones.map(z => z.name).join(', ')} →`
              : 'Open the Barcelona map →'}
          </a>
          <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: '11px', color: 'var(--ob-fg-faint)' }}>
            Zone alerts by email · live street reports · claimed-object tracking
          </span>
        </div>

      </div>
    </section>
  )
}
