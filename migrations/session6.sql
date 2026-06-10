-- ════════════════════════════════════════════════════════════════════
-- Session 6 migration — run once in Supabase Dashboard → SQL Editor
-- Safe to re-run (everything is IF NOT EXISTS / idempotent).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Columns missing from the session-5 migration ──────────────────
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS finder_email  TEXT,
  ADD COLUMN IF NOT EXISTS picked_up_by  TEXT;

-- ── 2. Barcelona "Recollida de Mobles i Trastos" feature ─────────────

-- Zone alert signups: one row per (email, zone). zone_slug values come
-- from lib/barcelona/zones.ts.
CREATE TABLE IF NOT EXISTS public.barcelona_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  zone_slug   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (email, zone_slug)
);

-- Community feed: sightings, pickups and notes around collection nights.
CREATE TABLE IF NOT EXISTS public.barcelona_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name     TEXT,
  author_email     TEXT,
  zone_slug        TEXT,
  kind             TEXT NOT NULL DEFAULT 'note'
                   CHECK (kind IN ('sighting', 'pickup', 'note')),
  body             TEXT NOT NULL,
  lat              FLOAT,
  lng              FLOAT,
  registration_id  UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS barcelona_posts_created_at_idx
  ON public.barcelona_posts (created_at DESC);

-- ── 3. Row Level Security ─────────────────────────────────────────────

-- barcelona_subscriptions: anyone can subscribe; only service-role reads
ALTER TABLE public.barcelona_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can subscribe"
  ON public.barcelona_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT policy for anon/authenticated — only service_role (cron) reads emails.

-- barcelona_posts: public read, anyone can post
ALTER TABLE public.barcelona_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Posts are publicly readable"
  ON public.barcelona_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can post"
  ON public.barcelona_posts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
