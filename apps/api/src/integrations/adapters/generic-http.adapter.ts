import { Injectable } from '@nestjs/common';
import { SERVICE_KEYS, type QuoteSearchRequest } from '@ridean/shared';
import { BaseSupplierAdapter } from '../base-adapter';
import type { AdapterContext, SupplierBookingInput, SupplierBookingResult, SupplierOffer } from '../supplier-adapter';

/**
 * Generic adapter for partners that expose a simple JSON API (local chauffeur companies,
 * limo networks, new services added later). Endpoint paths come from suppliers.config:
 *
 *   { "searchPath": "/v1/quotes", "bookPath": "/v1/bookings", "cancelPath": "/v1/bookings/{ref}/cancel",
 *     "authHeader": "Authorization", "authScheme": "Bearer" }
 *
 * The partner receives Ridean's QuoteSearchRequest as-is and must answer with
 *   { offers: [{ id, vehicleClass, vehicleName, passengers, bags, price, currency, cancellation, inclusions }] }
 * so onboarding a new partner needs no code — only a supplier row and two env variables.
 */
@Injectable()
export class GenericHttpAdapter extends BaseSupplierAdapter {
  readonly key = 'generic_http';
  readonly supports = [...SERVICE_KEYS] as string[];

  private cfg(ctx: AdapterContext) {
    const c = ctx.supplier.config as Record<string, string | undefined>;
    return {
      searchPath: c.searchPath ?? '/v1/quotes',
      bookPath: c.bookPath ?? '/v1/bookings',
      cancelPath: c.cancelPath ?? '/v1/bookings/{ref}/cancel',
      authHeader: c.authHeader ?? 'Authorization',
      authScheme: c.authScheme ?? 'Bearer',
    };
  }

  private headers(ctx: AdapterContext) {
    const c = this.cfg(ctx);
    return { [c.authHeader]: c.authScheme ? `${c.authScheme} ${ctx.credentials.API_KEY}` : ctx.credentials.API_KEY };
  }

  protected async liveSearch(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]> {
    const res = await ctx.http.request<{ offers: GenericOffer[] }>({
      method: 'POST',
      url: ctx.credentials.BASE_URL + this.cfg(ctx).searchPath,
      headers: this.headers(ctx),
      body: req,
      retries: 1,
    });
    const data = this.ensureOk(ctx.supplier.code, res, 'search');
    return (data.offers ?? []).map((o) => ({
      offerId: o.id,
      vehicle: { class: o.vehicleClass ?? 'sedan', name: o.vehicleName, passengers: o.passengers ?? 3, bags: o.bags ?? 2, imageUrl: o.imageUrl },
      price: Math.round(o.priceMinor ?? o.price * 100),
      currency: o.currency ?? ctx.currency,
      etaMinutes: o.etaMinutes,
      durationMinutes: o.durationMinutes,
      cancellation: o.cancellation ?? 'Free cancellation up to 24 hours before pickup',
      inclusions: o.inclusions ?? [],
      meta: o.meta ?? {},
    }));
  }

  protected async liveBook(input: SupplierBookingInput, ctx: AdapterContext): Promise<SupplierBookingResult> {
    const res = await ctx.http.request<{ reference: string; status?: string; price?: number; paymentUrl?: string }>({
      method: 'POST',
      url: ctx.credentials.BASE_URL + this.cfg(ctx).bookPath,
      headers: { ...this.headers(ctx), 'Idempotency-Key': input.ourReference },
      body: input,
    });
    const data = this.ensureOk(ctx.supplier.code, res, 'book');
    return {
      supplierReference: data.reference,
      status: data.status === 'pending_payment' ? 'pending_payment' : data.status === 'driver_assigned' ? 'driver_assigned' : 'confirmed',
      finalPrice: data.price !== undefined ? Math.round(data.price * 100) : undefined,
      paymentUrl: data.paymentUrl,
    };
  }

  protected async liveCancel(ref: string, ctx: AdapterContext) {
    const res = await ctx.http.request<{ cancelled?: boolean; fee?: number }>({
      method: 'POST',
      url: ctx.credentials.BASE_URL + this.cfg(ctx).cancelPath.replace('{ref}', encodeURIComponent(ref)),
      headers: this.headers(ctx),
    });
    const data = this.ensureOk(ctx.supplier.code, res, 'cancel');
    return { cancelled: data.cancelled !== false, fee: data.fee ? Math.round(data.fee * 100) : 0 };
  }
}

interface GenericOffer {
  id: string;
  vehicleClass?: string;
  vehicleName: string;
  passengers?: number;
  bags?: number;
  imageUrl?: string;
  price: number;
  priceMinor?: number;
  currency?: string;
  etaMinutes?: number;
  durationMinutes?: number;
  cancellation?: string;
  inclusions?: string[];
  meta?: Record<string, unknown>;
}
