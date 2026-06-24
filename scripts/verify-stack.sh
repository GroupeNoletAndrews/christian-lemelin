#!/usr/bin/env bash
# Wait for the backend to be healthy, then report endpoint status + seed counts.
set -u
cd "/mnt/c/GNA/christian-lemelin" 2>/dev/null || true

echo "=== compose ps ==="
docker compose ps 2>/dev/null || true

echo "=== waiting for backend /health ==="
for i in $(seq 1 60); do
  c=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo 000)
  if [ "$c" = "200" ]; then echo "backend READY (after ${i} tries)"; break; fi
  sleep 2
done

echo "=== endpoint status ==="
curl -s -o /dev/null -w "health=%{http_code}\n" http://localhost:3001/health
curl -s -o /dev/null -w "jobs=%{http_code}\n" http://localhost:3001/jobs
curl -s -o /dev/null -w "realisations=%{http_code}\n" http://localhost:3001/realisations
curl -s -o /dev/null -w "frontend_home=%{http_code}\n" http://localhost:3000/

echo "=== seed counts ==="
echo "jobs items:         $(curl -s http://localhost:3001/jobs | grep -o '"id"' | wc -l)"
echo "realisations items: $(curl -s http://localhost:3001/realisations | grep -o '"id"' | wc -l)"
