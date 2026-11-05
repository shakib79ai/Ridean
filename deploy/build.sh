#!/usr/bin/env bash
# Build everything for a VPS deployment (PM2 + Nginx). Run from the repo root after `git pull`.
# Requires apps/{website,pwa,admin}/.env.production (NEXT_PUBLIC_* values) and apps/api/.env.
set -euo pipefail
cd "$(dirname "$0")/.."

npm ci
npm run build:shared
npm run build -w @ridean/api
(cd apps/api && node dist/db/migrate.js)

for app in website pwa admin; do
  npm run build -w "@ridean/$app"
  # Next standalone output does not include static assets — copy them next to server.js
  out="apps/$app/.next/standalone/apps/$app"
  rm -rf "$out/.next/static" "$out/public"
  mkdir -p "$out/.next"
  cp -r "apps/$app/.next/static" "$out/.next/static"
  [ -d "apps/$app/public" ] && cp -r "apps/$app/public" "$out/public"
done

pm2 startOrReload deploy/ecosystem.config.js
pm2 save
echo "Deployed. Check: pm2 status && curl -s localhost:4000/health"
