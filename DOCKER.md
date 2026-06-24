# Local stack — Docker (frontend + backend + Postgres)

Three services, wired end to end:

```
Browser ─▶ frontend (Next.js, :3000) ─▶ backend (NestJS + Prisma, :3001) ─▶ db (Postgres, :5432)
```

- **frontend** — the Next.js app in `frontend/`, built as a standalone image.
- **backend** — `backend/` NestJS REST API using **Prisma** over Postgres, JWT auth (bcryptjs).
- **db** — plain `postgres:16-alpine`.

> **This file covers the local Docker setup.** For the full dev-vs-prod guide
> (Supabase in prod, env vars, deployment), see **[README.md](README.md)**.
>
> **Prod note:** Supabase is managed Postgres. In prod, point the backend's
> `DATABASE_URL` at the Supabase connection string (append `?sslmode=require`)
> and use `docker-compose.prod.yml`. No code changes between local and prod.

---

## 0. One-time: install Docker Engine via WSL2 (no Docker Desktop)

Docker Engine has no native Windows build, so it runs inside WSL2.

```powershell
# In an ADMIN PowerShell — installs WSL2 + Ubuntu (may require a reboot,
# and Ubuntu's first launch asks you to create a UNIX user/password):
wsl --install -d Ubuntu
```

Then, **inside the Ubuntu (WSL) shell**, from the repo:

```bash
cd /mnt/c/GNA/christian-lemelin
bash scripts/setup-docker-wsl.sh   # installs docker.io + compose v2, enables systemd
```

After it finishes, from PowerShell run `wsl --shutdown`, reopen WSL, then verify:

```bash
docker run --rm hello-world
docker compose version
```

---

## 1. Run the stack

From **inside WSL**, in the repo directory:

```bash
docker compose up --build        # from the repo root
```

- Frontend: <http://localhost:3000>
- Backend:  <http://localhost:3001>  (e.g. `GET /jobs`)
- Postgres: `localhost:5432`  (user/pass/db default `app`/`app`/`app`)

On first start the backend applies migrations (`prisma migrate deploy`) and
seeds an admin plus demo jobs/réalisations.

Stop / reset:

```bash
docker compose down              # stop (keeps data)
docker compose down -v           # stop and WIPE the database volume
```

## 2. Admin login

`/admin` → **admin / password** (override via `SEED_ADMIN_*` in `.env`).

## 3. Configuration

Copy `.env.example` to `.env` to override defaults (Postgres creds, `JWT_SECRET`,
`NEXT_PUBLIC_API_URL`, seed creds). Defaults are dev-safe, so `.env` is optional.

`NEXT_PUBLIC_API_URL` is **baked into the frontend image at build time** (the
browser calls it), so changing it requires `docker compose up --build`.

## 4. End-to-end tests (Playwright)

With the stack running:

```bash
cd frontend                       # Playwright + e2e/ live in the frontend package
npx playwright install chromium   # one-time, downloads the browser
npm run test:e2e                  # smoke every route + admin flows
```

Tests hit `http://localhost:3000`. Override with `E2E_BASE_URL`.

## 5. Backend without Docker (optional)

```bash
cd backend
cp .env.example .env              # point DATABASE_URL at any Postgres
npm install
npm run migrate:deploy            # apply migrations (create schema)
npm run build && npm run seed     # seed demo data
npm run start:dev                 # http://localhost:3001
```
