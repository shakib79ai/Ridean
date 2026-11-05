# Deployment

Four Node services and one database:

| Service | Suggested domain | Port | Build output |
|---|---|---|---|
| API | `api.ridean.com` | 4000 | `apps/api/dist` |
| Website | `ridean.com` | 3000 | Next standalone |
| PWA | `app.ridean.com` | 3001 | Next standalone |
| Admin | `admin.ridean.com` | 3002 | Next standalone |
| PostgreSQL 16 | private | 5432 | managed DB recommended |

Two supported routes: **A. VPS with PM2 + Nginx** or **B. Docker / Docker Compose** (any container host). The Flutter app is released to the stores separately (section C).

## Environment variables

### API (`apps/api/.env`) — full list in `apps/api/.env.example`

| Variable | Production value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgres://user:pass@host:5432/ridean` (use `?sslmode=require` for managed DBs) |
| `JWT_SECRET` | 32+ random characters (`openssl rand -hex 32`) — enforced in production |
| `CORS_ORIGINS` | `https://ridean.com,https://www.ridean.com,https://app.ridean.com,https://admin.ridean.com` |
| `PAYMENTS_MODE` | `stripe` (`simulated` is refused in production) |
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from the webhook endpoint below |
| `SUPPLIER_MODE` | `live` (`mock` is refused in production) |
| `SUPPLIER_<CODE>_*` | each supplier's base URL and keys — see [SUPPLIER_INTEGRATION.md](SUPPLIER_INTEGRATION.md#credentials) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin account, used once by `db:seed` |

### Web apps — build-time (`NEXT_PUBLIC_*` are inlined at build, rebuild after changing)

| Variable | website | pwa | admin |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` = `https://api.ridean.com` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_…` | ✓ | ✓ | |
| `NEXT_PUBLIC_SITE_URL` = `https://ridean.com` (Open Graph URLs) | ✓ | | |

Put them in `apps/<app>/.env.production` on the build machine (never commit it).

## A. VPS (Ubuntu 22.04/24.04) with PM2 + Nginx

```bash
# 1. System packages
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx postgresql-16 certbot python3-certbot-nginx
sudo npm i -g pm2

# 2. Database (skip if you use a managed DB)
sudo -u postgres psql -c "CREATE USER ridean WITH PASSWORD 'strong-password';"
sudo -u postgres psql -c "CREATE DATABASE ridean OWNER ridean;"

# 3. Code and configuration
git clone https://github.com/shakib79ai/Ridean.git /srv/ridean && cd /srv/ridean
cp apps/api/.env.example apps/api/.env               # fill in production values
printf 'NEXT_PUBLIC_API_URL=https://api.ridean.com\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx\nNEXT_PUBLIC_SITE_URL=https://ridean.com\n' > apps/website/.env.production
printf 'NEXT_PUBLIC_API_URL=https://api.ridean.com\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx\n' > apps/pwa/.env.production
printf 'NEXT_PUBLIC_API_URL=https://api.ridean.com\n' > apps/admin/.env.production

# 4. Build, migrate, start (re-run this for every release)
./deploy/build.sh
(cd apps/api && node dist/db/seed.js)                 # first deploy only: suppliers + admin user
pm2 startup                                           # start PM2 on boot

# 5. Nginx + TLS
sudo cp deploy/nginx.conf /etc/nginx/sites-available/ridean
sudo ln -s /etc/nginx/sites-available/ridean /etc/nginx/sites-enabled/ridean
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ridean.com -d www.ridean.com -d app.ridean.com -d admin.ridean.com -d api.ridean.com
```

`deploy/build.sh` installs dependencies, builds every app, applies database migrations, copies Next static assets into the standalone folders and reloads PM2 (`deploy/ecosystem.config.js`). Logs: `pm2 logs ridean-api`.

## B. Docker

Each app has a Dockerfile; build from the repository root:

```bash
docker build -f apps/api/Dockerfile -t ridean-api .
docker build -f apps/website/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.ridean.com --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx -t ridean-website .
docker build -f apps/pwa/Dockerfile     --build-arg NEXT_PUBLIC_API_URL=https://api.ridean.com --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx -t ridean-pwa .
docker build -f apps/admin/Dockerfile   --build-arg NEXT_PUBLIC_API_URL=https://api.ridean.com -t ridean-admin .
```

The API container runs migrations on start, then the server. Seed once: `docker run --rm --env-file apps/api/.env ridean-api node dist/db/seed.js`.

For a single server, `docker compose up -d --build` starts Postgres, API, website, PWA and admin (see `docker-compose.yml`). It defaults the API to `NODE_ENV=development` so it runs with mock suppliers and simulated payments out of the box; for production set `API_NODE_ENV=production`, `PUBLIC_API_URL`, `STRIPE_PUBLISHABLE_KEY` in the shell or a root `.env`, and production values in `apps/api/.env`, and put Nginx/Caddy with TLS in front.

These images also run on managed platforms (Render, Railway, Fly.io, AWS ECS/App Runner, Google Cloud Run, DigitalOcean App Platform). The web apps are also Vercel-compatible: set the project root to `apps/<app>`, and the API URL / Stripe key as environment variables.

## Stripe

1. Dashboard → Developers → API keys: copy the secret key (API) and publishable key (web apps, mobile).
2. Dashboard → Developers → Webhooks → **Add endpoint** `https://api.ridean.com/webhooks/stripe` with events:
   - `payment_intent.amount_capturable_updated` (booking authorised → book with supplier and capture)
   - `payment_intent.payment_failed`
   - `payment_intent.succeeded` (wallet top-ups)

   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Enable Apple Pay / Google Pay in Stripe → Payment methods; verify your domains for Apple Pay on the web.
4. Test locally with the Stripe CLI: `stripe listen --forward-to localhost:4000/webhooks/stripe` and `PAYMENTS_MODE=stripe` with test keys.

Bookings are **authorised, not charged**, until the supplier confirms; if a supplier rejects the booking the authorisation is released automatically.

## C. Mobile app

See [apps/mobile/README.md](../apps/mobile/README.md). In short: `flutter create .` once to generate the platform folders, then

```bash
flutter build appbundle --dart-define=API_URL=https://api.ridean.com --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_xxx   # Google Play
flutter build ipa       --dart-define=API_URL=https://api.ridean.com --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_xxx   # App Store
```

## Operations

- **Health:** `GET https://api.ridean.com/health` → `{ "ok": true }`.
- **API docs:** Swagger UI at `/docs` (restrict it at the proxy in production if you prefer).
- **Migrations:** applied by `deploy/build.sh` / the API container. After schema changes: `npm run db:generate -w @ridean/api`, commit the new file in `apps/api/drizzle/`.
- **Backups:** daily `pg_dump` (or the managed DB's point-in-time recovery). The ledger and bookings are the financial record.
- **Staff accounts:** `UPDATE users SET role = 'ops' | 'finance' | 'admin' WHERE email = '…';`
- **Admin access:** consider restricting `admin.ridean.com` to office/VPN IPs (commented example in `deploy/nginx.conf`).

## Go-live checklist

- [ ] Supplier contracts signed; commercial terms entered in **Admin → Supplier accounts**
- [ ] Every `TODO(partner-docs)` in `apps/api/src/integrations/adapters` confirmed against partner docs and tested in `SUPPLIER_MODE=sandbox`
- [ ] Production supplier credentials set (`SUPPLIER_<CODE>_*`), `SUPPLIER_MODE=live`
- [ ] `PAYMENTS_MODE=stripe` with live keys; webhook endpoint created and `STRIPE_WEBHOOK_SECRET` set; one real low-value booking and refund tested end-to-end
- [ ] Strong `JWT_SECRET`; `CORS_ORIGINS` lists only your domains
- [ ] Admin password changed after first sign-in; staff roles assigned
- [ ] Database backups scheduled; TLS on every domain
- [ ] Legal page (`apps/website/src/app/legal`) replaced with counsel-approved terms and privacy policy
- [ ] Contact emails in `apps/website/src/app/contact` and footer address updated
- [ ] Mobile: bundle IDs, icons, Apple Pay merchant ID, store listings
