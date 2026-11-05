import type { BookingStatus } from '@ridean/shared';

const MAP: Record<BookingStatus, [string, string]> = {
  pending_payment: ['Pending payment', 'rd-pill-warn'],
  payment_authorised: ['Confirming', 'rd-pill-warn'],
  confirmed: ['Confirmed', 'rd-pill-ok'],
  driver_assigned: ['Driver assigned', 'rd-pill-ok'],
  in_progress: ['In progress', 'rd-pill-info'],
  completed: ['Completed', 'rd-pill-mut'],
  cancelled: ['Cancelled', 'rd-pill-bad'],
  failed: ['Failed', 'rd-pill-bad'],
};

export function Status({ s }: { s: BookingStatus }) {
  const [l, c] = MAP[s] ?? [s, 'rd-pill-mut'];
  return <span className={`rd-pill ${c}`}>{l}</span>;
}

/** Positive balance = Ridean owes the supplier; negative = supplier owes Ridean. */
export function Balance({ v, fmt }: { v: number; fmt: (n: number) => string }) {
  if (v === 0) return <span className="rd-muted">Settled</span>;
  return v > 0 ? <span className="pos">We owe {fmt(v)}</span> : <span className="neg">Owes us {fmt(-v)}</span>;
}
