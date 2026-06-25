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

---

## Prerequisites

- **Node.js 20+**
- For **local dev**: a **Docker-compatible runtime** (Docker Desktop / Docker Engine / Rancher / Podman / OrbStack) + the **Supabase CLI** — runs the whole database + storage stack on your machine. *(Or, instead, a remote Supabase project — see [Local development](#local-development).)*
- For **deploy**: a **Supabase** project (Postgres + Storage) and a **Vercel** account/project (the app is already at `https://christian-lemelin.vercel.app`).

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

The recommended local stack runs a **full Supabase instance** (Postgres + Storage + Studio) on your machine via the [Supabase CLI](https://supabase.com/docs/guides/local-development) — so you never touch production. It needs a **Docker-compatible runtime**.

> **Windows + Docker Engine in WSL2:** run the Supabase CLI **inside WSL** (that's where the Docker daemon lives). `npm` / Prisma / `next dev` can stay on Windows — WSL2 forwards `localhost`. Make sure the Docker daemon is up before `supabase start`.
>
> ⚠️ **Keep a WSL terminal open while developing.** WSL2 shuts its VM down once no WSL process is running, which stops the Supabase containers and makes `localhost:54322` unreachable from Windows (Prisma → `P1001`, app → DB errors). Leave a WSL session open (the one you ran `supabase start` in is fine). If the DB suddenly becomes unreachable, the VM went idle — reopen/refresh a WSL session. For a permanent fix, enable [mirrored networking](https://learn.microsoft.com/windows/wsl/networking#mirrored-mode-networking) (`networkingMode=mirrored` in `%USERPROFILE%\.wslconfig`, then `wsl --shutdown`).

### First-time setup (new machine)

**1. Install the Supabase CLI** — one-time (Linux/WSL, no sudo). The release tarball ships **two** binaries (`supabase` + `supabase-go`) that must stay side by side — extract the whole archive, don't move a single file out of it:
```bash
mkdir -p ~/.local/share/supabase && cd /tmp
url=$(curl -fsSL https://api.github.com/repos/supabase/cli/releases/latest | grep -oE 'https://[^"]*_linux_amd64\.tar\.gz' | head -1)
curl -fsSL "$url" | tar -xz -C ~/.local/share/supabase
echo 'export PATH="$HOME/.local/share/supabase:$PATH"' >> ~/.bashrc && export PATH="$HOME/.local/share/supabase:$PATH"
supabase --version
```
*(macOS: `brew install supabase/tap/supabase`.)*

**2. Start the stack** — from the repo root (where `supabase/` lives). The first run pulls the Docker images (a few minutes); if you hit a registry **`Rate exceeded`**, just rerun — already-pulled layers are cached:
```bash
supabase start     # Postgres :54322 · API/Storage :54321 · Studio :54323
                   # buckets `cvs` (private) + `images` (public) auto-created from supabase/config.toml
supabase status    # reprints the local URLs + keys at any time
```

**3. Wire the app at the local stack** — create `frontend/.env` and `frontend/.env.local` (both gitignored) with the **local** values printed by `supabase start`:

`frontend/.env` (read by the Prisma CLI — no pooler locally, so both URLs are identical):
```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```
`frontend/.env.local` (read by `next dev`):
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key from `supabase status`>
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=<Secret key from `supabase status`>
JWT_SECRET=any-long-random-string-for-local
SEED_DEMO_DATA=true
```
> The current CLI prints keys in the new `sb_publishable_…` / `sb_secret_…` format — copy them verbatim from `supabase status`.

**4. Schema, seed, run** — where Node lives (e.g. Windows):
```bash
cd frontend
npm install         # also runs `prisma generate` (postinstall)
npm run db:deploy   # applies Prisma migrations to the local DB
npm run db:seed     # creates the admin user + demo content
npm run dev         # http://localhost:3000
```

### Daily startup (already set up — e.g. right after `git pull`)

Two terminals:
```bash
# 1) WSL — LEAVE THIS OPEN (keeps the DB alive — see the warning above)
cd /mnt/c/GNA/christian-lemelin
~/.local/share/supabase/supabase start     # fast — images cached, data persists across restarts
```
```powershell
# 2) Windows
cd C:\GNA\christian-lemelin\frontend
npm run dev                                 # http://localhost:3000
```
- Re-run `npm install` **only** if dependencies changed since the pull.
- Re-run `npm run db:deploy` **only** if new migrations landed (`frontend/prisma/migrations/`).
- Re-run `npm run db:seed` **only** to (re)create the admin/demo data — local data otherwise persists in the Docker volumes between `supabase start`/`stop`.
- Stop everything with `supabase stop` (add `--no-backup` to also **wipe** the local DB).

### Local URLs & credentials

| What | URL / value |
|---|---|
| App | http://localhost:3000 |
| Admin dashboard | http://localhost:3000/admin — log in with **`admin` / `password`** |
| **Supabase Studio** (browse/edit the DB) | **http://localhost:54323** |
| Mailpit (catches emails sent locally) | http://localhost:54324 |
| Postgres (psql / DBeaver / TablePlus) | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Supabase API / Storage gateway | http://localhost:54321 |

> All of these respond **only while the WSL VM is alive** — keep a WSL terminal open.

### Troubleshooting

- **`P1001: Can't reach database server at 127.0.0.1:54322`** — the WSL VM went idle and stopped the containers. Reopen a WSL terminal, run `supabase start` (or `supabase status`), then retry — and keep that terminal open. (Permanent fix: WSL [mirrored networking](https://learn.microsoft.com/windows/wsl/networking#mirrored-mode-networking).)
- **`supabase start` → `address already in use` (54321/54322)** — a previous stack is still up: `supabase stop`, then `supabase start`.
- **`Could not find the supabase-go binary`** — the CLI was installed with only the `supabase` shim. Reinstall by extracting the **entire** tarball into one directory (step 1).
- **Registry `Rate exceeded` during `supabase start`** — transient pull-rate limit; just rerun (cached layers make the retry fast).
- **Storage upload / key errors** — the keys in `.env.local` must match the current `supabase status` output.

### Alternative — no Docker

Point the same vars at a **separate remote Supabase project** (see [Supabase setup](#supabase-setup-one-time)). **Never point local dev at the production project** — `npm run db:migrate` / `db:seed` would mutate prod.

- The API is same-origin — no separate backend process to start.

---

## Deploy to Vercel

The app lives in the `frontend/` subdirectory, so the important setting is the **root directory**.

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
