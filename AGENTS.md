### Image Strategy

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design system

The UI follows a design system aligned with the Framer **OPUS** template. **[`DESIGN.md`](frontend/DESIGN.md) is the source of truth** for colors, typography, spacing, and component conventions.

- **Read `DESIGN.md` before creating or changing any UI.**
- **Update `DESIGN.md` (including its changelog) on every design change.**
- Use the design tokens from [`frontend/src/app/globals.css`](frontend/src/app/globals.css) (`bg-background`, `text-foreground`, `text-accent`, `border-border`, `font-sans`, `font-mono`…) — never hard-code hex values in components.

# Backend & environments

The app is a **single Next.js deployment** (one Vercel project): the marketing site, `/admin`, and the API all ship together. The API lives in **route handlers** under [`frontend/src/app/api/`](frontend/src/app/api/), with business logic in [`frontend/src/lib/server/`](frontend/src/lib/server/) (Prisma singleton, jose auth, mail, storage, validation). The DB is **Supabase** (Postgres) and file uploads go to **Supabase Storage**. Everything is same-origin, so there is no CORS and the API is reached with **relative `/api/...` paths** — the admin data layer is [`frontend/src/lib/admin-context.tsx`](frontend/src/lib/admin-context.tsx) calling [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts).

- **[`README.md`](README.md) is the source of truth** for running and deploying the app — local dev, env vars, Supabase setup (DB + Storage buckets), migrations, and Vercel deploy.
- Admin auth is a **jose HS256 JWT in an httpOnly cookie** (`JWT_SECRET`). `requireAdmin()` in [`frontend/src/lib/server/auth.ts`](frontend/src/lib/server/auth.ts) is the real authorization boundary inside each protected handler; [`frontend/src/proxy.ts`](frontend/src/proxy.ts) (Next 16's renamed `middleware.ts`) does a coarse `/admin/dashboard` redirect.
- Prisma uses **two URLs**: `DATABASE_URL` = Supabase transaction pooler (`:6543`, `pgbouncer=true&connection_limit=1`) at runtime; `DIRECT_URL` = direct/session connection (`:5432`) for migrate/seed. The client is a `globalThis` singleton ([`frontend/src/lib/server/prisma.ts`](frontend/src/lib/server/prisma.ts)) — never `new PrismaClient()` per request.
- Schema changes go through Prisma migrations ([`frontend/prisma/migrations/`](frontend/prisma/migrations/)) — see README "Changing the database schema". Keep [`frontend/prisma/schema.prisma`](frontend/prisma/schema.prisma) and the seed ([`frontend/prisma/seed.ts`](frontend/prisma/seed.ts)) in sync. Migrations apply in the Vercel build (`vercel-build`); the seed is a one-off `npm run db:seed`. `SEED_DEMO_DATA=false` in prod.
- Uploads: CVs → private `cvs` bucket (browser-direct signed upload, bypasses Vercel's 4.5MB function cap); réalisation images → public `images` bucket. Server uses `SUPABASE_SECRET_KEY`; the browser uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Don't hard-code keys/connection details.
- **Legacy:** the old NestJS API (`backend/`) and the Docker stack (`docker-compose*.yml`, `DOCKER.md`) are no longer deployed and can be removed. Vercel only builds `frontend/`.
