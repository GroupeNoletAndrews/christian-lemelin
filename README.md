# Entreprises Christian Lemelin

Marketing site + admin dashboard for managing **emplois** (jobs) and **réalisations** (projects).

## Architecture

A **single Next.js 16 app** deployed as **one Vercel project** — the marketing site, the `/admin` dashboard, and the API all ship together (same origin, no CORS).

```
Browser ─▶ Next.js app (Vercel)
              ├─ pages / admin (React)
              ├─ /api/* route handlers ──▶ Supabase Postgres (Prisma)
              └─ uploads ────────────────▶ Supabase Storage
```

- **API** — route handlers in [`frontend/src/app/api/`](frontend/src/app/api/); business logic in [`frontend/src/lib/server/`](frontend/src/lib/server/) (Prisma singleton, jose auth, Resend mail, Supabase storage, zod validation). Endpoints: `auth` (login/logout/session), `jobs`, `realisations` (+ `reorder`, `[id]/pin`), `applications` (+ `upload-url`), `contact`, `health`, `webhooks/resend`.
- **Database** — **Supabase** (managed Postgres) via Prisma. Runtime uses the transaction pooler; migrations/seed use the direct connection.
- **Storage** — **Supabase Storage**: a private `cvs` bucket (job-application CVs) and a public `images` bucket (réalisation images). Files upload **straight from the browser** via short-lived signed URLs, so they never pass through a serverless function (bypassing Vercel's 4.5 MB body cap).
- **Auth** — admin login is a row in `admin_users` (bcrypt-hashed). On success the server sets a **jose HS256 JWT in an httpOnly cookie**; `requireAdmin()` guards every protected route handler. Default seeded credentials: **`admin` / `password`** (change in prod).

Réalisations have an **admin-controlled display order** (drag-and-drop in the dashboard; persisted via `PATCH /api/realisations/reorder`). On `/realisations` the first is shown as a large **featured** project; home-page cards deep-link via `?featured=<id>`.

> The old NestJS API (`backend/`) and the Docker stack (`docker-compose*.yml`, `DOCKER.md`) are **legacy** — superseded by this single deployment and safe to delete. Vercel only builds `frontend/`.

---

## Prerequisites

- **Node.js 20+**
- A **Supabase** project (free tier is fine) — for the Postgres database and Storage.
- A **Vercel** account/project (the app is already at `https://christian-lemelin.vercel.app`).

---

## Environment variables

Two scopes:

| Scope | Where (local) | On Vercel |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | `frontend/.env` (the **Prisma CLI** only reads `.env`) | Project → Settings → Environment Variables |
| everything else | `frontend/.env.local` | same |

Copy [`frontend/.env.example`](frontend/.env.example) and fill in real values. Both `.env` and `.env.local` are gitignored.

| Variable | Scope | Value |
|---|---|---|
| `DATABASE_URL` | server | Supabase **transaction pooler** (port `6543`) + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | server | Supabase **direct/session** connection (port `5432`) — used by migrate/seed |
| `JWT_SECRET` | server | a long random string (e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`) |
| `JWT_EXPIRES_IN` | server | `7d` (optional) |
| `SUPABASE_URL` | server | `https://<ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | server | the `sb_secret_…` key (Storage admin — **never expose**) |
| `NEXT_PUBLIC_SUPABASE_URL` | **client** | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **client** | the `sb_publishable_…` key (safe to expose) |
| `RESEND_API_KEY` | server | Resend key (optional — without it, email is disabled) |
| `MAIL_FROM` / `MAIL_TO` | server | sender (verified domain in prod) / company inbox |
| `RESEND_WEBHOOK_SECRET` | server | optional (verifies Resend webhook signatures) |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | server | admin login created by the seed |
| `SEED_DEMO_DATA` | server | `false` in prod (no demo content; admin still created) |

Get the two connection strings from **Supabase → Project Settings → Database → Connection string** (the "Transaction pooler" and "Session/Direct" tabs).

---

## Supabase setup (one-time)

1. **Create the Storage buckets** (Dashboard → Storage):
   - `cvs` — **Private**
   - `images` — **Public**
2. **Baseline the existing schema.** This DB already contains the app's tables, so tell Prisma the two committed migrations are already applied (otherwise `migrate deploy` fails with `P3005`). Run once, locally, with `frontend/.env` filled in:
   ```bash
   cd frontend
   npx prisma migrate resolve --applied 20260618000000_init
   npx prisma migrate resolve --applied 20260619000000_realisation_position
   ```
   > A brand-new/empty Supabase DB needs no baselining — `migrate deploy` creates everything.
3. **Seed the admin user** (and optionally demo content) — run once, locally:
   ```bash
   npm run db:seed          # uses DIRECT_URL; SEED_DEMO_DATA=false → admin only
   ```

---

## Local development

```bash
cd frontend
npm install            # also runs `prisma generate` (postinstall)
npm run dev            # http://localhost:3000
```

- App → http://localhost:3000 · Admin → http://localhost:3000/admin
- Point `DATABASE_URL`/`DIRECT_URL` (in `frontend/.env`) at your Supabase project. **Tip:** use a *separate* Supabase project for dev so you never write to prod.
- The API is same-origin — no separate backend process to start.

### Tests (Playwright E2E)

```bash
cd frontend
npx playwright install chromium   # one-time
npm run test:e2e
```

---

## Deploy to Vercel

The project is a monorepo, so the important setting is the **root directory**.

1. **Project Settings → General**
   - **Root Directory = `frontend`**
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: leave default — Vercel runs the `vercel-build` script (`prisma generate && prisma migrate deploy && next build`). `migrate deploy` applies any new migrations at build time (the DB must be baselined first, see above).
2. **Project Settings → Environment Variables** — add every variable from the table above (Production + Preview + Development). Server vars (no `NEXT_PUBLIC_`) stay server-side; only `NEXT_PUBLIC_*` reach the browser.
3. **Deploy** (push to the connected branch, or "Redeploy"). After the first deploy, confirm:
   - `https://<your-app>/api/health` → `{"status":"ok"}`
   - log in at `https://<your-app>/admin`

> Adding env vars: **Vercel Dashboard** → your project → **Settings → Environment Variables** → add name/value, pick the environments, **Save**, then **Redeploy** (env changes only apply to new deployments). Or via CLI: `vercel env add NAME production`. You can also paste a whole `.env` in the dashboard's bulk editor.

---

## Changing the database schema

1. Edit [`frontend/prisma/schema.prisma`](frontend/prisma/schema.prisma).
2. Create a migration against your dev DB:
   ```bash
   cd frontend
   npm run db:migrate -- --name your_change      # prisma migrate dev
   ```
3. Commit the generated folder under `frontend/prisma/migrations/`. The next Vercel deploy applies it automatically via `prisma migrate deploy` (the `vercel-build` step). Keep the seed ([`frontend/prisma/seed.ts`](frontend/prisma/seed.ts)) in sync.

---

## Email notifications (Resend)

Both public forms — **« Nous joindre »** ([`ContactForm`](frontend/src/components/sections/ContactForm.tsx)) and the **job application** modal ([`ApplyModal`](frontend/src/components/emplois/ApplyModal.tsx)) — save to the database and **also email a notification to the company** via [Resend](https://resend.com). The email is rendered to match the site's OPUS design; the application email attaches the uploaded CV (fetched from the `cvs` bucket). The submitter's address is set as `Reply-To`.

This lives in [`frontend/src/lib/server/mail/`](frontend/src/lib/server/mail/) so the API key never reaches the browser. Sending is **best-effort** — if Resend is down or unconfigured, the form still succeeds (the data is persisted) and the failure is logged.

| Var | Dev default | Prod |
|---|---|---|
| `RESEND_API_KEY` | — (email disabled if unset) | your Resend key |
| `MAIL_FROM` | `… <onboarding@resend.dev>` (no domain verification needed) | an address on a **verified** domain |
| `MAIL_TO` | `delivered@resend.dev` (Resend test inbox) | the real company address |
| `RESEND_WEBHOOK_SECRET` | optional | recommended (verifies webhook calls) |

Webhook endpoint: `POST /api/webhooks/resend` (logs delivery events; verifies the Svix signature when `RESEND_WEBHOOK_SECRET` is set).

---

## Monitoring (Sentry)

Errors are reported to **Sentry** ([`frontend/sentry.server.config.ts`](frontend/sentry.server.config.ts), [`frontend/sentry.edge.config.ts`](frontend/sentry.edge.config.ts), [`frontend/src/instrumentation-client.ts`](frontend/src/instrumentation-client.ts)). Optionally set `SENTRY_AUTH_TOKEN` in the build env to upload source maps. A Sentry→Discord relay lives at `POST /api/monitoring/discord` (set `DISCORD_MONITORING_WEBHOOK_URL` + `SENTRY_DISCORD_RELAY_SECRET`).

---

## Troubleshooting

- **`P3005` on deploy / "database schema is not empty"** — baseline the existing migrations (see Supabase setup, step 2) before `migrate deploy` runs.
- **Admin login fails to reach the server** — check the route handlers are deployed and `DATABASE_URL` is the pooler URL with `?pgbouncer=true`.
- **CV/image upload fails** — confirm the `cvs` (private) and `images` (public) buckets exist and `SUPABASE_SECRET_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set.
- **Emails not arriving** — `RESEND_API_KEY` unset disables email. In dev, mail goes to `delivered@resend.dev` (a Resend test inbox); confirm in the Resend dashboard.
