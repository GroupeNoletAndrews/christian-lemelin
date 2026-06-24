### Image Strategy

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design system

The UI follows a design system aligned with the Framer **OPUS** template. **[`DESIGN.md`](frontend/DESIGN.md) is the source of truth** for colors, typography, spacing, and component conventions.

- **Read `DESIGN.md` before creating or changing any UI.**
- **Update `DESIGN.md` (including its changelog) on every design change.**
- Use the design tokens from [`frontend/src/app/globals.css`](frontend/src/app/globals.css) (`bg-background`, `text-foreground`, `text-accent`, `border-border`, `font-sans`, `font-mono`…) — never hard-code hex values in components.

# Backend & environments

The app is a 3-service stack: Next.js frontend (`frontend/`) → NestJS + Prisma API (`backend/`) → Postgres. The frontend talks to the API via `NEXT_PUBLIC_API_URL`; the admin data layer is [`frontend/src/lib/admin-context.tsx`](frontend/src/lib/admin-context.tsx) calling [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts).

- **[`README.md`](README.md) is the source of truth** for running the app — dev (local Postgres via Docker) vs prod (**Supabase**), env vars, and schema migrations.
- Dev vs prod differ by `DATABASE_URL`, CORS (`CORS_ALLOW_LOCALHOST` on in dev / off in prod, plus `CORS_ORIGIN`), and `SEED_DEMO_DATA`. Note `NODE_ENV` is `production` in **both** and does not drive this app's CORS or seeding. Don't hard-code DB/connection details.
- Schema changes go through Prisma migrations (`backend/prisma/migrations/`) — see README "Changing the database schema". Keep `backend/prisma/schema.prisma` and the seed ([`backend/src/seed.ts`](backend/src/seed.ts)) in sync.
- Docker runs via WSL2 (no Docker Desktop); WSL/Docker setup is in [`DOCKER.md`](DOCKER.md).
