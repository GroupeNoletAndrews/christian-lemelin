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

- **API** — route handlers in [`frontend/src/app/api/`](frontend/src/app/api/); business logic in [`frontend/src/lib/server/`](frontend/src/lib/server/) (Prisma singleton, Supabase Auth, Resend mail, Supabase storage, zod validation). Endpoints: `jobs`, `realisations` (+ `reorder`, `[id]/pin`), `applications` (+ `upload-url`), `contact`, `health`, `webhooks/resend`. (Auth login/logout/session is handled client-side by Supabase Auth — no `/api/auth/*` routes.)
- **Database** — **Supabase** (managed Postgres) via Prisma. Runtime uses the transaction pooler; migrations/seed use the direct connection.
- **Storage** — **Supabase Storage**: one **public** `christian-alain` bucket for all site photos & videos (`photos/{a-propos,fabrication,logo,realisations,solutions}` + `videos/`) and a **private** `cvs` bucket for job-application CVs. Files upload **straight from the browser** via short-lived signed URLs, so they never pass through a serverless function (bypassing Vercel's 4.5 MB body cap). See [Media & Storage](#media--storage).
- **Auth** — admin login uses **Supabase Auth** (email + password) via [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side/nextjs). The browser signs in with `signInWithPassword`; the session (access + refresh tokens) lives in cookies and auto-refreshes. [`proxy.ts`](frontend/src/proxy.ts) refreshes the session on `/admin/*` and redirects the dashboard when signed out; `requireAdmin()` ([`auth.ts`](frontend/src/lib/server/auth.ts)) validates the session (`supabase.auth.getUser()`) at the top of every protected route handler. **Public sign-up is disabled** — create admin users in Supabase Studio (Auth → Users). Optional `ADMIN_EMAILS` allowlist gates which addresses may enter. (The data layer is unchanged — all DB access is still Prisma.)

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
| `ADMIN_EMAILS` | server | *optional* allowlist (comma-separated) — if set, only these emails may access `/admin`; unset = any Supabase user (sign-up is disabled, so just the ones you create) |
| `SUPABASE_URL` | server | `https://<ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | server | the `sb_secret_…` key (Storage admin — **never expose**) |
| `NEXT_PUBLIC_SUPABASE_URL` | **client** | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **client** | the `sb_publishable_…` key (safe to expose) |
| `RESEND_API_KEY` | server | Resend key (optional — without it, email is disabled) |
| `MAIL_FROM` / `MAIL_TO` | server | sender (verified domain in prod) / company inbox |
| `RESEND_WEBHOOK_SECRET` | server | optional (verifies Resend webhook signatures) |
| `SEED_DEMO_DATA` | server | `false` in prod (no demo content) |

Get the two connection strings from **Supabase → Project Settings → Database → Connection string** (the "Transaction pooler" and "Session/Direct" tabs).

---

## Supabase setup (one-time)

1. **Create the Storage buckets** (Dashboard → Storage):
   - `cvs` — **Private** (job-application CVs)
   - `christian-alain` — **Public** (all site photos & videos)

   Then upload the static site assets + demo images to the public bucket (see [Media & Storage](#media--storage)):
   ```bash
   cd frontend
   SUPABASE_URL="https://<ref>.supabase.co" SUPABASE_SECRET_KEY="sb_secret_…" npm run media:sync
   ```
2. **Baseline the existing schema.** This DB already contains the app's tables, so tell Prisma the two committed migrations are already applied (otherwise `migrate deploy` fails with `P3005`). Run once, locally, with `frontend/.env` filled in:
   ```bash
   cd frontend
   npx prisma migrate resolve --applied 20260618000000_init
   npx prisma migrate resolve --applied 20260619000000_realisation_position
   ```
   > A brand-new/empty Supabase DB needs no baselining — `migrate deploy` creates everything.
3. **Seed demo content** (optional) — run once, locally:
   ```bash
   npm run db:seed          # uses DIRECT_URL; SEED_DEMO_DATA controls demo data
   ```
4. **Create the admin login** in **Supabase → Authentication → Users → Add user**
   (set "Auto Confirm User"). Login is **Supabase Auth**, not the `admin_users`
   table. Keep **Auth → Providers → Email → "Allow new users to sign up" OFF** so
   `/admin` stays closed. Optionally set `ADMIN_EMAILS` to restrict which addresses
   may enter.

   **Temporary password → forced change on first login:** hand the client a
   temporary password, then flag the user so they must set their own on first
   sign-in. In the new user's **User Metadata**, add:

   ```json
   { "must_change_password": true }
   ```

   (Set it in the Add-user form's metadata field, or edit the user afterwards;
   or via SQL: `update auth.users set raw_user_meta_data =
   raw_user_meta_data || '{"must_change_password": true}' where email = '…';`.)
   On first login the app forces them to `/admin/change-password` and won't let
   them into the dashboard until they save a new password — which clears the
   flag. Resetting a user's password later and re-adding the flag re-triggers it.

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
                   # buckets `cvs` (private) + `christian-alain` (public) auto-created from supabase/config.toml
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
SEED_DEMO_DATA=true
# Optional: restrict /admin to specific Supabase users.
# ADMIN_EMAILS=you@example.com
```
> The current CLI prints keys in the new `sb_publishable_…` / `sb_secret_…` format — copy them verbatim from `supabase status`.

**4. Schema, seed, run** — where Node lives (e.g. Windows):
```bash
cd frontend
npm install         # also runs `prisma generate` (postinstall)
npm run db:deploy   # applies Prisma migrations to the local DB
npm run db:seed     # demo content (controlled by SEED_DEMO_DATA)
npm run media:sync  # uploads logo/video/photos + demo images to the local bucket
npm run dev         # http://localhost:3000
# Then create your admin login in Supabase Studio → Authentication → Users
# (http://localhost:54323) — login is Supabase Auth, not the seed.
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
- Re-run `npm run media:sync` **only** if you wiped the local stack (`supabase stop --no-backup`) — uploaded media otherwise persists too.
- Stop everything with `supabase stop` (add `--no-backup` to also **wipe** the local DB).

### Local URLs & credentials

| What | URL / value |
|---|---|
| App | http://localhost:3000 |
| Admin dashboard | http://localhost:3000/admin — log in with the **Supabase user** you created (Studio → Authentication → Users) |
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

## Media & Storage

All site **photos and videos** live in one **public** Supabase bucket, **`christian-alain`**, organised to mirror production:

```
christian-alain/                 (public)
  photos/
    a-propos/        — À-propos page photos
    fabrication/     — Savoir-Faire + materials (inox, acier, …)
    logo/            — logo_eclemelin.png
    realisations/    — réalisation images (admin uploads)
    solutions/       — Solutions detail pages
  videos/            — hero video, etc.
```

Job-application **CVs** stay in a **separate private** bucket, **`cvs`** — resumes must never be publicly downloadable. Both buckets are created automatically for the local stack from [`supabase/config.toml`](supabase/config.toml); in a remote/prod project create them once (see [Supabase setup](#supabase-setup-one-time)).

The shared, secret-free helper is [`frontend/src/lib/media.ts`](frontend/src/lib/media.ts).

### How images resolve (dev ↔ prod)

The DB stores a **storage key** (e.g. `photos/realisations/bar-lounge-1.jpg`), never a full URL. `mediaUrl()` builds the public URL from the **current environment's** `NEXT_PUBLIC_SUPABASE_URL` at render time — so a réalisation added in dev shows dev images and in prod shows prod images, with no environment baked into the data.

### Réalisation uploads (admin)

Each picture added in `/admin` is compressed to JPEG and uploaded straight from the browser to `photos/realisations/`, **named after the project + a picture number** — e.g. project "Bar lounge — hôtellerie" → `bar-lounge-hotellerie-1.jpg`, `-2.jpg`, … *(Enter the project name first: the upload button is disabled until you do, so files are named correctly.)*

### Marketing-section photos (placeholder → real)

Section images (À-propos, Solutions, Materials, Installations…) fall back to a [picsum](https://picsum.photos) **placeholder** until a real photo exists in the matching folder. To replace one:

1. Upload the photo to the right folder, **named after its seed** — e.g. `photos/a-propos/ecl-about-atelier-large.jpg`. Seeds live in [`frontend/src/content/*.ts`](frontend/src/content/) (and [`APropos.tsx`](frontend/src/components/sections/APropos.tsx)); the seed→folder mapping is in [`frontend/src/content/image.ts`](frontend/src/content/image.ts).
2. Refresh the manifest of available photos:
   ```bash
   cd frontend
   npm run media:manifest      # re-lists the bucket → src/content/media-manifest.ts
   ```
3. That image now loads from Supabase; everything un-photographed stays on its placeholder.

### Syncing static assets to a bucket

The static assets (logo, hero video, Savoir-Faire photos) + demo réalisation images live in `frontend/public`. Upload them to the **current environment's** bucket — and regenerate the manifest — with:

```bash
cd frontend
npm run media:sync          # uploads static assets + demo images to the bucket
```

This only **uploads** files; it doesn't touch the manifest. Run `npm run media:manifest` separately when you add real **section** photos (above). `media:sync` reads `.env.local`/`.env` like the app, so it targets **local** by default. To populate **prod**, run it with the prod credentials in the env:

```bash
SUPABASE_URL="https://<ref>.supabase.co" SUPABASE_SECRET_KEY="sb_secret_…" npm run media:sync
```

> On Vercel the manifest is regenerated against the prod bucket at build time (part of `vercel-build`). Run `media:sync` against prod **once** (and again whenever the static assets change) so the logo/video/section photos exist there.

---

## Deploy to Vercel

The app lives in the `frontend/` subdirectory, so the important setting is the **root directory**.

1. **Project Settings → General**
   - **Root Directory = `frontend`**
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: leave default — Vercel runs the `vercel-build` script (`prisma generate && prisma migrate deploy && prisma db seed && gen-media-manifest && next build`). `migrate deploy` applies new migrations and the manifest step lists the prod bucket's photos, both at build time (the DB must be baselined first, see above).
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
| `MAIL_TO` | `delivered@resend.dev` (Resend test inbox) | the real company inbox — `et.arsenault2000@gmail.com` for now |
| `RESEND_WEBHOOK_SECRET` | optional | recommended (verifies webhook calls) |

> ⚠️ **Resend delivery rule:** without a **verified sending domain**, Resend only delivers to your **own Resend account email**. So until a domain is verified, keep `MAIL_FROM=…<onboarding@resend.dev>` and set `MAIL_TO` to the Resend account's email (currently `et.arsenault2000@gmail.com`). To send to any other inbox, verify a domain in Resend and point `MAIL_FROM` at it. (Sending to `delivered@resend.dev` always works — but it's a test sink, not a real inbox.)

Webhook endpoint: `POST /api/webhooks/resend` (logs delivery events; verifies the Svix signature when `RESEND_WEBHOOK_SECRET` is set).

---

## Monitoring (Sentry)

Errors are reported to **Sentry** ([`frontend/sentry.server.config.ts`](frontend/sentry.server.config.ts), [`frontend/sentry.edge.config.ts`](frontend/sentry.edge.config.ts), [`frontend/src/instrumentation-client.ts`](frontend/src/instrumentation-client.ts)). Optionally set `SENTRY_AUTH_TOKEN` in the build env to upload source maps. A Sentry→Discord relay lives at `POST /api/monitoring/discord` (set `DISCORD_MONITORING_WEBHOOK_URL` + `SENTRY_DISCORD_RELAY_SECRET`).

---

## Troubleshooting

- **`P3005` on deploy / "database schema is not empty"** — baseline the existing migrations (see Supabase setup, step 2) before `migrate deploy` runs.
- **Admin login fails** — confirm the user exists in **Supabase → Authentication → Users** and is **confirmed**; that `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set; and that the email isn't excluded by `ADMIN_EMAILS`. "Email logins are disabled" → enable the Email provider (sign-*in*) while keeping sign-*up* off.
- **CV/image upload fails** — confirm the `cvs` (private) and `christian-alain` (public) buckets exist and `SUPABASE_SECRET_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set.
- **Images 404 locally** — the local `christian-alain` bucket is empty; run `npm run media:sync` to upload them.
- **Emails not arriving** — `RESEND_API_KEY` unset disables email. In dev, mail goes to `delivered@resend.dev` (a Resend test inbox); confirm in the Resend dashboard.
