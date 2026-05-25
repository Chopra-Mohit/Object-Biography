# OBJECT BIOGRAPHY — SESSION HANDOFF
# Feed this file + OB_ClaudeCode_Blueprint.md to Claude Code at the start of every new session.
# This file captures current build state. The blueprint is the source of truth for architecture.

---

## READING ORDER FOR NEW SESSION

1. Read `E:\College\Term V\AI Workshop\OB_ClaudeCode_Blueprint.md` IN FULL first.
2. Read this file IN FULL second.
3. Then and only then, start building.

---

## BUILD ORDER STATUS

| Step | Description                          | Status          | Notes                                                        |
|------|--------------------------------------|-----------------|--------------------------------------------------------------|
| 1    | Auth (magic link + middleware)       | ✅ COMPLETE      | Magic link + password sign-in (secondary). Session 60 days. |
| 2    | Registration form (no AI)            | ✅ COMPLETE      | Manual form + image upload + sidebar with previous entries.  |
| 3    | Barcode scanner                      | ⏭ DEFERRED      | Skipped. Image upload covers the use case better.           |
| 4    | Biography generation API (Mote)      | ✅ COMPLETE      | Using Groq (llama-3.3-70b-versatile), not Claude.           |
| 5    | Biography reveal UI                  | ✅ COMPLETE      | BiographyLoader.tsx — redesigned with hierarchy + callouts. |
| 6    | Death Certificate                    | ✅ COMPLETE      | Certificate page, share token, PNG download, copy link.     |
| 6b   | Quick Insight mode                   | ✅ COMPLETE      | /salvage page, bbox annotation, DIY-focused component analysis.|
| 6c   | Mote assistant                       | ✅ COMPLETE      | Draggable screw character + live Groq chat on all pages.    |
| 7    | Registry                             | ✅ COMPLETE      | /registry — card grid, stats, pattern callout, cert links.  |
| 8    | User account                         | ⏳ NOT STARTED   | —                                                            |
| 9    | Tier gates                           | ⏭ DEFERRED      | Everything free for now. Add gates later.                   |
| 10   | Polish + deploy                      | ⏳ NOT STARTED   | —                                                            |

---

## WHAT EXISTS RIGHT NOW

### Project root
```
E:\College\Term V\AI Workshop\object-biography\
```

### Confirmed working files

```
middleware.ts                         — session refresh; protects /registry, /register, /biography

app/
  layout.tsx                          — root layout
  page.tsx                            — homepage (server component)
  globals.css                         — design tokens + responsive breakpoints

  components/                         — homepage-only components
    Nav.tsx                           — homepage nav: How It Works, Who It's For, Assess, Registry, Register
    Hero.tsx                          — 3-column: left path | animated kettle SVG | right path
    HowItWorks.tsx                    — stacked rows (Life/Death/Second Life); Death in red
    Argument.tsx                      — editorial section (renders before HowItWorks)
    WhoItsFor.tsx                     — 3 user types
    Footer.tsx

  auth/login/page.tsx                 — magic link (primary) + password sign-in (collapsible)
  api/
    auth/callback/route.ts            — PKCE + token_hash flows
    register/route.ts                 — POST: inserts registration row
    generate-biography/route.ts       — POST: streams Groq biography, saves to Supabase on done
    generate-certificate/route.ts     — POST: creates certificate row, returns { share_token }
    identify-product/route.ts         — POST: image → ProductIdentification via Groq vision
    quick-insight/route.ts            — POST: image → QuickInsightResult (no auth required)
    mote-chat/route.ts                — POST: { messages[] } → { reply } via Groq chat

  register/page.tsx                   — auth-gated; InnerNav + two-column form + sidebar
  registry/page.tsx                   — auth-gated; InnerNav + stats + pattern callout + card grid
  biography/[id]/page.tsx             — auth-gated; InnerNav + BiographyLoader
  certificate/[token]/page.tsx        — PUBLIC; DeathCertificate + actions + acquisition CTA
  salvage/page.tsx                    — PUBLIC; InnerNav + QuickInsightUpload

lib/
  supabase/
    client.ts / server.ts / admin.ts
  anthropic/
    client.ts                         — Groq client
    prompts.ts                        — Mote biography system prompt
    biography.ts                      — generateBiography() async generator (SSE streaming)
    quickInsightTypes.ts              — CLIENT-SAFE: BBox + all Quick Insight types
    quickInsight.ts                   — SERVER ONLY: Groq generation + re-exports types

  utils/certificate.ts

components/
  InnerNav.tsx                        — SHARED: fixed nav for all inner pages (salvage/register/registry/biography)
                                        Has scroll-aware background fade. Links: Assess / Registry / Register →
  MoteAssistant.tsx                   — Draggable screw character (side-elevation SVG, blinking eyes)
                                        Click opens Groq-powered chat panel. Context-specific intro per page.
                                        Contexts: 'home' | 'salvage' | 'register' | 'biography'
  biography/
    BiographyLoader.tsx               — Streaming + structured biography display
                                        Life: narrative + supply chain callout + human/env cost boxes
                                        Death: failed component (red accent) + narrative + design decision callout
                                        Second Life: italic serif narrative + 2x2 metrics grid + assumptions
                                        Certificate CTA: summary card + file button
  certificate/
    DeathCertificate.tsx
    CertificateActions.tsx
  registration/
    ManualEntryForm.tsx
    RegistrationSidebar.tsx
  registry/
    ObjectCard.tsx                    — Client component: hover border, brand/name/dates/failed component/status pill
  salvage/
    QuickInsightUpload.tsx            — upload → analysing → two-panel annotated result
    AnnotatedImage.tsx                — two panels: original | component map with bbox overlays
                                        Null bbox fallback: "Component locations not available" overlay
    SalvageCard.tsx                   — Object history + details (two boxes) | Materials table |
                                        "Has remaining life" / "Beyond saving" side-by-side columns |
                                        Project blueprints section
    VerdictBadge.tsx

types/database.ts                     — Full TypeScript schema + BiographyJSON interface
```

---

## QUICK INSIGHT — BBOX SCHEMA

```typescript
// lib/anthropic/quickInsightTypes.ts — CLIENT-SAFE

export interface BBox {
  x: number  // left edge % (0–100)
  y: number  // top edge % (0–100)
  w: number  // width %
  h: number  // height %
}

// SalvageableComponent and NonSalvageableComponent both have bbox: BBox | null
// AnnotatedImage renders overlays as position:absolute at bbox percentages
// objectFit NOT used on images — natural ratio ensures bbox accuracy
```

---

## MOTE ASSISTANT — HOW IT WORKS

- `components/MoteAssistant.tsx` — `'use client'`, fixed bottom-right, draggable
- Screw SVG: side elevation with Phillips head, blinking cartoon eyes, threaded shaft
- Click opens chat panel (272px wide); first message = context-specific intro
- Chat calls `POST /api/mote-chat` → Groq `llama-3.3-70b-versatile`, max 120 tokens
- Mote's chat persona: terse, forensic analyst tone, knows Object Biography's two paths
- Drag detection: distance-based (>4px = drag, not click) — no race condition
- Add to a page: `<MoteAssistant context="salvage" />` outside `<main>`

---

## INNERNAV — INNER PAGES

`components/InnerNav.tsx` — fixed, 52px, scroll-aware background fade.
Add to any inner page:
```tsx
<>
  <InnerNav />
  <main style={{ paddingTop: 'calc(52px + var(--ob-space-12))' }}>
    ...
  </main>
</>
```
Homepage uses its own `Nav.tsx` (different links, not fixed).

---

## .env.local — CURRENT STATE

```
NEXT_PUBLIC_SUPABASE_URL=https://uvvquvjeauauvuspcnat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(filled)
SUPABASE_SERVICE_ROLE_KEY=(filled)
ANTHROPIC_API_KEY=(filled but NO CREDITS — do not use)
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=(filled — active, powers all generation)
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true
```

---

## package.json — KEY VERSIONS

```
next: ^16.2.6   (Next.js 15/16 — cookies() must be awaited)
react: ^18
@supabase/ssr: ^0.5.2
groq-sdk: installed (ACTIVE)
html-to-image: installed
```

---

## CRITICAL NOTES

**Next.js 15+ async cookies:**
```typescript
const cookieStore = await cookies()  // ✅
const cookieStore = cookies()        // ❌ silent HTTP 500
```

**Server/client boundary:**
- `lib/anthropic/quickInsight.ts` — SERVER ONLY (imports Groq)
- `lib/anthropic/quickInsightTypes.ts` — CLIENT-SAFE (types only)
- Never import server files from client components — causes GROQ_API_KEY leak

**Design system:** Never use Tailwind colour/font utilities. Always `var(--ob-*)`.
Key tokens: `--ob-bg: #1B1B17`, `--ob-fg: #EDEAE1`, `--ob-fg-dim: #9C9990`, `--ob-rule: #3A3A34`, `--ob-red: #C41E1E`

---

## SUPABASE SCHEMA

Tables: `users`, `manufacturers`, `products`, `failure_modes`, `materials`, `registrations`, `certificates`, `corrections`

**CRITICAL constraint on registrations:**
```sql
check (product_id is not null OR (manual_brand is not null AND manual_product_name is not null))
```
Always send both `manual_brand` AND `manual_product_name` when no `product_id`.

---

## DESIGN SYSTEM / HOMEPAGE

Page order: Hero → Argument → HowItWorks → WhoItsFor
Section numbers: 01 Hero, 02 Argument, 03 HowItWorks, 04 WhoItsFor

---

## REMAINING STEPS

### C. User account — Step 8 (NEXT)
Build `/account` page:
- Show user email, tier (free), registry count
- Sign-out button (client component, calls supabase.auth.signOut())
- JSON export: download all registrations as a single JSON file
  - Route: GET /api/export → returns JSON array of all user registrations with biography_json
- Account deletion: two-step confirmation UI
  - Step 1: "Delete account" button → shows warning + "I understand" confirmation
  - Step 2: calls DELETE /api/account → deletes all registrations, certificates, then auth user
  - Use supabaseAdmin (service role) for the deletion cascade
- Add link to InnerNav (currently has Assess / Registry / Register)

### D. Deploy — Step 10 (AFTER account)
- Vercel deploy (connect GitHub repo or drag-and-drop)
- Update NEXT_PUBLIC_APP_URL to production URL
- Update Supabase Auth → URL Configuration → Site URL + Redirect URLs to production URL
- Mobile responsive pass:
  - Hero: already collapses (ob-hero-grid media query exists)
  - InnerNav: needs hamburger or link collapse below ~500px
  - Biography page: MetaRow grid (160px label) may be too wide on mobile
  - Registry: already collapses (ob-registry-grid media query exists)
  - Salvage: two-panel annotated image needs to stack on mobile
- Error states: all API routes return errors but UI sometimes shows raw JSON — add friendly messages
- Test all Supabase auth flows with production URL
- Set ANTHROPIC_API_KEY credits if switching from Groq to Claude

### E. Certificate page (optional polish)
The certificate page (`/certificate/[token]`) was built earlier but may need a pass:
- Make sure it renders correctly for the public (no auth)
- The acquisition CTA ("Found this object? Assess it →") links to /salvage — verify it works
- DeathCertificate.tsx may not yet surface the richer biography data from the updated Mote prompt

### F. Annotation accuracy (ongoing)
The Quick Insight component map still shows generic/inaccurate regions sometimes.
The AI (llama-4-scout) returns null bboxes for some images — this now shows a fallback message.
To improve: consider post-processing bboxes or prompting more explicitly with image dimensions.
Cannot fix without changing the underlying model or adding a dedicated object-detection step.
