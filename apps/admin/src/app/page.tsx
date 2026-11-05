'use client';

import { useRouter } from 'next/navigation';
import type { Booking, ReportTotals } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Loading, PageHead } from '@/components/Shell';
import { Status } from '@/components/Status';
import { dt, m, pct, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

interface Dash {
  currency: string;
  bookingsToday: number;
  activeTrips: number;
  revenueToday: number;
  earningsToday: number;
  month: ReportTotals & { takeRate: number };
  byService: (ReportTotals & { key: string; label: string })[];
  recent: Booking[];
}

export default function Dashboard() {
  const { api } = useRidean();
  const router = useRouter();
  const { data, error } = useLoad(() => api.admin.dashboard() as unknown as Promise<Dash>, [api]);
  if (!data) return <><PageHead title="Dashboard" /><Loading error={error} /></>;
  const c = data.currency;
  return (
    <>
      <PageHead title="Dashboard" sub="Today and month to date" />
      <div className="kpis">
        <div className="kpi"><div className="l">Bookings today</div><div className="v">{data.bookingsToday}</div></div>
        <div className="kpi"><div className="l">Active trips</div><div className="v">{data.activeTrips}</div></div>
        <div className="kpi"><div className="l">Revenue today</div><div className="v">{m(data.revenueToday, c)}</div></div>
        <div className="kpi"><div className="l">Earnings today</div><div className="v">{m(data.earningsToday, c)}</div></div>
        <div className="kpi"><div className="l">Earnings this month</div><div className="v">{m(data.month.earnings, c)}</div><div className="s">Take rate {pct(data.month.takeRate)} · {data.month.bookings} bookings</div></div>
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Service (month)</th><th className="num">Bookings</th><th className="num">Gross</th><th className="num">Earnings</th></tr></thead>
            <tbody>
              {data.byService.length === 0 && <tr><td colSpan={4} className="rd-muted">No bookings yet this month.</td></tr>}
              {data.byService.map((s) => <tr key={s.key}><td>{s.label}</td><td className="num">{s.bookings}</td><td className="num">{m(s.gross, c)}</td><td className="num">{m(s.earnings, c)}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Recent booking</th><th>Service</th><th>Status</th><th className="num">Total</th></tr></thead>
            <tbody>
              {data.recent.map((b) => (
                <tr key={b.id} className="click" onClick={() => router.push(`/bookings/${b.id}`)}>
                  <td><strong>{b.reference}</strong><div className="rd-muted" style={{ fontSize: 12 }}>{dt(b.createdAt)}</div></td>
                  <td>{svc(b.service)}</td><td><Status s={b.status} /></td><td className="num">{m(b.price.customerPrice, b.price.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
