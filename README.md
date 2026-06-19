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

If the Supabase database already contains these tables (not created by this app), baseline it once so `migrate deploy` won't try to recreate them:

```bash
cd backend
DATABASE_URL="<supabase-url>" npx prisma migrate resolve --applied 20260618000000_init
```

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

## Troubleshooting

- **Admin login says "Identifiants invalides" / "Impossible de joindre le serveur"** — the second message means the frontend can't reach the backend API. Confirm the backend is up (`curl http://localhost:3001/health`) and that `NEXT_PUBLIC_API_URL` is correct.
- **`docker: command not found`** — you're in a Windows shell. Run inside WSL (`wsl -d Ubuntu`).
- **`Catastrophic failure` / `Wsl/Service/E_UNEXPECTED`** — reset WSL: `wsl --shutdown`, then retry.
- **`Cannot connect to the Docker daemon`** — systemd starts it a few seconds after the distro boots; otherwise `sudo service docker start`.
- More WSL/Docker setup detail: **[DOCKER.md](DOCKER.md)**.
