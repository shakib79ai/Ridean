# Supplier integration

Every third-party provider is reached through an **adapter** in `apps/api/src/integrations`. The rest of the platform (quotes, checkout, bookings, ledger, reports, all four apps) only sees the common `SupplierAdapter` contract, so connecting a supplier never changes app code.

```ts
interface SupplierAdapter {
  readonly key: string;                       // stored in suppliers.adapter
  readonly supports: ServiceKey[];
  search(req: QuoteSearchRequest, ctx): Promise<SupplierOffer[]>;
  book(input: SupplierBookingInput, ctx): Promise<SupplierBookingResult>;
  cancel(supplierReference: string, ctx): Promise<{ cancelled: boolean; fee?: number }>;
  status?(supplierReference: string, ctx): Promise<SupplierStatusResult>;
}
```

`ctx` carries the supplier row (terms + `config`), its credentials, the mode and an HTTP client with timeout and retries.

## Modes

`SUPPLIER_MODE` on the API:

| Mode | Behaviour |
|---|---|
| `mock` | Deterministic sample offers for every supplier — no network calls. Development and demos only; **refused when `NODE_ENV=production`** |
| `sandbox` | Real calls to each partner's test environment (point `SUPPLIER_<CODE>_BASE_URL` at it) |
| `live` | Real calls to production endpoints |

In `sandbox`/`live`, a supplier without its required credentials is reported as *not configured* and skipped by the quote fan-out — it can never serve sample offers to a paying customer.

## Credentials

Credentials live only in the API's environment, never in the database:

```
SUPPLIER_<CODE>_BASE_URL=https://api.partner.com
SUPPLIER_<CODE>_API_KEY=...
SUPPLIER_<CODE>_<ANY_OTHER>=...      # e.g. PARTNER_ID, API_SECRET, REF_ID
```

`<CODE>` is the supplier's code in upper case (`curb` → `SUPPLIER_CURB_API_KEY`). All `SUPPLIER_<CODE>_*` variables are passed to the adapter as `ctx.credentials`.

## Built-in adapters

| Adapter | Services | Notes |
|---|---|---|
| `curb` | Ride Now | Estimates → ride request; status for driver details |
| `sixt` | Rent a car | Offers → reservation; maps SIXT vehicle groups to Ridean classes |
| `hertz` | Rent a car | Rates → reservation |
| `priceline` | Rent a car, Airport transfer | Cars and transfers search/book |
| `mozio` | Airport transfer, Hourly | Async search with polling, then reservation |
| `generic_http` | Any service | Config-driven JSON contract for local chauffeur companies and new partners — no code needed |

The request/response mapping for the named partners follows their public API shapes, but **endpoint paths and field names must be confirmed against each partner's documentation** when you receive API access. Every place to check is marked `TODO(partner-docs)`:

```bash
grep -rn "TODO(partner-docs)" apps/api/src/integrations
```

## Connecting a supplier (checklist)

1. Sign the contract; agree **rate type** (net or gross + commission %), **payment flow** and **settlement cycle**.
2. Get sandbox credentials; set `SUPPLIER_<CODE>_*` on the API and `SUPPLIER_MODE=sandbox` on staging.
3. In **Admin → Supplier accounts**, create or edit the supplier: adapter, services, commercial terms, markup.
4. Confirm the `TODO(partner-docs)` paths/fields in its adapter; run a search and a booking/cancel cycle on staging.
5. Check the booking and ledger in Admin (transaction report, supplier ledger).
6. Switch to production credentials and `SUPPLIER_MODE=live`.

## Onboarding a partner with no code (`generic_http`)

Create the supplier in the admin with adapter `generic_http`, choose its services, and optionally set its config:

```json
{
  "searchPath": "/v1/quotes",
  "bookPath": "/v1/bookings",
  "cancelPath": "/v1/bookings/{ref}/cancel",
  "authHeader": "Authorization",
  "authScheme": "Bearer"
}
```

The partner implements three endpoints:

**`POST {searchPath}`** — body is Ridean's `QuoteSearchRequest` (see `packages/shared/src/types.ts`). Response:

```json
{ "offers": [ { "id": "off_123", "vehicleClass": "business", "vehicleName": "Mercedes E-Class",
                "passengers": 3, "bags": 2, "price": 84.50, "currency": "USD",
                "etaMinutes": 12, "cancellation": "Free cancellation up to 24 hours before pickup",
                "inclusions": ["Meet & greet", "60 min free waiting"], "meta": {} } ] }
```

`price` is in major units (or send `priceMinor` in cents). It is interpreted as net or gross according to the supplier's terms.

**`POST {bookPath}`** — body `{ offerId, offerMeta, request, passenger, flightNumber, notes, ourReference, expectedPrice, currency }` (sent with an `Idempotency-Key: <ourReference>` header). Response `{ "reference": "PARTNER-REF", "status": "confirmed" }` — optional `price` (final price, major units), `paymentUrl` (hosted card page for supplier-collects partners) and `status: "pending_payment" | "driver_assigned"`.

**`POST {cancelPath}`** (`{ref}` replaced by the partner reference). Response `{ "cancelled": true, "fee": 0 }`.

## Writing a new adapter

1. Create `apps/api/src/integrations/adapters/<name>.adapter.ts`:

```ts
@Injectable()
export class AcmeAdapter extends BaseSupplierAdapter {
  readonly key = 'acme';
  readonly supports = ['airport_transfer'];
  protected requiredCredentials = ['BASE_URL', 'API_KEY'];

  protected async liveSearch(req, ctx) {
    const res = await ctx.http.request({ method: 'POST', url: `${ctx.credentials.BASE_URL}/quotes`, headers: { 'X-Api-Key': ctx.credentials.API_KEY }, body: { /* map req */ } });
    const data = this.ensureOk(ctx.supplier.code, res, 'search');
    return data.results.map((r) => ({ offerId: r.id, vehicle: { class: 'sedan', name: r.car, passengers: 3, bags: 2 }, price: Math.round(r.amount * 100), currency: r.currency, cancellation: r.policy, inclusions: [] }));
  }
  protected async liveBook(input, ctx) { /* ... */ return { supplierReference: '...', status: 'confirmed' }; }
  protected async liveCancel(ref, ctx) { /* ... */ return { cancelled: true }; }
}
```

2. Add it to the providers and the `register` loop in `integrations.module.ts`.
3. Create the supplier in the admin with `adapter = "acme"`.

`BaseSupplierAdapter` gives you mock mode, credential checks, error wrapping (`SupplierError`, retryable flag) and price-change detection for free.

## Adding a new service

Example: a "Coach / minibus" service.

1. `packages/shared/src/services.ts` — add `'coach'` to `SERVICE_KEYS` and a `SERVICES.coach` entry (label, slug `coach`, tagline, `fields` it needs, `supportsNow`). Optionally add hero copy and an image for it in `HERO` in `apps/website/src/app/[service]/page.tsx` (otherwise the tagline and the default hero are used).
2. `apps/mobile/lib/api/models.dart` — add a matching `ServiceDef` line.
3. In the admin, tick the new service on the suppliers that provide it (or create a `generic_http` supplier).
4. Deploy. The website gets `/coach`, the PWA `/book/coach`, the app a tile; quotes, checkout, reports and the ledger work automatically.

If the service needs a new search field, add it to `QuoteSearchRequest`, render it in `packages/web-core/src/BookingSearch.tsx` (and the Flutter `search_screen.dart`), and map it in the adapters that need it.
