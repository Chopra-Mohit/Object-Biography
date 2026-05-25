'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export type MoteContext = 'home' | 'salvage' | 'register' | 'biography'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const INTRO: Record<MoteContext, string> = {
  home:      "I'm Mote. I assess objects — found ones and dead ones. What do you want to know?",
  salvage:   "I'm Mote. Upload a photograph and I'll tell you what's salvageable, what isn't, and what you could actually build from what's here.",
  register:  "I'm Mote. Tell me what broke. I'll write its biography — where it came from, how it failed, and what comes next.",
  biography: "I'm Mote. I've read this object's full life. Ask me anything about it.",
}

interface Props {
  context: MoteContext
}

export default function MoteAssistant({ context }: Props) {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [pos, setPos]           = useState({ x: 0, y: 0 })
  const [blinking, setBlinking] = useState(false)

  const dragging     = useRef(false)
  const moved        = useRef(false)
  const dragStart    = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Blink loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const blink = () => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 150)
      setTimeout(blink, 3000 + Math.random() * 4000)
    }
    const t = setTimeout(blink, 2000)
    return () => clearTimeout(t)
  }, [])

  // ── Auto-scroll chat ─────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Drag ────────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    moved.current    = false
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - dragStart.current.mx
      const dy = ev.clientY - dragStart.current.my
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
    }
    function onUp() {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  function handleScrewClick() {
    if (moved.current) return   // was a drag, not a click
    if (!open) {
      setMessages([{ role: 'assistant', content: INTRO[context] }])
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  // ── Send message ─────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)

    try {
      const res  = await fetch('/api/mote-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.reply ?? data.error ?? 'No response.' }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // ── Bubble position relative to the screw ───────────────────────────────────
  // Default: opens upward-left. If dragged near top, opens downward.
  const bubbleBelow = pos.y < -260

  return (
    <>
      {/* Inject blink keyframe */}
      <style>{`
        @keyframes mote-blink {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.08); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: 28 - pos.y,
          right:  28 - pos.x,
          zIndex: 1000,
          display: 'flex',
          flexDirection: bubbleBelow ? 'column' : 'column-reverse',
          alignItems: 'flex-end',
          gap: 12,
          userSelect: 'none',
        }}
      >
        {/* ── Chat panel ── */}
        {open && (
          <div
            style={{
              width: 272,
              background: 'var(--ob-bg)',
              border: '1px solid var(--ob-rule)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid var(--ob-rule)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: 'var(--ob-fs-small)',
                  color: 'var(--ob-fg)',
                  fontWeight: 500,
                }}>Mote</span>
                <span style={{
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: 'var(--ob-fs-meta)',
                  letterSpacing: 'var(--ob-ls-eyebrow)',
                  textTransform: 'uppercase',
                  color: 'var(--ob-fg-dim)',
                }}>Object Biography</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ob-fg-dim)', fontFamily: 'var(--ob-font-mono)',
                  fontSize: '16px', lineHeight: 1, padding: '0 2px',
                }}
              >×</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 280,
              minHeight: 120,
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    fontFamily: 'var(--ob-font-mono)',
                    fontSize: 'var(--ob-fs-meta)',
                    lineHeight: 'var(--ob-lh-relaxed)',
                    color: m.role === 'user' ? 'var(--ob-fg-dim)' : 'var(--ob-fg)',
                    background: m.role === 'user' ? 'transparent' : 'rgba(255,255,255,0.04)',
                    border: m.role === 'user' ? '1px solid var(--ob-rule)' : 'none',
                    padding: '6px 10px',
                    maxWidth: '88%',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-meta)', color: 'var(--ob-fg-dim)' }}>
                  ...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop: '1px solid var(--ob-rule)', display: 'flex' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask Mote anything"
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: 'var(--ob-fs-meta)',
                  color: 'var(--ob-fg)',
                  padding: '10px 12px',
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                style={{
                  background: 'none',
                  border: 'none',
                  borderLeft: '1px solid var(--ob-rule)',
                  cursor: loading || !input.trim() ? 'default' : 'pointer',
                  color: loading || !input.trim() ? 'var(--ob-fg-dim)' : 'var(--ob-fg)',
                  fontFamily: 'var(--ob-font-mono)',
                  fontSize: 'var(--ob-fs-meta)',
                  padding: '10px 14px',
                  transition: 'color 0.15s',
                }}
              >→</button>
            </div>
          </div>
        )}

        {/* ── Screw character ── */}
        <div
          onMouseDown={onMouseDown}
          onClick={handleScrewClick}
          style={{ cursor: 'grab', flexShrink: 0 }}
          title="Talk to Mote"
        >
          <ScrewCharacter blinking={blinking} active={open} />
        </div>
      </div>
    </>
  )
}

// ── Screw SVG — side elevation with eyes ──────────────────────────────────────

function ScrewCharacter({ blinking, active }: { blinking: boolean; active: boolean }) {
  const eyeColor = active ? '#EDEAE1' : '#C0BDB4'

  return (
    <svg
      width="44"
      height="120"
      viewBox="0 0 44 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: active ? 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' : 'none', transition: 'filter 0.3s ease' }}
    >
      {/* ── Head ── */}
      <rect x="2" y="6" width="40" height="30" rx="4"
        fill="#323228"
        stroke={active ? '#7A7A70' : '#4A4A44'}
        strokeWidth="1.5"
      />

      {/* Phillips slot on top */}
      <rect x="16" y="1" width="12" height="8" rx="2" fill="#1E1E1A" />
      <rect x="20" y="0" width="4" height="8" rx="1.5" fill="#161614" />

      {/* Sheen */}
      <ellipse cx="12" cy="14" rx="7" ry="4" fill="rgba(255,255,255,0.04)" transform="rotate(-20 12 14)" />

      {/* ── Eyes ── */}
      {/* Left eye socket */}
      <ellipse cx="14" cy="22" rx="7" ry="7" fill="#1A1A16" />
      {/* Right eye socket */}
      <ellipse cx="30" cy="22" rx="7" ry="7" fill="#1A1A16" />

      {/* Left pupil/iris */}
      <ellipse
        cx={active ? 15 : 14}
        cy="23"
        rx="4"
        ry={blinking ? 0.4 : 4}
        fill={eyeColor}
        style={{ transition: 'cx 0.2s ease, rx 0.06s ease, ry 0.06s ease' }}
      />
      {/* Right pupil/iris */}
      <ellipse
        cx={active ? 31 : 30}
        cy="23"
        rx="4"
        ry={blinking ? 0.4 : 4}
        fill={eyeColor}
        style={{ transition: 'cx 0.2s ease, rx 0.06s ease, ry 0.06s ease' }}
      />

      {/* Left pupil dot */}
      {!blinking && (
        <>
          <circle cx={active ? 16 : 14} cy="23" r="1.8" fill="#1A1A16"
            style={{ transition: 'cx 0.2s ease' }}
          />
          <circle cx={active ? 17 : 15} cy="21" r="0.9" fill="rgba(255,255,255,0.4)" />
        </>
      )}
      {/* Right pupil dot */}
      {!blinking && (
        <>
          <circle cx={active ? 32 : 30} cy="23" r="1.8" fill="#1A1A16"
            style={{ transition: 'cx 0.2s ease' }}
          />
          <circle cx={active ? 33 : 31} cy="21" r="0.9" fill="rgba(255,255,255,0.4)" />
        </>
      )}

      {/* ── Shoulder / transition ── */}
      <path d="M8 36 L14 46 L30 46 L36 36 Z" fill="#2A2A26" />

      {/* ── Threaded shaft ── */}
      <rect x="14" y="46" width="16" height="58" fill="#2A2A26" stroke="#3E3E38" strokeWidth="1" />

      {/* Thread marks — left side */}
      {[50, 57, 64, 71, 78, 85, 92, 99].map((y, i) => (
        <line key={i}
          x1="14" y1={y}
          x2="30" y2={y - 4}
          stroke="#4A4A44" strokeWidth="0.8"
        />
      ))}

      {/* ── Pointed tip ── */}
      <path d="M14 104 L22 120 L30 104 Z"
        fill="#2A2A26"
        stroke="#3E3E38"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}
