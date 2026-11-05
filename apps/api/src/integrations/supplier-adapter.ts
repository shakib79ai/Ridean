import type { BookingStatus, GeoPoint, Passenger, QuoteSearchRequest, ServiceKey, Vehicle } from '@ridean/shared';
import type { SupplierRow } from '../db/schema';
import type { HttpClient } from './http-client';

export type SupplierMode = 'live' | 'sandbox' | 'mock';

export interface AdapterContext {
  supplier: SupplierRow;
  /** SUPPLIER_<CODE>_* environment variables, e.g. { BASE_URL, API_KEY } */
  credentials: Record<string, string>;
  mode: SupplierMode;
  http: HttpClient;
  currency: string;
}

/** One bookable option returned by a supplier, priced in the supplier's terms (net or gross). */
export interface SupplierOffer {
  offerId: string;
  vehicle: Vehicle;
  /** Minor units */
  price: number;
  currency: string;
  etaMinutes?: number;
  durationMinutes?: number;
  distanceKm?: number;
  cancellation: string;
  inclusions: string[];
  /** Anything the adapter needs again at booking time (fare id, rate key, session token…) */
  meta?: Record<string, unknown>;
}

export interface SupplierBookingInput {
  offerId: string;
  offerMeta: Record<string, unknown>;
  request: QuoteSearchRequest;
  passenger: Passenger;
  flightNumber?: string;
  notes?: string;
  ourReference: string;
  /** Price we expect to pay (net or gross), used to detect supplier price changes */
  expectedPrice: number;
  currency: string;
}

export interface SupplierBookingResult {
  supplierReference: string;
  status: Extract<BookingStatus, 'confirmed' | 'pending_payment' | 'driver_assigned'>;
  /** Final supplier price if it differs from the quote */
  finalPrice?: number;
  /** For supplier_collects suppliers that host their own card page */
  paymentUrl?: string;
  meta?: Record<string, unknown>;
}

export interface SupplierStatusResult {
  status: BookingStatus;
  driver?: { name?: string; phone?: string; vehicle?: string; plate?: string; rating?: number; location?: GeoPoint };
  etaMinutes?: number;
  meta?: Record<string, unknown>;
}

/**
 * Contract every supplier integration implements. Add a new supplier by writing a class that
 * implements this interface and registering it in IntegrationsModule (see docs/SUPPLIER_INTEGRATION.md).
 */
export interface SupplierAdapter {
  /** Registry key stored in suppliers.adapter */
  readonly key: string;
  /** Services this adapter can serve; the supplier row narrows this further */
  readonly supports: ServiceKey[];
  search(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]>;
  book(input: SupplierBookingInput, ctx: AdapterContext): Promise<SupplierBookingResult>;
  cancel(supplierReference: string, ctx: AdapterContext): Promise<{ cancelled: boolean; fee?: number }>;
  status?(supplierReference: string, ctx: AdapterContext): Promise<SupplierStatusResult>;
  /** Change time, flight, passengers or notes on an existing booking (route changes need a new booking). */
  amend?(supplierReference: string, changes: SupplierAmendment, ctx: AdapterContext): Promise<{ amended: boolean; finalPrice?: number }>;
  /** Relay a customer message to the chauffeur. */
  message?(supplierReference: string, body: string, ctx: AdapterContext): Promise<{ delivered: boolean }>;
  /** Whether message() is available for this supplier in the current mode. */
  supportsMessaging?(ctx: AdapterContext): boolean;
}

export interface SupplierAmendment {
  pickupAt?: string;
  flightNumber?: string;
  passengers?: number;
  luggage?: number;
  notes?: string;
  passenger?: Partial<Passenger>;
}

export class SupplierError extends Error {
  constructor(
    public readonly supplier: string,
    message: string,
    public readonly retryable = false,
    public readonly cause?: unknown,
  ) {
    super(`[${supplier}] ${message}`);
  }
}
