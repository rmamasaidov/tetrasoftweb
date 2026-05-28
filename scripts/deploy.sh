#!/usr/bin/env bash
# scripts/deploy.sh — server-side deploy entrypoint.
#
# Invoked by:
#   1. GitHub Actions over SSH (forced via authorized_keys `command=`)
#   2. The operator manually: `./scripts/deploy.sh`
#
# Steps: fetch latest main, fast-forward, rebuild changed images,
# bring the stack up, wait for backend /api/health, prune dangling images.
# Exits non-zero on any failure so Actions surfaces it.

set -euo pipefail

REPO_DIR="/home/tetrasoft/tetrasoft-website"
BRANCH="main"
HEALTH_URL="http://127.0.0.1/api/health"
HEALTH_TIMEOUT=60

cd "$REPO_DIR"

echo "[deploy] $(date -Is) starting"
echo "[deploy] current HEAD: $(git rev-parse --short HEAD)"

git fetch --quiet origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")
if [ "$LOCAL" = "$REMOTE" ]; then
  echo "[deploy] already at origin/$BRANCH, nothing to pull"
else
  echo "[deploy] fast-forwarding $LOCAL -> $REMOTE"
  git merge --ff-only "origin/$BRANCH"
fi

echo "[deploy] building images"
docker compose build --pull

echo "[deploy] bringing stack up"
docker compose up -d --remove-orphans

echo "[deploy] waiting for backend health (max ${HEALTH_TIMEOUT}s)"
deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
until curl -fsS "$HEALTH_URL" >/dev/null 2>&1; do
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "[deploy] FAILED: backend did not become healthy in ${HEALTH_TIMEOUT}s"
    docker compose ps
    docker compose logs --tail 40 backend
    exit 1
  fi
  sleep 2
done

echo "[deploy] pruning dangling images"
docker image prune -f >/dev/null

echo "[deploy] $(date -Is) done — HEAD now $(git rev-parse --short HEAD)"
