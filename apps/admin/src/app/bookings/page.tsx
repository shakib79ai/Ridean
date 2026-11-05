'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Booking } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Chips, Empty, Loading, PageHead, Pager, StatusPill, useToast } from '@/components/ui';
import { csvCell, passengerName, RefLink, ServiceCell, whenShort } from '@/components/ops/bits';
import { downloadText, m, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const STATUS_CHIPS = [
  ['', 'All'],
  ['confirmed', 'Scheduled'],
  ['driver_assigned', 'En route'],
  ['in_progress', 'In progress'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
  ['failed', 'Failed'],
] as const;
type StatusKey = (typeof STATUS_CHIPS)[number][0];

const RANGES = [
  ['30d', 'Last 30 days', 'in the last 30 days'],
  ['today', 'Today', 'today'],
  ['7d', 'Last 7 days', 'in the last 7 days'],
  ['all', 'All time', 'in total'],
] as const;
type RangeKey = (typeof RANGES)[number][0];

/** ISO start of the selected period (local midnight), undefined for all time. */
function rangeFrom(r: RangeKey): string | undefined {
  if (r === 'all') return undefined;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (r === '7d') d.setDate(d.getDate() - 6);
  if (r === '30d') d.setDate(d.getDate() - 29);
  return d.toISOString();
}

const PAGE_SIZE = 10;

export default function BookingsPage() {
  return (
    <Suspense fallback={<><PageHead title="Bookings" /><Loading height={420} /></>}>
      <Bookings />
    </Suspense>
  );
}

function Bookings() {
  const { api } = useRidean();
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const q = params.get('q')?.trim() ?? '';
  const statusParam = params.get('status') ?? '';
  const status: StatusKey = (STATUS_CHIPS.find(([k]) => k === statusParam)?.[0] ?? '') as StatusKey;
  const [range, setRange] = useState<RangeKey>('30d');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const from = rangeFrom(range);

  const { data, error, loading, reload } = useLoad(
    () => api.admin.bookings({ status: status || undefined, q: q || undefined, from, page, pageSize: PAGE_SIZE }),
    // `from` changes every render only when the range changes (day granularity), so key on the range.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, status, q, range, page],
  );

  const setParam = (key: 'status' | 'q', value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    setPage(1);
    const s = next.toString();
    router.replace(s ? `${path}?${s}` : path, { scroll: false });
  };

  const cycleRange = () => {
    const i = RANGES.findIndex(([k]) => k === range);
    setRange(RANGES[(i + 1) % RANGES.length]![0]);
    setPage(1);
  };
  const rangeInfo = RANGES.find(([k]) => k === range)!;

  async function exportCsv() {
    setExporting(true);
    try {
      const rows: Booking[] = [];
      for (let p = 1; ; p++) {
        const r = await api.admin.bookings({ status: status || undefined, q: q || undefined, from, page: p, pageSize: 100 });
        rows.push(...r.items);
        if (rows.length >= r.total || r.items.length === 0) break;
      }
      const head = ['Reference', 'Created', 'Status', 'Service', 'Customer', 'Email', 'Phone', 'Supplier', 'Supplier reference', 'Pickup time', 'Pickup', 'Destination', 'Vehicle', 'Currency', 'Customer price', 'Supplier price', 'Earnings', 'Collected by'];
      const lines = rows.map((b) => [
        b.reference, b.createdAt, b.status, svc(b.service), passengerName(b), b.passenger.email, b.passenger.phone, b.supplierName, b.supplierReference ?? '',
        b.pickupAt ?? '', b.pickup.address, b.dropoff?.address ?? '', b.vehicle.name, b.price.currency,
        (b.price.customerPrice / 100).toFixed(2), (b.price.supplierPrice / 100).toFixed(2), (b.price.earnings / 100).toFixed(2), b.price.collectedBy,
      ].map(csvCell).join(','));
      const stamp = new Date().toISOString().slice(0, 10);
      downloadText(`ridean-bookings-${stamp}.csv`, [head.join(','), ...lines].join('\n'));
      toast(`Exported ${rows.length.toLocaleString()} ${rows.length === 1 ? 'booking' : 'bookings'}`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHead
        title="Bookings"
        sub={data ? `${data.total.toLocaleString()} ${data.total === 1 ? 'booking' : 'bookings'} ${rangeInfo[2]}` : undefined}
        actions={<Btn kind="y" icon="plus" onClick={() => router.push('/bookings/new')}>New booking</Btn>}
        searchPlaceholder="Search bookings, customers…"
      />

      <div className="az-between" style={{ gap: 16 }}>
        <Chips label="Filter by status" options={STATUS_CHIPS} value={status} onChange={(v) => setParam('status', v)} />
        <div className="az-row" style={{ gap: 10 }}>
          <Btn kind="o" icon="calendar" onClick={cycleRange} aria-label={`Date range: ${rangeInfo[1]}. Change range`} title="Change date range">{rangeInfo[1]}</Btn>
          <Btn kind="g" icon="download" onClick={exportCsv} disabled={exporting || !data || data.total === 0}>{exporting ? 'Exporting…' : 'Export CSV'}</Btn>
        </div>
      </div>

      {q && (
        <div className="az-row" style={{ fontSize: 14 }}>
          <span className="az-muted">Results for</span>
          <span className="az-badge" style={{ fontSize: 13 }}>“{q}”</span>
          <button type="button" className="az-a" onClick={() => setParam('q', '')}>Clear search</button>
        </div>
      )}

      {!data ? (
        <Loading error={error} onRetry={reload} height={420} />
      ) : (
        <>
          {error && <Loading error={error} onRetry={reload} />}
          <div className="az-twrap" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }} aria-busy={loading}>
            {data.items.length === 0 ? (
              <Empty
                title={q || status ? 'No matching bookings' : 'No bookings yet'}
                action={range !== 'all' ? <Btn size="sm" onClick={() => { setRange('all'); setPage(1); }}>Show all time</Btn> : undefined}
              >
                {q || status ? 'Try another status, a wider date range, or a different search.' : `Nothing was booked ${rangeInfo[2]}.`}
              </Empty>
            ) : (
              <table className="az-t">
                <thead>
                  <tr>
                    <th>Booking</th><th>Customer</th><th>Service</th><th>Driver / supplier</th><th>Pickup</th><th>Status</th><th className="num">Amount</th><th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((b) => (
                    <tr key={b.id}>
                      <td><RefLink b={b} /></td>
                      <td>{passengerName(b)}</td>
                      <td><ServiceCell service={b.service} /></td>
                      <td style={{ color: 'var(--soft)' }}>{b.supplierName}</td>
                      <td style={{ color: 'var(--soft)' }} title={b.pickup.address}>{whenShort(b.pickupAt)}</td>
                      <td><StatusPill status={b.status} /></td>
                      <td className="num" style={{ fontWeight: 600 }}>{m(b.price.customerPrice, b.price.currency)}</td>
                      <td className="num">
                        <Link href={`/bookings/${b.id}`} className="az-a" aria-label={`View booking ${b.reference}`}>
                          {b.status === 'failed' ? 'Review' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {data.total > 0 && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} noun="bookings" />}
        </>
      )}
    </>
  );
}
