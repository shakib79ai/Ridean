import type { Booking, PriceBreakdown, Quote } from '@ridean/shared';

/**
 * Customers see what they pay, never Ridean's cost, commission, markup or earnings.
 * Internal fields are zeroed on every customer-facing response; admin routes return the full breakdown.
 */
export function publicPrice(p: PriceBreakdown): PriceBreakdown {
  return { currency: p.currency, customerPrice: p.customerPrice, collectedBy: p.collectedBy, supplierPrice: 0, commission: 0, markup: 0, earnings: 0, supplierPayable: 0, owedToSupplier: 0, owedToRidean: 0 };
}
export const publicQuote = (q: Quote): Quote => ({ ...q, price: publicPrice(q.price) });
export const publicBooking = (b: Booking): Booking => ({ ...b, price: publicPrice(b.price) });
