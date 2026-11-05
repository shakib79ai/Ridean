'use client';

import { useState } from 'react';
import type { ReportTotals } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Loading, PageHead } from '@/components/Shell';
import { m, monthRange, pct, rangeQuery } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

type Row = ReportTotals & { key: string; label: string };
interface Earnings { currency: string; totals: ReportTotals & { takeRate: number }; bySupplier: Row[]; byService: Row[] }

function Table({ title, rows, c }: { title: string; rows: Row[]; c: string }) {
  const max = Math.max(1, ...rows.map((r) => r.earnings));
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>{title}</th><th className="num">Bookings</th><th className="num">Gross</th><th className="num">Commission</th><th className="num">Markup</th><th className="num">Earnings</th><th className="num">Take rate</th><th style={{ width: 140 }} /></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={8} className="rd-muted">No data.</td></tr>}
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td><td className="num">{r.bookings}</td><td className="num">{m(r.gross, c)}</td><td className="num">{m(r.commission, c)}</td><td className="num">{m(r.markup, c)}</td>
              <td className="num pos">{m(r.earnings, c)}</td><td className="num">{r.gross ? pct((r.earnings / r.gross) * 100) : '—'}</td>
              <td><div style={{ height: 8, borderRadius: 4, background: 'var(--gold)', width: `${(r.earnings / max) * 100}%` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EarningsPage() {
  const { api } = useRidean();
  const [range, setRange] = useState(monthRange());
  const { data, error } = useLoad(() => api.admin.earnings(rangeQuery(range)) as unknown as Promise<Earnings>, [api, range]);
  return (
    <>
      <PageHead title="Earnings" sub="Commission and markup Ridean keeps">
        <input className="inp" type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <input className="inp" type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
      </PageHead>
      {!data ? <Loading error={error} /> : (
        <div className="rd-stack" style={{ ['--gap' as string]: '18px' }}>
          <div className="kpis" style={{ marginBottom: 0 }}>
            <div className="kpi"><div className="l">Earnings</div><div className="v pos">{m(data.totals.earnings, data.currency)}</div></div>
            <div className="kpi"><div className="l">Commission</div><div className="v">{m(data.totals.commission, data.currency)}</div></div>
            <div className="kpi"><div className="l">Markup</div><div className="v">{m(data.totals.markup, data.currency)}</div></div>
            <div className="kpi"><div className="l">Gross sales</div><div className="v">{m(data.totals.gross, data.currency)}</div></div>
            <div className="kpi"><div className="l">Take rate</div><div className="v">{pct(data.totals.takeRate)}</div></div>
          </div>
          <Table title="By service" rows={data.byService} c={data.currency} />
          <Table title="By supplier" rows={data.bySupplier} c={data.currency} />
        </div>
      )}
    </>
  );
}
