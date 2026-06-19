#!/usr/bin/env bash
# Submit a test job application, then show where it landed in the DB.
set -u
cd "/mnt/c/GNA/Christian Lemelin/christian-lemelin" 2>/dev/null || true

echo "=== POST /applications (test submission, no CV) ==="
curl -s -o /tmp/apply.out -w "HTTP %{http_code}\n" \
  -F "name=Test Applicant" \
  -F "email=test@example.com" \
  -F "phone=418-555-0000" \
  -F "message=This is a test application." \
  http://localhost:3001/applications
echo "response: $(cat /tmp/apply.out)"
echo

echo "=== applications table ==="
docker compose exec -T db psql -U app -d app -c \
  "select name, email, phone, cv_path, created_at from applications order by created_at desc limit 5;"
