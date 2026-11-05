# Ridean

Premium mobility platform — **Ride Now, Airport transfer, Rent a car, Hourly chauffeur and Luxury chauffeur** — sold to customers under one brand and fulfilled by third-party supplier APIs (Curb, SIXT, Hertz, Priceline, Mozio, local chauffeur partners, and any you add later).

| App | Path | Stack | Port |
|---|---|---|---|
| API | `apps/api` | NestJS 11 · Drizzle ORM · PostgreSQL · Stripe | 4000 |
| Website | `apps/website` | Next.js 16 (App Router) | 3000 |
| PWA | `apps/pwa` | Next.js 16, installable, offline shell | 3001 |
| Admin | `apps/admin` | Next.js 16 — operations & finance | 3002 |
| Mobile | `apps/mobile` | Flutter (iOS + Android) | — |

Shared code: `packages/shared` (types, pricing engine, service catalogue, typed API client) and `packages/web-core` (booking search, quotes, checkout, account UI and styles used by the website and PWA).

## Quick start (local)

Requirements: Node 22 (`.nvmrc`), PostgreSQL 16 (or Docker).

```bash
npm install
cp apps/api/.env.example apps/api/.env            # defaults: mock suppliers + simulated payments
cp apps/website/.env.example apps/website/.env.local
cp apps/pwa/.env.example apps/pwa/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# database (or: docker compose up -d db)
createdb ridean
npm run build:shared && npm run build -w @ridean/api
npm run db:migrate && npm run db:seed              # seeds 6 suppliers + the ADMIN_EMAIL user

npm run dev:api        # http://localhost:4000  (Swagger: /docs)
npm run dev:website    # http://localhost:3000
npm run dev:pwa        # http://localhost:3001
npm run dev:admin      # http://localhost:3002  (sign in with ADMIN_EMAIL / ADMIN_PASSWORD)
```

With `SUPPLIER_MODE=mock` every supplier returns realistic sample offers and `PAYMENTS_MODE=simulated` confirms bookings without Stripe, so the whole flow — search → quotes → checkout → booking → admin reports — works before any contract or key is in place.

Or run everything in containers: `docker compose up --build`.

## Commands

| Command | What it does |
|---|---|
| `npm run typecheck` | Type-checks every workspace |
| `npm test` | Pricing-engine and quote-service tests |
| `npm run build` | Builds shared, API, website, PWA and admin |
| `npm run db:migrate` / `db:seed` | Apply migrations / seed suppliers and the admin user |
| `npm run db:generate -w @ridean/api` | Generate a migration after editing `apps/api/src/db/schema.ts` |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — services, booking & payment flow, money model, ledger
- [Supplier integration](docs/SUPPLIER_INTEGRATION.md) — connecting a supplier API, adding a new service
- [Deployment](docs/DEPLOYMENT.md) — VPS (PM2 + Nginx), Docker, Stripe webhooks, mobile releases, go-live checklist
- [Mobile app](apps/mobile/README.md)

## Before go-live

Supplier adapters for Curb, SIXT, Hertz, Priceline and Mozio contain the full request/response mapping, but the exact endpoint paths and field names must be confirmed against each partner's API documentation once you have signed contracts — they are marked `TODO(partner-docs)` in `apps/api/src/integrations/adapters`. See the go-live checklist in [DEPLOYMENT.md](docs/DEPLOYMENT.md#go-live-checklist).
