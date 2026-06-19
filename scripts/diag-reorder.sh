#!/usr/bin/env bash
# Verify the réalisation ordering feature: migration applied, positions backfilled,
# and the reorder endpoint actually changes the order end to end.
set -u
cd "/mnt/c/GNA/Christian Lemelin/christian-lemelin" 2>/dev/null || true

for i in $(seq 1 60); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health)" = "200" ] && break
  sleep 2
done

echo "=== applied migrations ==="
docker compose exec -T db psql -U app -d app -c \
  "select migration_name from _prisma_migrations order by finished_at;"

echo "=== réalisations BEFORE (position, name) ==="
docker compose exec -T db psql -U app -d app -c \
  "select position, name from realisations order by position;"

echo "=== login + reorder (reverse the order) ==="
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  http://localhost:3001/auth/login | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
IDS=$(curl -s http://localhost:3001/realisations | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//')
REV=$(echo "$IDS" | tac | sed 's/.*/"&"/' | paste -sd, -)
curl -s -o /dev/null -w "reorder HTTP %{http_code}\n" \
  -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d "{\"ids\":[$REV]}" \
  http://localhost:3001/realisations/reorder

echo "=== réalisations AFTER (position, name) — should be reversed ==="
docker compose exec -T db psql -U app -d app -c \
  "select position, name from realisations order by position;"
