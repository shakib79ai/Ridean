import { Injectable } from '@nestjs/common';
import type { QuoteSearchRequest } from '@ridean/shared';
import { BaseSupplierAdapter } from '../base-adapter';
import type { AdapterContext, SupplierBookingInput, SupplierBookingResult, SupplierOffer, SupplierStatusResult } from '../supplier-adapter';

/**
 * Curb — Ride Now in NYC (yellow, green and FHV), on demand.
 * Curb charges the rider on its own merchant account (payment flow: supplier_collects),
 * so Ridean earns commission + markup and invoices Curb monthly.
 *
 * Endpoint paths below are placeholders. Replace them with the paths in Curb's partner
 * API documentation once the agreement is signed; the request/response mapping is isolated here.
 */
@Injectable()
export class CurbAdapter extends BaseSupplierAdapter {
  readonly key = 'curb';
  readonly supports = ['ride_now'];
  protected readonly requiredCredentials = ['BASE_URL', 'API_KEY', 'API_SECRET'];

  private headers(ctx: AdapterContext) {
    return { 'X-Api-Key': ctx.credentials.API_KEY, 'X-Api-Secret': ctx.credentials.API_SECRET };
  }

  protected async liveSearch(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]> {
    const res = await ctx.http.request<{ estimates: CurbEstimate[] }>({
      method: 'POST',
      url: `${ctx.credentials.BASE_URL}/v1/estimates`, // TODO(partner-docs): confirm with Curb API docs
      headers: this.headers(ctx),
      body: {
        pickup: { lat: req.pickup.lat, lng: req.pickup.lng, address: req.pickup.address },
        dropoff: req.dropoff && { lat: req.dropoff.lat, lng: req.dropoff.lng, address: req.dropoff.address },
        passengers: req.passengers ?? 1,
      },
      retries: 1,
    });
    const data = this.ensureOk(this.key, res, 'estimates');
    return (data.estimates ?? []).map((e) => ({
      offerId: e.estimate_id,
      vehicle: { class: e.vehicle_type === 'fhv' ? 'sedan' : 'sedan', name: e.display_name ?? 'Taxi', passengers: e.capacity ?? 4, bags: 2 },
      price: this.toMinor(e.fare_estimate),
      currency: e.currency ?? ctx.currency,
      etaMinutes: e.eta_minutes,
      distanceKm: e.distance_km,
      durationMinutes: e.duration_minutes,
      cancellation: 'Free cancellation until a driver is assigned',
      inclusions: ['Upfront price', 'Licensed NYC driver'],
      meta: { estimateId: e.estimate_id, vehicleType: e.vehicle_type },
    }));
  }

  protected async liveBook(input: SupplierBookingInput, ctx: AdapterContext): Promise<SupplierBookingResult> {
    const res = await ctx.http.request<{ ride_id: string; status: string; payment_url?: string; fare?: number }>({
      method: 'POST',
      url: `${ctx.credentials.BASE_URL}/v1/rides`, // TODO(partner-docs): confirm with Curb API docs
      headers: { ...this.headers(ctx), 'Idempotency-Key': input.ourReference },
      body: {
        estimate_id: input.offerMeta.estimateId ?? input.offerId,
        partner_reference: input.ourReference,
        rider: { name: `${input.passenger.firstName} ${input.passenger.lastName}`, phone: input.passenger.phone, email: input.passenger.email },
        notes: input.notes,
      },
    });
    const data = this.ensureOk(this.key, res, 'book ride');
    return {
      supplierReference: data.ride_id,
      status: data.status === 'driver_assigned' ? 'driver_assigned' : data.payment_url ? 'pending_payment' : 'confirmed',
      paymentUrl: data.payment_url,
      finalPrice: data.fare !== undefined ? this.toMinor(data.fare) : undefined,
    };
  }

  protected async liveCancel(ref: string, ctx: AdapterContext) {
    const res = await ctx.http.request<{ cancelled: boolean; fee?: number }>({
      method: 'POST',
      url: `${ctx.credentials.BASE_URL}/v1/rides/${encodeURIComponent(ref)}/cancel`,
      headers: this.headers(ctx),
    });
    const data = this.ensureOk(this.key, res, 'cancel ride');
    return { cancelled: !!data.cancelled, fee: data.fee ? this.toMinor(data.fee) : 0 };
  }

  protected async liveStatus(ref: string, ctx: AdapterContext): Promise<SupplierStatusResult> {
    const res = await ctx.http.request<{ status: string; driver?: { name: string; phone: string; medallion?: string; lat?: number; lng?: number } }>({
      url: `${ctx.credentials.BASE_URL}/v1/rides/${encodeURIComponent(ref)}`,
      headers: this.headers(ctx),
      retries: 1,
    });
    const data = this.ensureOk(this.key, res, 'ride status');
    const map: Record<string, SupplierStatusResult['status']> = { searching: 'confirmed', assigned: 'driver_assigned', on_trip: 'in_progress', completed: 'completed', cancelled: 'cancelled' };
    return {
      status: map[data.status] ?? 'confirmed',
      driver: data.driver && { name: data.driver.name, phone: data.driver.phone, plate: data.driver.medallion, location: data.driver.lat ? { address: '', lat: data.driver.lat, lng: data.driver.lng } : undefined },
    };
  }
}

interface CurbEstimate {
  estimate_id: string;
  vehicle_type: 'yellow' | 'green' | 'fhv';
  display_name?: string;
  capacity?: number;
  fare_estimate: number;
  currency?: string;
  eta_minutes?: number;
  distance_km?: number;
  duration_minutes?: number;
}
