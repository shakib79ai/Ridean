import type { Passenger, QuoteSearchRequest } from '@ridean/shared';

/**
 * What the booking screens and the Review step hand to the next step (sessionStorage, per quote).
 * The booking screens save `search` (the trip the visitor typed — a quote carries no route) and `notes`;
 * Review adds the passenger and promo code; Pay needs the passenger.
 */
export interface CheckoutDraft {
  passenger?: Passenger;
  notes?: string;
  flightNumber?: string;
  promoCode?: string;
  search?: QuoteSearchRequest;
}

const key = (quoteId: string) => `ridean.checkout.${quoteId}`;
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

export function saveDraft(quoteId: string, draft: CheckoutDraft): void {
  try {
    sessionStorage.setItem(key(quoteId), JSON.stringify(draft));
  } catch {
    /* storage unavailable (private mode) — the Pay step will send the user back to Review */
  }
}

/** Merges fields into the stored draft. */
export function updateDraft(quoteId: string, patch: CheckoutDraft): void {
  saveDraft(quoteId, { ...(loadDraft(quoteId) ?? {}), ...patch });
}

export function loadDraft(quoteId: string): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(key(quoteId));
    if (!raw) return null;
    const d = JSON.parse(raw) as Record<string, unknown>;
    const p = d.passenger as Partial<Passenger> | undefined;
    const passenger =
      p && typeof p.firstName === 'string' && typeof p.lastName === 'string' && typeof p.email === 'string' && typeof p.phone === 'string'
        ? { firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone }
        : undefined;
    const s = d.search as Partial<QuoteSearchRequest> | undefined;
    const search = s && typeof s.service === 'string' && s.pickup && typeof s.pickup.address === 'string' ? (s as QuoteSearchRequest) : undefined;
    return { passenger, notes: str(d.notes), flightNumber: str(d.flightNumber), promoCode: str(d.promoCode), search };
  } catch {
    return null;
  }
}

export function clearDraft(quoteId: string): void {
  try {
    sessionStorage.removeItem(key(quoteId));
  } catch {
    /* ignore */
  }
}
