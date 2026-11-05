import type { Passenger } from '@ridean/shared';

/** What the Review step hands to the Pay step (kept in sessionStorage, per quote). */
export interface CheckoutDraft {
  passenger: Passenger;
  notes?: string;
  flightNumber?: string;
  promoCode?: string;
}

const key = (quoteId: string) => `ridean.checkout.${quoteId}`;

export function saveDraft(quoteId: string, draft: CheckoutDraft): void {
  try {
    sessionStorage.setItem(key(quoteId), JSON.stringify(draft));
  } catch {
    /* storage unavailable (private mode) — the Pay step will send the user back to Review */
  }
}

export function loadDraft(quoteId: string): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(key(quoteId));
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<CheckoutDraft>;
    const p = d.passenger;
    if (!p || typeof p.firstName !== 'string' || typeof p.lastName !== 'string' || typeof p.email !== 'string' || typeof p.phone !== 'string') return null;
    return {
      passenger: { firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone },
      notes: typeof d.notes === 'string' ? d.notes : undefined,
      flightNumber: typeof d.flightNumber === 'string' ? d.flightNumber : undefined,
      promoCode: typeof d.promoCode === 'string' ? d.promoCode : undefined,
    };
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
