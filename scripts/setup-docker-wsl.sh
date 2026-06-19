#!/usr/bin/env bash
# Install Docker Engine inside a WSL2 Ubuntu distro — no Docker Desktop.
# Uses Ubuntu's own packages (docker.io + buildx + compose v2), which always
# match the installed release and ship an init script (no systemd required).
# Run inside WSL:  bash scripts/setup-docker-wsl.sh   (uses sudo if not root)
set -euo pipefail

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi
export DEBIAN_FRONTEND=noninteractive

echo "==> apt-get update"
$SUDO apt-get update -y

echo "==> Installing docker.io + docker-buildx + docker-compose-v2"
$SUDO apt-get install -y docker.io docker-buildx docker-compose-v2

# Let the invoking (non-root) user run docker without sudo.
TARGET_USER="${SUDO_USER:-${USER:-}}"
if [ -n "$TARGET_USER" ] && [ "$TARGET_USER" != "root" ]; then
  $SUDO usermod -aG docker "$TARGET_USER" || true
fi

echo "==> Enabling systemd so Docker starts automatically in every WSL session"
if ! grep -q "systemd=true" /etc/wsl.conf 2>/dev/null; then
  printf '[boot]\nsystemd=true\n' | $SUDO tee /etc/wsl.conf >/dev/null
fi

echo "==> Starting the Docker daemon for this session"
$SUDO service docker start || true
for _ in $(seq 1 30); do
  if $SUDO docker info >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Versions"
$SUDO docker --version || true
$SUDO docker compose version || true

echo
echo "==> Done. Now run 'wsl --shutdown' from Windows and reopen WSL so systemd"
echo "    takes over and Docker starts automatically. Verify: docker run --rm hello-world"
