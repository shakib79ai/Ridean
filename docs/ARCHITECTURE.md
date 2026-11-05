# Architecture

```
                ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
 customers ───▶ │   Website    │  │     PWA      │  │ Flutter app  │  │    Admin     │ ◀─── ops / finance
                │  Next.js     │  │  Next.js     │  │ iOS/Android  │  │  Next.js     │
                └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                       └──────── REST + JWT (packages/shared RideanApi) ─────┘
                                           │
                                  ┌────────▼────────┐        ┌──────────────┐
                                  │   Ridean API    │◀──────▶│  PostgreSQL  │
                                  │    NestJS       │        └──────────────┘
                                  └───┬─────────┬───┘
                     Stripe (payments, │         │ Supplier adapters (fan-out)
                     webhooks)  ◀──────┘         └──▶ Curb · SIXT · Hertz · Priceline · Mozio · generic_http partners
```

## Repository layout

| Path | Purpose |
|---|---|
| `packages/shared` | Service catalogue (`services.ts`), domain types, **pricing engine** (`pricing.ts`), money helpers, design tokens and the typed REST client used by every web app |
| `packages/web-core` | React components shared by website and PWA: `BookingSearch`, `QuoteResults`, `Checkout`, account views, `ApiProvider`, styles |
| `apps/api` | NestJS API. `src/modules/*` feature modules, `src/integrations/*` supplier adapters, `src/db/*` Drizzle schema, migrations and seed |
| `apps/website` | Marketing site + booking flow (`/`, `/[service]`, `/quotes`, `/checkout/[id]`, `/bookings/[id]`, `/account`) |
| `apps/pwa` | Mobile-first installable app with bottom tabs (Home, Trips, Wallet, Account), manifest and service worker |
| `apps/admin` | Dashboard, bookings, transaction report, earnings, settlements, supplier accounts & ledger, users |
| `apps/mobile` | Flutter app using the same API |

## Services are data, not code

A service (`ride_now`, `airport_transfer`, `rent`, `hourly`, `luxury`) is a key in `SERVICES` (`packages/shared/src/services.ts`) with a label, slug and the form fields it needs. Suppliers declare which service keys they serve (`suppliers.services`). The quote engine fans out to every active supplier serving the requested key. Adding a service is therefore: add the definition, assign it to one or more suppliers in the admin — see [SUPPLIER_INTEGRATION.md](SUPPLIER_INTEGRATION.md#adding-a-new-service).

## Booking flow

1. **Search** — `POST /quotes/search`. `QuotesService` validates the request, selects active suppliers for the service, calls each adapter's `search()` in parallel (`Promise.allSettled`, per-supplier timeout). Each offer is priced with `priceQuote()` and stored in `quotes` with a TTL (`QUOTE_TTL_MINUTES`). Supplier failures are returned as `errors[]`, never as a failed search.
2. **Checkout** — `POST /bookings { quoteId, passenger, payWithWallet? }`.
   - **Ridean collects** (`corporate_card`, `ach_debit` suppliers): the API creates a Stripe PaymentIntent with **manual capture** (authorisation only) and returns its `clientSecret`. The client confirms it with Stripe Elements / PaymentSheet.
   - **Supplier collects** (`supplier_collects`): the booking is placed immediately; if the supplier returns a hosted `paymentUrl`, the client redirects there.
   - **Wallet**: balance is debited inside the same transaction.
3. **Authorised** — Stripe sends `payment_intent.amount_capturable_updated` to `POST /webhooks/stripe` (or the simulated provider fires immediately in development). `BookingsService.bookWithSupplier()` calls the adapter's `book()`:
   - success → capture the payment, mark `confirmed`, write ledger entries;
   - failure → cancel the authorisation (customer is never charged), mark `failed`.
4. **After booking** — customers can cancel (`POST /bookings/:id/cancel` → adapter `cancel()`, refund, reversing ledger entry). Ops can change status in the admin.

Webhook processing is idempotent: each Stripe event id is stored in `webhook_events`; if processing throws, the row is removed so Stripe's retry is processed again.

## Money model

All amounts are **integer minor units** (cents) in `DEFAULT_CURRENCY`.

Each supplier has commercial terms (`SupplierCommercialTerms`):

| Field | Meaning |
|---|---|
| `inventoryType` | `net` — supplier gives us a cost, we add markup. `gross` — supplier gives a retail price and pays us `commissionPct` of it |
| `markupType` / `markupValue` | `percent` of the supplier price, or a `fixed` amount in cents, added on top |
| `paymentFlow` | `corporate_card` / `ach_debit` — Ridean charges the customer and pays the supplier. `supplier_collects` — the supplier charges the customer and owes Ridean its earnings |
| `settlementCycle` | `per_booking`, `weekly`, `monthly` |

`priceQuote(supplierPrice, terms)` returns the full `PriceBreakdown`:

```
net:    customerPrice = supplierPrice + markup          earnings = markup                supplierPayable = supplierPrice
gross:  customerPrice = supplierPrice + markup          earnings = commission + markup   supplierPayable = supplierPrice − commission
owedToSupplier = supplierPayable   (Ridean collects)        owedToRidean = earnings   (supplier collects)
```

Every booking stores the full breakdown, so reports never recompute history after terms change.

## Supplier ledger

`ledger_entries` is a per-supplier double-column ledger:

- **debit** — increases what Ridean owes the supplier (a confirmed booking Ridean charged).
- **credit** — decreases it: a payment Ridean made, or an amount the supplier owes Ridean (earnings on a `supplier_collects` booking, or a refund reversal).
- **balance** = Σ debit − Σ credit. `> 0` Ridean owes the supplier; `< 0` the supplier owes Ridean.

Entries are written by `LedgerService` on confirmation, cancellation, recorded payments (`paid_to_supplier` / `received_from_supplier`) and manual adjustments. The admin **Settlements** page shows outstanding balances; **Supplier accounts → Ledger** shows the running balance; the **Transaction report** shows period debits/credits grouped by supplier (with a per-service breakdown) or by service (with a per-supplier breakdown).

## Auth and roles

JWT bearer tokens (`JWT_SECRET`, `JWT_EXPIRES_IN`). Roles: `customer`, `ops`, `finance`, `admin`.

| Area | ops | finance | admin |
|---|---|---|---|
| Dashboard, bookings, reports, users | ✓ | ✓ | ✓ |
| Change booking status | ✓ | ✓ | ✓ |
| Edit supplier terms | | ✓ | ✓ |
| Record payments / adjustments | | ✓ | ✓ |
| Create suppliers | | | ✓ |

`admin` passes every role check. Staff accounts are created by the seed (first admin) or by setting `users.role` in the database.

## Data model (PostgreSQL)

`users`, `addresses`, `suppliers` (code, adapter, services[], terms jsonb, config jsonb), `quotes`, `bookings` (full price breakdown, payment flow, supplier reference), `payments`, `ledger_entries`, `wallet_transactions`, `webhook_events`. Schema: `apps/api/src/db/schema.ts`; migrations: `apps/api/drizzle/`.
