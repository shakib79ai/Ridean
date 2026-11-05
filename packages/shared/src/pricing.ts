import type { PriceBreakdown, SupplierCommercialTerms } from './types';

/**
 * Turns a supplier price into the customer price and Ridean's earnings.
 *
 *  Net-rate supplier:   customer = net + markup                 earnings = markup
 *  Gross-rate supplier: customer = gross + markup               earnings = gross × commission% + markup
 *                       supplier keeps gross − commission
 *  Supplier collects:   same maths, but the supplier charges the customer and owes Ridean `earnings`.
 *
 * All amounts are integer minor units (cents). Rounding is half-up to the nearest cent.
 */
export function priceQuote(supplierPrice: number, terms: SupplierCommercialTerms, currency = 'USD'): PriceBreakdown {
  if (!Number.isFinite(supplierPrice) || supplierPrice < 0) {
    throw new Error(`Invalid supplier price: ${supplierPrice}`);
  }
  const price = Math.round(supplierPrice);
  const commission = terms.inventoryType === 'gross' ? roundCents((price * clampPct(terms.commissionPct)) / 100) : 0;
  const markup =
    terms.markupType === 'percent' ? roundCents((price * clampPct(terms.markupValue)) / 100) : Math.max(0, Math.round(terms.markupValue));
  const customerPrice = price + markup;
  const earnings = commission + markup;
  const supplierPayable = price - commission;
  const collectedBy = terms.paymentFlow === 'supplier_collects' ? 'supplier' : 'ridean';
  return {
    currency,
    supplierPrice: price,
    commission,
    markup,
    customerPrice,
    earnings,
    supplierPayable,
    collectedBy,
    owedToSupplier: collectedBy === 'ridean' ? supplierPayable : 0,
    owedToRidean: collectedBy === 'supplier' ? earnings : 0,
  };
}

function roundCents(v: number): number {
  return Math.round(v + Number.EPSILON);
}

function clampPct(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.min(100, Math.max(0, p));
}

/** Take rate = earnings / customer price, as a percentage with one decimal. */
export function takeRate(b: Pick<PriceBreakdown, 'earnings' | 'customerPrice'>): number {
  if (!b.customerPrice) return 0;
  return Math.round((b.earnings / b.customerPrice) * 1000) / 10;
}
