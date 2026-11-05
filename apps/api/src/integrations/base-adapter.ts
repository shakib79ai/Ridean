import { randomUUID } from 'crypto';
import type { QuoteSearchRequest, ServiceKey } from '@ridean/shared';
import { mockOffers } from './mock-offers';
import {
  AdapterContext,
  SupplierAdapter,
  SupplierBookingInput,
  SupplierBookingResult,
  SupplierError,
  SupplierOffer,
  SupplierAmendment,
  SupplierStatusResult,
} from './supplier-adapter';

const MOCK_DRIVERS = [
  { name: 'James Mitchell', vehicle: 'Black Mercedes E-Class', plate: 'LX24 RDN', rating: 4.97 },
  { name: 'Amara Okafor', vehicle: 'Black BMW 5 Series', plate: 'T 7841 NY', rating: 4.95 },
  { name: 'Luis Ortega', vehicle: 'Black Cadillac Escalade', plate: 'T 2290 NY', rating: 4.92 },
];

/** Sample chauffeur details for SUPPLIER_MODE=mock, stable per booking reference. */
function mockStatus(ref: string): SupplierStatusResult {
  const i = [...ref].reduce((a, c) => a + c.charCodeAt(0), 0) % MOCK_DRIVERS.length;
  return { status: 'driver_assigned', driver: { ...MOCK_DRIVERS[i], phone: '+1 212 555 0100' }, etaMinutes: 12 };
}

/**
 * Base class for HTTP suppliers. Subclasses implement the `live*` methods that map Ridean's
 * request/booking shapes to the supplier's API. When the platform runs with SUPPLIER_MODE=mock the
 * base class serves deterministic sample offers so every app works end-to-end before contracts and
 * credentials are in place.
 */
export abstract class BaseSupplierAdapter implements SupplierAdapter {
  abstract readonly key: string;
  abstract readonly supports: ServiceKey[];
  /** Credential names that must be present for live calls, e.g. ['BASE_URL', 'API_KEY'] */
  protected readonly requiredCredentials: string[] = ['BASE_URL', 'API_KEY'];

  protected abstract liveSearch(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]>;
  protected abstract liveBook(input: SupplierBookingInput, ctx: AdapterContext): Promise<SupplierBookingResult>;
  protected abstract liveCancel(ref: string, ctx: AdapterContext): Promise<{ cancelled: boolean; fee?: number }>;
  protected liveStatus?(ref: string, ctx: AdapterContext): Promise<SupplierStatusResult>;
  /** Implement when the partner API supports changing a booking. */
  protected liveAmend?(ref: string, changes: SupplierAmendment, ctx: AdapterContext): Promise<{ amended: boolean; finalPrice?: number }>;
  /** Implement when the partner API can relay messages to the chauffeur. */
  protected liveMessage?(ref: string, body: string, ctx: AdapterContext): Promise<{ delivered: boolean }>;

  /**
   * Mock offers are served only when SUPPLIER_MODE=mock. In live/sandbox mode a supplier with
   * missing credentials is reported as not configured (and skipped by the quote fan-out) — it must
   * never produce sample offers that a customer could book and pay for.
   */
  protected useMock(ctx: AdapterContext): boolean {
    if (ctx.mode === 'mock') return true;
    const missing = this.requiredCredentials.filter((k) => !ctx.credentials[k]);
    if (missing.length) {
      const env = missing.map((k) => `SUPPLIER_${ctx.supplier.code.toUpperCase()}_${k}`).join(', ');
      throw new SupplierError(ctx.supplier.code, `Supplier not configured: set ${env}`, false);
    }
    return false;
  }

  async search(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]> {
    if (this.useMock(ctx)) return mockOffers(ctx.supplier.code, req, ctx.currency);
    try {
      return await this.liveSearch(req, ctx);
    } catch (e) {
      throw e instanceof SupplierError ? e : new SupplierError(ctx.supplier.code, `Search failed: ${(e as Error).message}`, true, e);
    }
  }

  async book(input: SupplierBookingInput, ctx: AdapterContext): Promise<SupplierBookingResult> {
    if (this.useMock(ctx)) {
      return { supplierReference: `${ctx.supplier.code.toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`, status: 'confirmed', meta: { mock: true } };
    }
    try {
      return await this.liveBook(input, ctx);
    } catch (e) {
      throw e instanceof SupplierError ? e : new SupplierError(ctx.supplier.code, `Booking failed: ${(e as Error).message}`, false, e);
    }
  }

  async cancel(ref: string, ctx: AdapterContext): Promise<{ cancelled: boolean; fee?: number }> {
    if (this.useMock(ctx)) return { cancelled: true, fee: 0 };
    return this.liveCancel(ref, ctx);
  }

  async status(ref: string, ctx: AdapterContext): Promise<SupplierStatusResult> {
    if (this.useMock(ctx)) return mockStatus(ref);
    if (!this.liveStatus) return { status: 'confirmed' };
    return this.liveStatus(ref, ctx);
  }

  async amend(ref: string, changes: SupplierAmendment, ctx: AdapterContext): Promise<{ amended: boolean; finalPrice?: number }> {
    if (this.useMock(ctx)) return { amended: true };
    if (!this.liveAmend) throw new SupplierError(ctx.supplier.code, 'This partner does not accept online changes — cancel and rebook, or contact support', false);
    return this.liveAmend(ref, changes, ctx);
  }

  supportsMessaging(ctx: AdapterContext): boolean {
    return ctx.mode === 'mock' || !!this.liveMessage;
  }

  async message(ref: string, body: string, ctx: AdapterContext): Promise<{ delivered: boolean }> {
    if (this.useMock(ctx)) return { delivered: true };
    if (!this.liveMessage) return { delivered: false };
    return this.liveMessage(ref, body, ctx);
  }

  /** Helper: throws a SupplierError for non-2xx responses. */
  protected ensureOk<T>(supplier: string, res: { status: number; data: T }, action: string): T {
    if (res.status < 200 || res.status >= 300) {
      const msg = typeof res.data === 'object' && res.data && 'message' in res.data ? String((res.data as { message: unknown }).message) : `HTTP ${res.status}`;
      throw new SupplierError(supplier, `${action}: ${msg}`, res.status >= 500 || res.status === 429);
    }
    return res.data;
  }

  protected toMinor(major: number | string | undefined): number {
    const n = typeof major === 'string' ? parseFloat(major) : major ?? 0;
    return Math.round(n * 100);
  }
}
