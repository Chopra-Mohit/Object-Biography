// One-off generator: parses the downloaded MyMaps KML into lib/barcelona/zones.ts
const fs = require('fs')
const path = require('path')

const kmlPath = process.argv[2]
const kml = fs.readFileSync(kmlPath, 'utf8')
const placemarks = [...kml.matchAll(/<Placemark>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>[\s\S]*?<\/Placemark>/g)]
const dayMap = { Lunes: 1, Martes: 2, Miercoles: 3, Jueves: 4, Viernes: 5 }

const display = {
  'barceloneta': 'Barceloneta',
  'poble-nou': 'Poblenou',
  'raval-gotico': 'Raval – Gòtic',
  'poble-sec-montjuic': 'Poble-sec – Montjuïc',
  'gotico-eixample': 'Gòtic – Eixample',
  'dreta-y-borne': 'Dreta – Born',
  'sant-antoni': 'Sant Antoni',
  'eixample-esq': 'Eixample Esquerra',
  'dreta-sag-familia': 'Sagrada Família',
  'gracia': 'Gràcia',
  'sarria': 'Sarrià',
  'sants': 'Sants',
  'les-corts-sarria': 'Les Corts – Sarrià',
  'nou-barris': 'Nou Barris',
  'sant-marti': 'Sant Martí',
}

const zones = placemarks.map(m => {
  const rawName = m[1].trim()
  const parts = rawName.split(/\s+/)
  const weekday = dayMap[parts[parts.length - 1]]
  const baseName = parts.slice(0, -1).join(' ')
  const slug = baseName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const polygon = m[2].trim().split(/\s+/).map(c => {
    const [lng, lat] = c.split(',').map(Number)
    return [Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6]
  })
  return { slug, name: display[slug] || baseName, weekday, polygon }
})

const seen = {}
for (const z of zones) {
  if (seen[z.slug]) {
    z.slug = `${z.slug}-${z.weekday}`
    z.name += ' (nord)'
  }
  seen[z.slug] = true
}

const rows = zones.map(z =>
  `  { slug: ${JSON.stringify(z.slug)}, name: ${JSON.stringify(z.name)}, weekday: ${z.weekday}, polygon: [${z.polygon.map(p => `[${p[0]},${p[1]}]`).join(',')}] },`
).join('\n')

const file = `// Barcelona "Recollida de Mobles i Trastos" collection zones.
//
// Polygons sourced from the community map (caerengracia.info / Google MyMaps
// mid=1l2VAhplHwkWYhNi6WOcDeqnxPoE). The official per-street lookup is the
// Assistent de reciclatge on Cuidem Barcelona, tel. 010 or 900 226 226 —
// these zones are an approximation good enough for "which night is my area".
//
// weekday uses JS Date.getDay() numbering: 1 = Monday … 5 = Friday.
// Collection window: items go out 20:00–22:00 on the zone evening.

export interface BarcelonaZone {
  slug: string
  name: string
  weekday: number
  /** [lat, lng] outer ring, closed (first point repeated last) */
  polygon: [number, number][]
}

export const COLLECTION_START_HOUR = 20
export const COLLECTION_END_HOUR = 22

export const WEEKDAY_NAMES: Record<number, string> = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday',
}

export const WEEKDAY_NAMES_CA: Record<number, string> = {
  1: 'Dilluns', 2: 'Dimarts', 3: 'Dimecres', 4: 'Dijous', 5: 'Divendres',
}

/** One colour per collection weekday — used by map polygons and the legend. */
export const WEEKDAY_COLORS: Record<number, string> = {
  1: '#CC66CC', // Monday — violet
  2: '#5FB85F', // Tuesday — green
  3: '#C9A227', // Wednesday — ochre
  4: '#E08A3C', // Thursday — orange
  5: '#5C8FD6', // Friday — blue
}

export const BARCELONA_CENTER: [number, number] = [41.3927, 2.1642]

export const BARCELONA_ZONES: BarcelonaZone[] = [
${rows}
]

/** Current date parts in Barcelona local time, wherever the server/client runs. */
export function barcelonaNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    weekday: 'short', hour: 'numeric', hour12: false,
  }).formatToParts(new Date())
  const dayShort = parts.find(p => p.type === 'weekday')?.value ?? 'Sun'
  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0)
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dayShort)
  return { weekday, hour }
}

export function zonesForWeekday(weekday: number): BarcelonaZone[] {
  return BARCELONA_ZONES.filter(z => z.weekday === weekday)
}

/** Ray-casting point-in-polygon — enough precision for zone tagging. */
export function zoneForPoint(lat: number, lng: number): BarcelonaZone | null {
  for (const zone of BARCELONA_ZONES) {
    let inside = false
    const ring = zone.polygon
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [yi, xi] = ring[i]
      const [yj, xj] = ring[j]
      if (((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    if (inside) return zone
  }
  return null
}
`

fs.mkdirSync(path.join(__dirname, '..', 'lib', 'barcelona'), { recursive: true })
fs.writeFileSync(path.join(__dirname, '..', 'lib', 'barcelona', 'zones.ts'), file)
console.log('zones:', zones.map(z => `${z.slug} w${z.weekday}`).join(', '))
