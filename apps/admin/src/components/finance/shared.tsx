'use client';

// Helpers shared by the Earnings and Transaction report pages.
import type { Booking, Supplier } from '@ridean/shared';
import { Icon } from '@/components/ui';
import { FLOW_LABEL } from '@/lib/format';

export type Period = 'month' | 'last_month' | 'week' | 'custom';
export const PERIOD_LABEL: Record<Period, string> = { month: 'This month', last_month: 'Last month', week: 'Last 7 days', custom: 'Custom' };

const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

/** Local yyyy-mm-dd range (inclusive) for a preset period. */
export function periodRange(p: Exclude<Period, 'custom'>): { from: string; to: string } {
  const now = new Date();
  if (p === 'last_month') {
    const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const t = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: iso(f), to: iso(t) };
  }
  if (p === 'week') {
    const f = new Date(now);
    f.setDate(f.getDate() - 6);
    return { from: iso(f), to: iso(now) };
  }
  return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
}

/** "this month" / "last month" / "last 7 days" / "Nov 1 – Nov 5" for sub-labels. */
export function periodPhrase(p: Period, r: { from: string; to: string }) {
  if (p !== 'custom') return PERIOD_LABEL[p].toLowerCase();
  const f = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${f(r.from)} – ${f(r.to)}`;
}

/** Short paid-via label from the booking's payment flow. */
export function paidVia(flow: string): { label: string; icon: string } {
  if (flow === 'supplier_collects') return { label: 'Supplier', icon: 'swap' };
  if (flow === 'ach_debit') return { label: 'ACH', icon: 'bank' };
  return { label: 'Card', icon: 'card' };
}

/** "Net · Corporate card" for a supplier's terms. */
export function termsLine(s?: Pick<Supplier, 'terms'>) {
  if (!s) return '';
  return `${s.terms.inventoryType === 'gross' ? 'Gross' : 'Net'} · ${FLOW_LABEL[s.terms.paymentFlow] ?? s.terms.paymentFlow}`;
}

/** Short trip description for a booking row: "JFK → Midtown" or the service's own detail. */
export function routeShort(b: Booking) {
  const short = (a?: string, iata?: string) => iata || (a ? a.split(',')[0]!.trim() : '');
  const from = short(b.pickup?.address, b.pickup?.iata);
  const to = short(b.dropoff?.address, b.dropoff?.iata);
  if (from && to) return `${from} → ${to}`;
  return from || b.vehicle?.name || '';
}

export function PaidVia({ flow }: { flow: string }) {
  const p = paidVia(flow);
  return (
    <span className="az-row" style={{ gap: 8, flexWrap: 'nowrap' }}>
      <Icon name={p.icon} size={16} style={{ color: 'var(--muted)' }} />
      {p.label}
    </span>
  );
}

/** Small select styled like an outline button. */
export function SelectBtn({ label, value, onChange, children, minWidth }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; minWidth?: number }) {
  return (
    <select aria-label={label} className="az-in" value={value} onChange={(e) => onChange(e.target.value)} style={{ height: 44, width: 'auto', minWidth: minWidth ?? 150, backgroundColor: 'var(--card)', fontWeight: 600, fontSize: 14 }}>
      {children}
    </select>
  );
}
