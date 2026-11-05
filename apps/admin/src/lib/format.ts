import { formatMoney, serviceLabel } from '@ridean/shared';

export const m = (minor: number | undefined | null, currency = 'USD') => formatMoney(Number(minor ?? 0), currency);
export const svc = (k: string) => serviceLabel(k);
export const dt = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');
export const d = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');
export const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
export const FLOW_LABEL: Record<string, string> = { corporate_card: 'Corporate card', ach_debit: 'ACH debit', supplier_collects: 'Supplier collects' };

/** First/last day of the current month as yyyy-mm-dd (local). */
export function monthRange() {
  const now = new Date();
  const f = new Date(now.getFullYear(), now.getMonth(), 1);
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  return { from: iso(f), to: iso(now) };
}

export function downloadText(name: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Turn local yyyy-mm-dd dates into an ISO range covering whole local days (end exclusive). */
export function rangeQuery(r: { from: string; to: string }) {
  const from = new Date(`${r.from}T00:00:00`);
  const to = new Date(`${r.to}T00:00:00`);
  to.setDate(to.getDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}
