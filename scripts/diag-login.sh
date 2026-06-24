#!/usr/bin/env bash
# Diagnose admin login: hit the API directly, inspect the seeded user + CORS.
set -u
cd "/mnt/c/GNA/christian-lemelin" 2>/dev/null || true

echo "=== waiting for backend /health ==="
for i in $(seq 1 60); do
  c=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo 000)
  if [ "$c" = "200" ]; then echo "backend READY (after ${i} tries)"; break; fi
  sleep 2
done

echo "=== POST /auth/login  (admin / password) ==="
curl -s -o /tmp/login.out -w "HTTP %{http_code}\n" \
  -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  http://localhost:3001/auth/login
echo "body: $(cat /tmp/login.out)"
echo

echo "=== preflight (browser CORS) from origin http://localhost:3000 ==="
curl -s -o /dev/null -D - -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  http://localhost:3001/auth/login | grep -i -E "HTTP/|access-control" || echo "(no CORS headers returned)"
echo

echo "=== preflight from an ALT localhost port (simulates npm run dev) ==="
curl -s -o /dev/null -D - -X OPTIONS \
  -H "Origin: http://localhost:3007" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  http://localhost:3001/auth/login | grep -i -E "HTTP/|access-control-allow-origin" || echo "(no CORS headers)"
echo

echo "=== applied migrations (proves migrate deploy, not db push) ==="
docker compose exec -T db psql -U app -d app -c "select migration_name from _prisma_migrations order by finished_at;" 2>/dev/null

echo "=== admin_users row ==="
docker compose exec -T db psql -U app -d app -c "select username, left(password_hash,7) as hash, created_at from admin_users;" 2>/dev/null

echo "=== backend env ==="
docker compose exec -T backend printenv CORS_ORIGIN NODE_ENV 2>/dev/null
