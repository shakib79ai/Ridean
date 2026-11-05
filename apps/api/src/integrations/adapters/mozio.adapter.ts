import { Injectable } from '@nestjs/common';
import type { QuoteSearchRequest } from '@ridean/shared';
import { BaseSupplierAdapter } from '../base-adapter';
import { SupplierError, type AdapterContext, type SupplierBookingInput, type SupplierBookingResult, type SupplierOffer } from '../supplier-adapter';

/**
 * Mozio — airport transfers and hourly hire. Mozio's search is asynchronous: a search is created,
 * then polled until complete. Gross-rate inventory with commission; paid by ACH weekly.
 * Paths are placeholders until Mozio's partner docs are applied.
 */
@Injectable()
export class MozioAdapter extends BaseSupplierAdapter {
  readonly key = 'mozio';
  readonly supports = ['airport_transfer', 'hourly'];

  private headers(ctx: AdapterContext) {
    return { 'API-KEY': ctx.credentials.API_KEY };
  }

  protected async liveSearch(req: QuoteSearchRequest, ctx: AdapterContext): Promise<SupplierOffer[]> {
    const created = this.ensureOk(
      this.key,
      await ctx.http.request<{ search_id: string }>({
        method: 'POST',
        url: `${ctx.credentials.BASE_URL}/v2/search/`, // TODO(partner-docs): confirm with Mozio docs
        headers: this.headers(ctx),
        body: {
          start_address: req.pickup.address,
          end_address: req.dropoff?.address,
          mode: req.service === 'hourly' ? 'hourly' : req.tripType === 'return' ? 'round_trip' : 'one_way',
          pickup_datetime: req.pickupAt,
          return_pickup_datetime: req.tripType === 'return' ? req.returnAt : undefined,
          num_passengers: req.passengers ?? 1,
          num_hours: req.service === 'hourly' ? req.hours : undefined,
          currency: req.currency ?? ctx.currency,
          campaign: 'ridean',
        },
      }),
      'create search',
    );

    const deadline = Date.now() + 7000;
    let results: MozioResult[] = [];
    while (Date.now() < deadline) {
      const poll = this.ensureOk(
        this.key,
        await ctx.http.request<{ results: MozioResult[]; more_coming: boolean }>({
          url: `${ctx.credentials.BASE_URL}/v2/search/${created.search_id}/poll/`,
          headers: this.headers(ctx),
        }),
        'poll search',
      );
      results = poll.results ?? [];
      if (!poll.more_coming) break;
      await new Promise((r) => setTimeout(r, 800));
    }
    return results.map((r) => ({
      offerId: r.result_id,
      vehicle: { class: r.vehicle_class ?? 'sedan', name: r.vehicle_name, passengers: r.max_passengers ?? 3, bags: r.max_bags ?? 2, imageUrl: r.image },
      price: this.toMinor(r.total_price),
      currency: r.currency ?? ctx.currency,
      durationMinutes: r.duration_minutes,
      cancellation: r.cancellation_policy ?? 'Free cancellation up to 24 hours before pickup',
      inclusions: r.amenities ?? ['Meet & greet', 'Flight tracking'],
      meta: { searchId: created.search_id, resultId: r.result_id },
    }));
  }

  protected async liveBook(input: SupplierBookingInput, ctx: AdapterContext): Promise<SupplierBookingResult> {
    const res = await ctx.http.request<{ reservation_id: string; status: string; price?: number }>({
      method: 'POST',
      url: `${ctx.credentials.BASE_URL}/v2/reservations/`,
      headers: { ...this.headers(ctx), 'Idempotency-Key': input.ourReference },
      body: {
        search_id: input.offerMeta.searchId,
        result_id: input.offerMeta.resultId ?? input.offerId,
        first_name: input.passenger.firstName,
        last_name: input.passenger.lastName,
        email: input.passenger.email,
        phone_number: input.passenger.phone,
        airline_flight_number: input.flightNumber,
        customer_special_instructions: input.notes,
        partner_tracking_id: input.ourReference,
      },
    });
    const data = this.ensureOk(this.key, res, 'reservation');
    if (data.status === 'failed') throw new SupplierError(this.key, 'Reservation failed at supplier');
    return { supplierReference: data.reservation_id, status: 'confirmed', finalPrice: data.price !== undefined ? this.toMinor(data.price) : undefined };
  }

  protected async liveCancel(ref: string, ctx: AdapterContext) {
    const res = await ctx.http.request<{ cancelled?: boolean; refund_amount?: number }>({
      method: 'DELETE',
      url: `${ctx.credentials.BASE_URL}/v2/reservations/${encodeURIComponent(ref)}/`,
      headers: this.headers(ctx),
    });
    this.ensureOk(this.key, res, 'cancel reservation');
    return { cancelled: true, fee: 0 };
  }
}

interface MozioResult {
  result_id: string;
  vehicle_name: string;
  vehicle_class?: string;
  max_passengers?: number;
  max_bags?: number;
  image?: string;
  total_price: number;
  currency?: string;
  duration_minutes?: number;
  cancellation_policy?: string;
  amenities?: string[];
}
