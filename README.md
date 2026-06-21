# Entreprises Christian Lemelin

Marketing site + admin dashboard for managing **emplois** (jobs) and **réalisations** (projects).

## Architecture

Three services, wired end to end:

```
Browser ─▶ frontend (Next.js 16, :3000) ─▶ backend (NestJS + Prisma, :3001) ─▶ Postgres
```

- **frontend** — Next.js app at the repo root. Talks to the backend over HTTP using `NEXT_PUBLIC_API_URL`.
- **backend** — `backend/` NestJS REST API (Prisma ORM, JWT auth with bcryptjs). Modules: `auth`, `jobs`, `realisations`, `applications`, `contact`, `health`.
- **database** — **local Postgres** (Docker) in dev, **Supabase** (managed Postgres) in prod. The backend selects between them purely via `DATABASE_URL` — no code changes.

The admin login lives in the DB (`admin_users`, bcryptjs-hashed). Default seeded credentials: **`admin` / `password`**.

Réalisations have an **admin-controlled display order** (reorder with the arrows in the dashboard; persisted via `PATCH /realisations/reorder`) that's respected everywhere. On `/realisations` the first one is shown as a large **featured** project; clicking another features it, and home-page cards deep-link to it via `?featured=<id>`.

---

## Prerequisites

- **Docker Engine** (via WSL2 on Windows — no Docker Desktop needed). One-time setup is in **[DOCKER.md](DOCKER.md)**.
- Node.js 20+ (only needed for the hot-reload dev option and running tests).

> On Windows, run all `docker`/`docker compose` commands **inside WSL** (`wsl -d Ubuntu`), from the repo directory. Docker does not exist on the Windows side.

---

## Development

### Option A — full stack in Docker (simplest)

```bash
# inside WSL, in the repo directory
docker compose up --build          # or: npm run docker:up
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:3001 (`/health`, `/jobs`, `/realisations`)
- Postgres → localhost:5432  (user/pass/db: `app`/`app`/`app`)
- Admin → http://localhost:3000/admin — **admin / password**

On first boot the backend applies migrations (`prisma migrate deploy`) and seeds the admin user + demo jobs/réalisations. Stop with `docker compose down` (add `-v` to wipe the database).

### Option B — frontend hot-reload

Run the DB + backend in Docker, the frontend on the host (fast refresh):

```bash
docker compose up -d db backend    # inside WSL — starts ONLY db + backend
npm install                        # once
npm run dev                        # http://localhost:3000
```

The dev frontend calls the backend at `http://localhost:3001` (override with `NEXT_PUBLIC_API_URL` in `.env.local`). In dev the backend's CORS accepts **any localhost port**, so this works even if Next picks a different port.

> Don't run the Docker `frontend` service at the same time as `npm run dev` — they'd both want port 3000. Option B starts only `db` + `backend`.

### Configuration (dev)

Defaults are dev-safe, so `.env` is optional. To override, copy `.env.example` → `.env`. Backend-only vars: `backend/.env.example`.

### Tests (Playwright E2E)

With the stack running (Option A):

```bash
npx playwright install chromium    # one-time
npm run test:e2e                   # 17 tests: every route + admin flows
```

### Viewing the database (Adminer)

The dev stack includes **[Adminer](https://www.adminer.org/)**, a lightweight web DB client, at **http://localhost:8080** (it starts with `docker compose up`). Log in with:

| Field | Value |
|---|---|
| System | PostgreSQL |
| Server | `db` |
| Username / Password | `app` / `app` |
| Database | `app` |

Adminer runs inside the compose network and connects to the `db` service directly, so it works on any host OS with no Postgres client or port-forwarding setup. It's **dev-only** — not included in `docker-compose.prod.yml`.

---

## Production (Supabase database)

In prod there is **no local Postgres** — the backend points at **Supabase**. Frontend + backend run as containers (or deploy them separately; see below).

### 1. Configure

```bash
cp .env.prod.example .env.prod     # then fill in real values
```

Set in `.env.prod`:

| Var | Value |
|---|---|
| `DATABASE_URL` | Supabase connection string (Project → Settings → Database). **Include `?sslmode=require`.** |
| `JWT_SECRET` | a long random string |
| `CORS_ORIGIN` | your frontend's public origin(s), comma-separated |
| `NEXT_PUBLIC_API_URL` | the public URL the browser uses to reach the backend |
| `SEED_ADMIN_PASSWORD` | a strong admin password |

### 2. Deploy (single host, via compose)

> ⚠️ If your Supabase database is **not empty** (a reused project, or tables left by a prior `db push`), baseline it first — see "Pointing at an existing Supabase DB" below — otherwise `migrate deploy` fails with `P3005` and the backend container crash-loops. A brand-new/empty Supabase project needs no baselining.

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

On first start the backend runs `prisma migrate deploy` against Supabase (creating the tables) and seeds **only the admin user** (`SEED_DEMO_DATA=false` — no demo content). CORS stays strict because `CORS_ALLOW_LOCALHOST` is left unset in prod — only the `CORS_ORIGIN` allowlist is accepted. (`NODE_ENV` does not affect CORS; the container runs `production` in dev too.)

### 2b. Deploy frontend/backend separately (e.g. Vercel + a Node host)

- **Frontend**: build with `NEXT_PUBLIC_API_URL` set to the public backend URL (it's baked at build time).
- **Backend**: run the `backend/` image with `DATABASE_URL` (Supabase), `JWT_SECRET`, `CORS_ORIGIN` (the frontend origin), `SEED_DEMO_DATA=false`, and **leave `CORS_ALLOW_LOCALHOST` unset** (this is what keeps CORS locked to `CORS_ORIGIN`).

### Pointing at an existing Supabase DB

If the Supabase database already has this app's tables — a reused project, or because you applied schema changes **by hand** in the Supabase SQL editor — baseline each migration whose schema is already present, once, so `migrate deploy` won't try to recreate it (which fails with `P3005`):

```bash
cd backend
DATABASE_URL="<supabase-url>" npx prisma migrate resolve --applied 20260618000000_init
DATABASE_URL="<supabase-url>" npx prisma migrate resolve --applied 20260619000000_realisation_position
```

The migrations live in `backend/prisma/migrations/` — baseline whichever ones already exist in your Supabase DB. (Example: if you hand-ran the `position`-column SQL, baseline `20260619000000_realisation_position`.)

---

## Dev vs prod at a glance

| | Dev | Prod |
|---|---|---|
| Database | Local Postgres (Docker `db`) | **Supabase** (managed) |
| Compose file | `docker-compose.yml` | `docker-compose.prod.yml` |
| `DATABASE_URL` | `postgresql://app:app@db:5432/app` | Supabase string (`?sslmode=require`) |
| CORS | any `localhost:*` allowed | strict (`CORS_ORIGIN` only) |
| Seed | admin + demo content | admin only (`SEED_DEMO_DATA=false`) |
| Schema | `prisma migrate deploy` (auto) | `prisma migrate deploy` (auto) |
| Email (Resend) | test addresses (`onboarding@`/`delivered@resend.dev`) | verified-domain sender → real company inbox |

---

## Changing the database schema

1. Edit `backend/prisma/schema.prisma`.
2. With the dev DB running, create a migration:
   ```bash
   cd backend
   DATABASE_URL="postgresql://app:app@localhost:5432/app" npm run migrate:dev -- --name your_change
   ```
3. Commit the generated folder under `backend/prisma/migrations/`. Both dev and prod apply it automatically via `migrate deploy` on the next deploy.

---

## Email notifications (Resend)

Both public forms — **« Nous joindre »** ([`ContactForm`](src/components/sections/ContactForm.tsx)) and the **job application** modal ([`ApplyModal`](src/components/emplois/ApplyModal.tsx)) — still save to the database as before, and now **also email a notification to the company** via [Resend](https://resend.com). The email is rendered to match the site's OPUS design (cream/white card, hairline rows, the single blue accent on the reply button); the application email attaches the uploaded CV when present. The submitter's address is set as `Reply-To`, so the company can reply straight from its inbox.

All of this lives in the backend ([`backend/src/mail/`](backend/src/mail/)) so the API key never reaches the browser. Sending is **best-effort** — if Resend is down or unconfigured, the form still succeeds (the data is persisted) and the failure is logged.

### Configuration

Like CORS and seeding, the dev/prod split is driven by **env vars**, not `NODE_ENV`:

| Var | Dev default | Prod |
|---|---|---|
| `RESEND_API_KEY` | — (put it in `.env`) | your Resend key |
| `MAIL_FROM` | `Entreprises Christian Lemelin <onboarding@resend.dev>` (Resend's shared sender — **no domain verification needed**) | an address on a domain you've **verified** in Resend |
| `MAIL_TO` | `delivered@resend.dev` ([Resend test inbox](https://resend.com/docs/dashboard/emails/send-test-emails)) | the real company address |
| `RESEND_WEBHOOK_SECRET` | optional | recommended (verifies webhook calls) |

If `RESEND_API_KEY` is unset, email is simply disabled (a warning is logged at startup).

### Dev / testing

1. Put your key in the gitignored root `.env` (read by docker-compose):
   ```
   RESEND_API_KEY=re_...
   ```
2. Start the stack (`docker compose up`). With only the key set, `MAIL_FROM`/`MAIL_TO` fall back to the **Resend test addresses** above — no domain to verify.
3. Submit either form. Per Resend's [test-email guide](https://resend.com/docs/dashboard/emails/send-test-emails), `delivered@resend.dev` always simulates a successful delivery; swap `MAIL_TO` to `bounced@resend.dev` / `complained@resend.dev` to exercise those paths. Test sends appear in your Resend dashboard and count against quota.

### Webhooks (delivery events)

`POST /webhooks/resend` receives Resend events (`email.sent` / `delivered` / `bounced` / `opened` …) and logs them. To try it locally (per the [webhooks intro](https://resend.com/docs/webhooks/introduction)), expose the backend with a tunnel and register the URL in the Resend dashboard:

```bash
# e.g. ngrok, the Resend CLI, or VS Code port forwarding
ngrok http 3001
# then add https://<tunnel>/webhooks/resend in Resend → Webhooks
```

Set `RESEND_WEBHOOK_SECRET` (the endpoint's **Signing secret** in the dashboard) to enforce Svix signature verification; without it, calls are accepted unsigned (fine for local testing).

### Going to production

1. **Verify your sending domain** in the Resend dashboard and set `MAIL_FROM` to an address on it (`onboarding@resend.dev` is dev-only).
2. Set `MAIL_TO` to the real company inbox — the placeholder in `.env.prod.example` is a **dummy**; replace it.
3. Provide `RESEND_API_KEY` (and ideally `RESEND_WEBHOOK_SECRET`) in `.env.prod`. The prod compose requires the key, sender, and recipient (fails fast if missing).

> 🔐 Treat the API key like any secret — it lives only in gitignored `.env`/`.env.prod`. If a key has ever been shared in plaintext (chat, a ticket, a commit), **rotate it** in the Resend dashboard.

---

## Troubleshooting

- **Admin login says "Identifiants invalides" / "Impossible de joindre le serveur"** — the second message means the frontend can't reach the backend API. Confirm the backend is up (`curl http://localhost:3001/health`) and that `NEXT_PUBLIC_API_URL` is correct.
- **`docker: command not found`** — you're in a Windows shell. Run inside WSL (`wsl -d Ubuntu`).
- **`Catastrophic failure` / `Wsl/Service/E_UNEXPECTED`** — reset WSL: `wsl --shutdown`, then retry.
- **`Cannot connect to the Docker daemon`** — systemd starts it a few seconds after the distro boots; otherwise `sudo service docker start`.
- **Form notification emails aren't arriving** — check the backend logs. `RESEND_API_KEY is not set` means email is disabled (set it in `.env`). In dev, mail goes to `delivered@resend.dev` (a Resend **test inbox**, not a real address) — confirm the send in the Resend dashboard, not your own inbox. In prod, a `403`/domain error means `MAIL_FROM` is on an unverified domain.
- More WSL/Docker setup detail: **[DOCKER.md](DOCKER.md)**.
