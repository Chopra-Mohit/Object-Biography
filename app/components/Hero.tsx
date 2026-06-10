'use client'

import { useState } from 'react'

type HoverState = 'idle' | 'breaking' | 'salvage'

export default function Hero() {
  const [hover, setHover] = useState<HoverState>('idle')

  return (
    <section
      id="hero"
      className="ob-section-hero"
      style={{ padding: '3.5rem 0 5rem', borderBottom: '1px solid var(--ob-rule)' }}
    >
      <div className="ob-container">

        {/* Centred header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="ob-eyebrow" style={{ marginBottom: '1.5rem', display: 'block' }}>
            Object Biography
          </span>
          <h1 className="ob-hero" style={{ marginBottom: '1.5rem' }}>
            Every object has a story.
          </h1>
          <p className="ob-tagline">
            Most are designed to end badly. We tell it anyway.
          </p>
        </div>

        {/* Three-column on desktop, stacked on mobile — layout controlled by CSS class */}
        <div className="ob-hero-grid">

          {/* Left — broken object */}
          <div
            style={{ textAlign: 'right', cursor: 'default' }}
            onMouseEnter={() => setHover('breaking')}
            onMouseLeave={() => setHover('idle')}
          >
            <span style={{
              display: 'block',
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)',
              textTransform: 'uppercase',
              color: hover === 'breaking' ? 'var(--ob-fg)' : 'var(--ob-fg-dim)',
              marginBottom: 'var(--ob-space-3)',
              transition: 'color 0.2s ease',
            }}>
              Something just broke
            </span>
            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg-dim)',
              lineHeight: 'var(--ob-lh-loose)',
              marginBottom: 'var(--ob-space-5)',
            }}>
              Register it. Mote writes its full material biography —
              supply chain, cause of death, and the life it was designed
              never to have. Ends with a shareable death certificate.
            </p>
            <a
              href="/register"
              className="ob-button"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Register an object →
            </a>
          </div>

          {/* Centre — interactive kettle */}
          <KettleIllustration hover={hover} />

          {/* Right — found object */}
          <div
            style={{ textAlign: 'left', cursor: 'default' }}
            onMouseEnter={() => setHover('salvage')}
            onMouseLeave={() => setHover('idle')}
          >
            <span style={{
              display: 'block',
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-meta)',
              letterSpacing: 'var(--ob-ls-eyebrow)',
              textTransform: 'uppercase',
              color: hover === 'salvage' ? 'var(--ob-fg)' : 'var(--ob-fg-dim)',
              marginBottom: 'var(--ob-space-3)',
              transition: 'color 0.2s ease',
            }}>
              You found something abandoned
            </span>
            <p style={{
              fontFamily: 'var(--ob-font-mono)',
              fontSize: 'var(--ob-fs-small)',
              color: 'var(--ob-fg-dim)',
              lineHeight: 'var(--ob-lh-loose)',
              marginBottom: 'var(--ob-space-5)',
            }}>
              Photograph it. Mote identifies what it is, what components
              can be salvaged, and whether it&apos;s worth picking up —
              in seconds. No account needed.
            </p>
            <a
              href="/salvage"
              className="ob-button--ghost ob-button"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Assess a found object →
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}

// ── Kettle SVG with state-driven animation ────────────────────────────────────

function KettleIllustration({ hover }: { hover: HoverState }) {
  const isBreaking = hover === 'breaking'
  const isSalvage  = hover === 'salvage'

  // Shared transition easing — spring for transforms, simple for opacity
  const springT  = 'transform 0.55s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease'
  const fadeT    = 'opacity 0.35s ease'

  // Dim all parts except the failure point on salvage hover
  const dimOpacity = isSalvage ? 0.1 : 1

  return (
    <svg
      viewBox="0 0 388 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >

      {/* ── LID — floats up and tilts on breaking ── */}
      <g style={{
        transition: springT,
        transform: isBreaking
          ? 'translate(6px, -26px) rotate(14deg)'
          : 'translate(0px, 0px) rotate(0deg)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
        opacity: dimOpacity,
      } as React.CSSProperties}>
        {/* Lid seat */}
        <path d="M148 118 C148 114 160 112 175 112 C190 112 202 114 202 118" stroke="#EDEAE1" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.82"/>
        {/* Lid dome */}
        <path d="M148 118 C146 106 152 96 164 92 C168 90 172 89 175 89 C178 89 182 90 186 92 C198 96 204 106 202 118" stroke="#EDEAE1" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.86"/>
        {/* Lid ribs */}
        <path d="M158 93 C158 100 158 106 158 112" stroke="#EDEAE1" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.28"/>
        <path d="M166 90 C166 97 166 104 166 112" stroke="#EDEAE1" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.28"/>
        <path d="M175 89 C175 97 175 105 175 112" stroke="#EDEAE1" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.28"/>
        <path d="M184 90 C184 97 184 104 184 112" stroke="#EDEAE1" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.28"/>
        <path d="M192 93 C192 100 192 106 192 112" stroke="#EDEAE1" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.28"/>
        {/* Knob */}
        <line x1="175" y1="89" x2="175" y2="74" stroke="#EDEAE1" strokeWidth="2.0" strokeLinecap="round" opacity="0.75"/>
        <circle cx="175" cy="66" r="8" stroke="#EDEAE1" strokeWidth="2.2" fill="none" opacity="0.80"/>
      </g>

      {/* ── BODY ── */}
      <g style={{ transition: springT, opacity: dimOpacity } as React.CSSProperties}>
        <path d="M152 118 C146 118 140 124 138 136 L136 230 C136 246 142 262 152 268 C158 272 166 274 175 274 C184 274 192 272 198 268 C208 262 214 246 214 230 L212 136 C210 124 204 118 198 118 C190 116 182 115 175 115 C168 115 160 116 152 118 Z" stroke="#EDEAE1" strokeWidth="3.0" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.90"/>
        {/* Shading */}
        <path d="M143 144 L141 224" stroke="#EDEAE1" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.25"/>
        <path d="M150 126 L148 244" stroke="#EDEAE1" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.18"/>
        <path d="M158 119 L156 252" stroke="#EDEAE1" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.13"/>
        {/* Base */}
        <path d="M138 278 C138 284 158 287 175 287 C192 287 212 284 212 278" stroke="#EDEAE1" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.20"/>
        <path d="M144 287 C142 292 158 295 175 295 C192 295 208 292 206 287" stroke="#EDEAE1" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.12"/>
      </g>

      {/* ── CRACK — appears on breaking hover ── */}
      <g style={{ transition: fadeT, opacity: isBreaking ? 1 : 0 }}>
        <path d="M176 118 L169 142 L180 160 L165 188 L183 214" stroke="#C41E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9"/>
      </g>

      {/* ── SPOUT — breaks right and rotates ── */}
      <g style={{
        transition: springT,
        transform: isBreaking
          ? 'translate(32px, -14px) rotate(8deg)'
          : 'translate(0px, 0px) rotate(0deg)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
        opacity: dimOpacity,
      } as React.CSSProperties}>
        <path d="M214 136 C240 126 272 112 304 100 C330 90 354 84 368 82 C374 81 376 85 373 91" stroke="#EDEAE1" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.88"/>
        <path d="M214 150 C238 142 266 130 296 120 C320 112 344 107 360 106 C366 106 368 110 366 116" stroke="#EDEAE1" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.76"/>
        <line x1="373" y1="91" x2="366" y2="116" stroke="#EDEAE1" strokeWidth="2.0" strokeLinecap="round" opacity="0.72"/>
        <path d="M228 142 C256 132 286 120 314 110 C338 102 360 96 370 94" stroke="#EDEAE1" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.18"/>
      </g>

      {/* ── HANDLE — breaks left and drops ── */}
      <g style={{
        transition: springT,
        transform: isBreaking
          ? 'translate(-26px, 22px) rotate(-16deg)'
          : 'translate(0px, 0px) rotate(0deg)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
        opacity: dimOpacity,
      } as React.CSSProperties}>
        <path d="M138 138 C128 136 116 139 106 148 C96 158 92 172 92 196 C92 220 96 238 106 250 C116 260 128 263 138 262" stroke="#EDEAE1" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.88"/>
        <path d="M138 150 C130 149 120 152 112 160 C104 170 102 184 102 200 C102 216 104 230 112 238 C120 246 130 248 136 247" stroke="#EDEAE1" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.30"/>
      </g>

      {/* ── FAILURE CROSS — scales up on both hover states ── */}
      <g style={{
        transition: springT,
        transform: isSalvage
          ? 'scale(1.5)'
          : isBreaking
            ? 'scale(1.3)'
            : 'scale(1)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
      } as React.CSSProperties}>
        <line x1="175" y1="186" x2="175" y2="210" stroke="#C41E1E" strokeWidth="2.2" strokeLinecap="round" opacity={isBreaking || isSalvage ? 1 : 0.84}/>
        <line x1="163" y1="198" x2="187" y2="198" stroke="#C41E1E" strokeWidth="2.2" strokeLinecap="round" opacity={isBreaking || isSalvage ? 1 : 0.84}/>
      </g>

      {/* ── SALVAGE SELECTION RINGS — appear on found object hover ── */}
      <g style={{ transition: fadeT, opacity: isSalvage ? 1 : 0 }}>
        <circle cx="175" cy="198" r="24" stroke="#C41E1E" strokeWidth="1.2" strokeDasharray="5 3" fill="none" opacity="0.75"/>
        <circle cx="175" cy="198" r="36" stroke="#C41E1E" strokeWidth="0.6" strokeDasharray="2 5" fill="none" opacity="0.35"/>
      </g>

      {/* ── ANNOTATION — dims at idle, shows at both hover states ── */}
      <g style={{ transition: fadeT, opacity: isBreaking || isSalvage ? 0.9 : 0.22 }}>
        <line x1="187" y1="198" x2="238" y2="218" stroke="#EDEAE1" strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="238" y1="218" x2="356" y2="218" stroke="#EDEAE1" strokeWidth="0.8" strokeLinecap="round"/>
        {/* Idle / breaking label */}
        <text x="242" y="213" fontFamily="'Courier New', monospace" fontSize="9" fill="#EDEAE1"
          style={{ transition: fadeT, opacity: isSalvage ? 0 : 1 }}>
          failure point
        </text>
        {/* Salvage label */}
        <text x="242" y="213" fontFamily="'Courier New', monospace" fontSize="9" fill="#C41E1E"
          style={{ transition: fadeT, opacity: isSalvage ? 1 : 0 }}>
          salvageable component
        </text>
        <text x="242" y="226" fontFamily="'Courier New', monospace" fontSize="8" fill="#EDEAE1" opacity="0.65">
          heating element
        </text>
      </g>

    </svg>
  )
}
