// Procedural broken-object diagram in the exact style of the Hero kettle SVG:
// off-white strokes on transparent bg, red failure cross + crack, annotation line,
// dashed inspection rings, shading parallels, archival corner marks.
// Adapts object name, failed component and failure type from biography JSON.

interface Props {
  objectName: string
  failedComponent?: string | null
  failureType?: string | null
  /** compact = small card thumbnail size */
  compact?: boolean
}

export default function BrokenObjectDiagram({ objectName, failedComponent, failureType, compact }: Props) {
  // Truncate long strings so they fit inside the SVG
  const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + '…' : s

  const name     = truncate(objectName,        22)
  const failed   = truncate(failedComponent ?? 'unknown component', 22)
  const fType    = truncate(failureType    ?? '',                   26)

  // All coordinates are on a 388×280 viewBox — same proportions as the kettle
  return (
    <svg
      viewBox="0 0 388 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* ── Corner registration marks ──────────────────────────────────────── */}
      <line x1="8"   y1="14"  x2="8"   y2="8"   stroke="#444440" strokeWidth="1"/>
      <line x1="8"   y1="8"   x2="22"  y2="8"   stroke="#444440" strokeWidth="1"/>
      <line x1="366" y1="8"   x2="380" y2="8"   stroke="#444440" strokeWidth="1"/>
      <line x1="380" y1="8"   x2="380" y2="22"  stroke="#444440" strokeWidth="1"/>
      <line x1="8"   y1="266" x2="8"   y2="272" stroke="#444440" strokeWidth="1"/>
      <line x1="8"   y1="272" x2="22"  y2="272" stroke="#444440" strokeWidth="1"/>
      <line x1="366" y1="272" x2="380" y2="272" stroke="#444440" strokeWidth="1"/>
      <line x1="380" y1="258" x2="380" y2="272" stroke="#444440" strokeWidth="1"/>

      {/* ── Object name eyebrow ─────────────────────────────────────────────── */}
      <text
        x="194" y="26"
        textAnchor="middle"
        fontFamily="'Courier New', monospace"
        fontSize={compact ? '8' : '9'}
        letterSpacing="0.15em"
        fill="#6E6B64"
      >
        {name.toUpperCase()}
      </text>

      {/* ── Object body — generic rectangular schematic ─────────────────────── */}
      {/* Main outline */}
      <rect x="90" y="48" width="148" height="168" rx="2"
        stroke="#EDEAE1" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.88"/>

      {/* Shading verticals — depth */}
      <line x1="100" y1="52"  x2="100" y2="212" stroke="#EDEAE1" strokeWidth="1.1" opacity="0.18"/>
      <line x1="108" y1="50"  x2="108" y2="214" stroke="#EDEAE1" strokeWidth="1.0" opacity="0.12"/>
      <line x1="220" y1="50"  x2="220" y2="214" stroke="#EDEAE1" strokeWidth="1.0" opacity="0.12"/>

      {/* Interior horizontal dividers (panel lines) */}
      <line x1="92"  y1="90"  x2="236" y2="90"  stroke="#EDEAE1" strokeWidth="0.9" opacity="0.22"/>
      <line x1="92"  y1="168" x2="236" y2="168" stroke="#EDEAE1" strokeWidth="0.9" opacity="0.22"/>

      {/* Small detail — ventilation slots right side */}
      <line x1="224" y1="102" x2="234" y2="102" stroke="#EDEAE1" strokeWidth="1.0" opacity="0.28"/>
      <line x1="224" y1="110" x2="234" y2="110" stroke="#EDEAE1" strokeWidth="1.0" opacity="0.28"/>
      <line x1="224" y1="118" x2="234" y2="118" stroke="#EDEAE1" strokeWidth="1.0" opacity="0.28"/>

      {/* Base shadow */}
      <path d="M92 218 C92 224 110 227 164 227 C218 227 236 224 236 218"
        stroke="#EDEAE1" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.18"/>

      {/* ── Failure cross — same as kettle ──────────────────────────────────── */}
      <line x1="164" y1="117" x2="164" y2="143" stroke="#C41E1E" strokeWidth="2.2" strokeLinecap="round" opacity="0.92"/>
      <line x1="151" y1="130" x2="177" y2="130" stroke="#C41E1E" strokeWidth="2.2" strokeLinecap="round" opacity="0.92"/>

      {/* ── Crack path from failure point ───────────────────────────────────── */}
      <path d="M164 116 L158 134 L170 152 L155 174 L172 196"
        stroke="#C41E1E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.80"/>

      {/* ── Inspection rings around failure ─────────────────────────────────── */}
      <circle cx="164" cy="130" r="22" stroke="#C41E1E" strokeWidth="1.1"
        strokeDasharray="5 3" fill="none" opacity="0.65"/>
      <circle cx="164" cy="130" r="34" stroke="#C41E1E" strokeWidth="0.6"
        strokeDasharray="2 5" fill="none" opacity="0.30"/>

      {/* ── Annotation line → failure label ─────────────────────────────────── */}
      <line x1="178" y1="130" x2="222" y2="148" stroke="#EDEAE1" strokeWidth="0.8" strokeLinecap="round" opacity="0.70"/>
      <line x1="222" y1="148" x2="372" y2="148" stroke="#EDEAE1" strokeWidth="0.8" strokeLinecap="round" opacity="0.70"/>
      <text x="226" y="143"
        fontFamily="'Courier New', monospace"
        fontSize={compact ? '8' : '9'}
        fill="#C41E1E"
        letterSpacing="0.08em"
      >
        failure point
      </text>
      <text x="226" y="158"
        fontFamily="'Courier New', monospace"
        fontSize={compact ? '8' : '9'}
        fill="#EDEAE1"
        opacity="0.72"
        letterSpacing="0.05em"
      >
        {failed}
      </text>
      {fType && (
        <text x="226" y="170"
          fontFamily="'Courier New', monospace"
          fontSize="8"
          fill="#EDEAE1"
          opacity="0.40"
          letterSpacing="0.04em"
        >
          {fType}
        </text>
      )}

      {/* ── Second annotation — body label (left side) ──────────────────────── */}
      <line x1="90" y1="90" x2="20" y2="72" stroke="#EDEAE1" strokeWidth="0.7" strokeLinecap="round" opacity="0.35"/>
      <text x="20" y="68"
        fontFamily="'Courier New', monospace"
        fontSize="8"
        fill="#EDEAE1"
        opacity="0.35"
        letterSpacing="0.06em"
      >
        body
      </text>

    </svg>
  )
}
