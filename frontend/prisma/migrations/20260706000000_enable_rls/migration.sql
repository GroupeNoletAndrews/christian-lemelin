-- Enable Row Level Security (RLS) on every public table.
--
-- This app does NOT use the Supabase Data API (PostgREST): every read/write goes
-- through Prisma over the pooler/direct Postgres connection as the `postgres`
-- role, which OWNS these tables and therefore BYPASSES RLS. Enabling RLS with NO
-- policies makes the tables fully inaccessible to the `anon` / `authenticated`
-- roles used by the public `sb_publishable_…` key — closing the hole where anyone
-- holding that (browser-exposed) key could read/write the data via PostgREST
-- (notably `applications` and `contact_messages`, which hold personal data), and
-- clearing Supabase's "RLS disabled in public" warnings.
--
-- IMPORTANT: do NOT add `FORCE ROW LEVEL SECURITY` — that would subject the
-- owning `postgres` role to RLS as well and lock Prisma out. Plain ENABLE keeps
-- the owner (and any BYPASSRLS role) exempt, which is exactly what we want.
--
-- Re-running these statements is a no-op, so this migration is safe to apply even
-- if RLS was already turned on manually in the Supabase dashboard.

ALTER TABLE "jobs"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "realisations"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_settings"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "section_images"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_messages"   ENABLE ROW LEVEL SECURITY;

-- Prisma's own bookkeeping table lives in `public` too, so Supabase flags it as
-- well. Prisma touches it only as `postgres` (bypasses RLS), so enabling RLS here
-- is safe and silences the last warning.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
