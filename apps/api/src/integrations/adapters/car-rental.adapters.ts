import { Injectable } from '@nestjs/common';
import type { QuoteSearchRequest } from '@ridean/shared';
import { BaseSupplierAdapter } from '../base-adapter';
import type { AdapterContext, SupplierBookingInput, SupplierBookingResult, SupplierOffer } from '../supplier-adapter';

/**
 * Shared shape for car-rental partners (SIXT, Hertz, Priceline cars). Each partner subclass only
 * declares its endpoints, auth headers and response mapping. Paths are placeholders until the
 * partner API docs are available — see docs/SUPPLIER_INTEGRATION.md.
 */
abstract class CarRentalAdapter extends BaseSupplierAdapter {
  protected abstract paths: { search: string; book: string; cancel: string };
  protected abstract authHeaders(ctx: AdapterContext): Record<string, string>;
  protected partnerParams(_ctx: AdapterContext): Record<string, string> {
    return {};
  }

  protected async liveSearch(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]> {
    const res = await ctx.http.request<{ offers: RentalOffer[] }>({
      method: 'POST',
      url: ctx.credentials.BASE_URL + this.paths.search,
      headers: this.authHeaders(ctx),
      body: {
        ...this.partnerParams(ctx),
        pickupLocation: req.pickup.iata ?? req.pickup.address,
        returnLocation: (req.returnLocation ?? req.pickup).iata ?? (req.returnLocation ?? req.pickup).address,
        pickupDateTime: req.rentalPickupAt,
        returnDateTime: req.rentalReturnAt,
        vehicleClass: req.vehicleClass,
        currency: req.currency ?? ctx.currency,
      },
      retries: 1,
    });
    const data = this.ensureOk(this.key, res, 'rental search');
    return (data.offers ?? []).map((o) => ({
      offerId: o.offerId,
      vehicle: { class: mapRentalClass(o.acriss ?? o.category), name: o.vehicleName, passengers: o.seats ?? 5, bags: o.bags ?? 2, imageUrl: o.imageUrl },
      price: this.toMinor(o.totalPrice),
      currency: o.currency ?? ctx.currency,
      cancellation: o.freeCancellation ? 'Free cancellation up to 48 hours before pick-up' : 'Non-refundable rate',
      inclusions: o.inclusions ?? ['Unlimited miles'],
      meta: { rateKey: o.rateKey ?? o.offerId },
    }));
  }

  protected async liveBook(input: SupplierBookingInput, ctx: AdapterContext): Promise<SupplierBookingResult> {
    const res = await ctx.http.request<{ confirmationNumber: string; totalPrice?: number }>({
      method: 'POST',
      url: ctx.credentials.BASE_URL + this.paths.book,
      headers: { ...this.authHeaders(ctx), 'Idempotency-Key': input.ourReference },
      body: {
        ...this.partnerParams(ctx),
        rateKey: input.offerMeta.rateKey ?? input.offerId,
        partnerReference: input.ourReference,
        driver: { firstName: input.passenger.firstName, lastName: input.passenger.lastName, email: input.passenger.email, phone: input.passenger.phone },
        flightNumber: input.flightNumber,
      },
    });
    const data = this.ensureOk(this.key, res, 'rental booking');
    return { supplierReference: data.confirmationNumber, status: 'confirmed', finalPrice: data.totalPrice !== undefined ? this.toMinor(data.totalPrice) : undefined };
  }

  protected async liveCancel(ref: string, ctx: AdapterContext) {
    const res = await ctx.http.request<{ cancelled?: boolean; fee?: number }>({
      method: 'POST',
      url: ctx.credentials.BASE_URL + this.paths.cancel.replace('{ref}', encodeURIComponent(ref)),
      headers: this.authHeaders(ctx),
      body: this.partnerParams(ctx),
    });
    const data = this.ensureOk(this.key, res, 'rental cancel');
    return { cancelled: data.cancelled !== false, fee: data.fee ? this.toMinor(data.fee) : 0 };
  }
}

@Injectable()
export class SixtAdapter extends CarRentalAdapter {
  readonly key = 'sixt';
  readonly supports = ['rent'];
  protected readonly requiredCredentials = ['BASE_URL', 'API_KEY', 'PARTNER_ID'];
  protected paths = { search: '/v1/offers', book: '/v1/reservations', cancel: '/v1/reservations/{ref}/cancel' }; // TODO(partner-docs): SIXT B2P docs
  protected authHeaders(ctx: AdapterContext) {
    return { Authorization: `Bearer ${ctx.credentials.API_KEY}` };
  }
  protected partnerParams(ctx: AdapterContext) {
    return { partnerId: ctx.credentials.PARTNER_ID };
  }
}

@Injectable()
export class HertzAdapter extends CarRentalAdapter {
  readonly key = 'hertz';
  readonly supports = ['rent'];
  protected readonly requiredCredentials = ['BASE_URL', 'API_KEY', 'PARTNER_ID'];
  protected paths = { search: '/rates/search', book: '/reservations', cancel: '/reservations/{ref}/cancel' }; // TODO(partner-docs): Hertz affiliate docs
  protected authHeaders(ctx: AdapterContext) {
    return { 'x-api-key': ctx.credentials.API_KEY };
  }
  protected partnerParams(ctx: AdapterContext) {
    return { affiliateId: ctx.credentials.PARTNER_ID };
  }
}

/** Priceline supplies both rental cars and airport transfers; transfers go through the same partner key. */
@Injectable()
export class PricelineAdapter extends CarRentalAdapter {
  readonly key = 'priceline';
  readonly supports = ['rent', 'airport_transfer'];
  protected readonly requiredCredentials = ['BASE_URL', 'API_KEY', 'REF_ID'];
  protected paths = { search: '/v2/cars/search', book: '/v2/cars/book', cancel: '/v2/cars/cancel/{ref}' }; // TODO(partner-docs): Priceline Partner Network docs
  protected authHeaders(ctx: AdapterContext) {
    return { Authorization: `Bearer ${ctx.credentials.API_KEY}` };
  }
  protected partnerParams(ctx: AdapterContext) {
    return { refid: ctx.credentials.REF_ID };
  }

  protected async liveSearch(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]> {
    if (req.service !== 'airport_transfer') return super.liveSearch(req, ctx);
    const res = await ctx.http.request<{ results: { id: string; vehicle: string; seats: number; bags: number; price: number; currency?: string }[] }>({
      method: 'POST',
      url: `${ctx.credentials.BASE_URL}/v2/transfers/search`, // TODO(partner-docs): Priceline transfers docs
      headers: this.authHeaders(ctx),
      body: { refid: ctx.credentials.REF_ID, from: req.pickup, to: req.dropoff, pickupDateTime: req.pickupAt, passengers: req.passengers ?? 1, luggage: req.luggage ?? 1 },
      retries: 1,
    });
    const data = this.ensureOk(this.key, res, 'transfer search');
    return (data.results ?? []).map((r) => ({
      offerId: r.id,
      vehicle: { class: 'sedan', name: r.vehicle, passengers: r.seats, bags: r.bags },
      price: this.toMinor(r.price),
      currency: r.currency ?? ctx.currency,
      cancellation: 'Free cancellation up to 24 hours before pickup',
      inclusions: ['Meet & greet', 'Flight tracking'],
      meta: { rateKey: r.id, kind: 'transfer' },
    }));
  }
}

interface RentalOffer {
  offerId: string;
  rateKey?: string;
  vehicleName: string;
  acriss?: string;
  category?: string;
  seats?: number;
  bags?: number;
  imageUrl?: string;
  totalPrice: number;
  currency?: string;
  freeCancellation?: boolean;
  inclusions?: string[];
}

/** Maps ACRISS codes / partner categories to Ridean's vehicle classes. */
export function mapRentalClass(code?: string): string {
  const c = (code ?? '').toUpperCase();
  if (/^[FL]/.test(c) || c.includes('LUX') || c.includes('PREMIUM')) return 'business';
  if (/^[PU]/.test(c)) return 'black';
  if (c.includes('SUV') || /^.F/.test(c) || /^S/.test(c)) return 'xl';
  if (/^[IJ]/.test(c)) return 'extra_comfort';
  return 'sedan';
}
