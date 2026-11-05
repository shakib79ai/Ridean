'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReportTotals } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { ServiceSelect, SupplierSelect } from '@/components/Filters';
import { Loading, PageHead } from '@/components/Shell';
import { Status } from '@/components/Status';
import { d, downloadText, FLOW_LABEL, m, monthRange, rangeQuery, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

function Cells({ t, c }: { t: ReportTotals; c: string }) {
  return (
    <>
      <td className="num">{t.bookings}</td>
      <td className="num">{m(t.gross, c)}</td>
      <td className="num">{m(t.supplierCost, c)}</td>
      <td className="num">{m(t.commission, c)}</td>
      <td className="num">{m(t.markup, c)}</td>
      <td className="num pos">{m(t.earnings, c)}</td>
      <td className="num">{m(t.owedToSuppliers, c)}</td>
      <td className="num">{m(t.owedToRidean, c)}</td>
      <td className="num">{t.owedToSuppliers - t.owedToRidean > 0 ? <span className="pos">We owe {m(t.owedToSuppliers - t.owedToRidean, c)}</span> : t.owedToSuppliers - t.owedToRidean < 0 ? <span className="neg">Owes us {m(t.owedToRidean - t.owedToSuppliers, c)}</span> : '—'}</td>
    </>
  );
}

export default function ReportsPage() {
  const { api } = useRidean();
  const router = useRouter();
  const [range, setRange] = useState(monthRange());
  const [supplierId, setSupplierId] = useState('');
  const [service, setService] = useState('');
  const [groupBy, setGroupBy] = useState<'supplier' | 'service'>('supplier');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  // Selecting a supplier shows its services; selecting a service shows its suppliers.
  const effectiveGroup: 'supplier' | 'service' = supplierId && !service ? 'service' : service && !supplierId ? 'supplier' : groupBy;
  const q = { ...rangeQuery(range), supplierId: supplierId || undefined, service: service || undefined };

  const suppliers = useLoad(() => api.admin.suppliers(), [api]);
  const report = useLoad(() => api.admin.transactionReport({ ...q, groupBy: effectiveGroup }), [api, range, supplierId, service, effectiveGroup]);
  const rows = useLoad(() => api.admin.transactions({ ...q, page }), [api, range, supplierId, service, page]);
  const r = report.data;
  const c = r?.currency ?? 'USD';
  const pages = rows.data ? Math.max(1, Math.ceil(rows.data.total / rows.data.pageSize)) : 1;

  async function exportCsv() {
    downloadText(`ridean-transactions-${range.from}-to-${range.to}.csv`, await api.admin.transactionsCsv(q));
  }

  return (
    <>
      <PageHead title="Transaction report" sub="Debits, credits, commission and markup by supplier and service">
        <button className="rd-btn rd-btn-ghost btn-sm" onClick={exportCsv}>Export CSV</button>
      </PageHead>

      <div className="filters">
        <label>From<input className="inp" type="date" value={range.from} onChange={(e) => { setRange({ ...range, from: e.target.value }); setPage(1); }} /></label>
        <label>To<input className="inp" type="date" value={range.to} onChange={(e) => { setRange({ ...range, to: e.target.value }); setPage(1); }} /></label>
        <label>Supplier<SupplierSelect suppliers={suppliers.data ?? []} value={supplierId} onChange={(v) => { setSupplierId(v); setPage(1); setOpen({}); }} /></label>
        <label>Service<ServiceSelect value={service} onChange={(v) => { setService(v); setPage(1); setOpen({}); }} /></label>
        <label>Group by
          <div className="seg2">
            <button aria-pressed={effectiveGroup === 'supplier'} disabled={!!supplierId && !service} onClick={() => setGroupBy('supplier')}>Supplier</button>
            <button aria-pressed={effectiveGroup === 'service'} disabled={!!service && !supplierId} onClick={() => setGroupBy('service')}>Service</button>
          </div>
        </label>
        {(supplierId || service) && <button className="rd-btn rd-btn-dark btn-sm" onClick={() => { setSupplierId(''); setService(''); }}>Clear filters</button>}
      </div>

      {!r ? <Loading error={report.error} /> : (
        <>
          <div className="kpis">
            <div className="kpi"><div className="l">Bookings</div><div className="v">{r.totals.bookings}</div></div>
            <div className="kpi"><div className="l">Gross sales</div><div className="v">{m(r.totals.gross, c)}</div></div>
            <div className="kpi"><div className="l">Commission</div><div className="v">{m(r.totals.commission, c)}</div></div>
            <div className="kpi"><div className="l">Markup</div><div className="v">{m(r.totals.markup, c)}</div></div>
            <div className="kpi"><div className="l">Ridean earnings</div><div className="v pos">{m(r.totals.earnings, c)}</div></div>
            <div className="kpi"><div className="l">Net for period</div><div className="v" style={{ fontSize: 22 }}>{r.totals.owedToSuppliers >= r.totals.owedToRidean ? <span className="pos">We owe {m(r.totals.owedToSuppliers - r.totals.owedToRidean, c)}</span> : <span className="neg">Owed to us {m(r.totals.owedToRidean - r.totals.owedToSuppliers, c)}</span>}</div><div className="s">Debit {m(r.totals.owedToSuppliers, c)} · Credit {m(r.totals.owedToRidean, c)}</div></div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>{effectiveGroup === 'supplier' ? 'Supplier' : 'Service'}</th><th className="num">Bookings</th><th className="num">Gross</th><th className="num">Supplier cost</th><th className="num">Commission</th><th className="num">Markup</th><th className="num">Earnings</th><th className="num">Debit (owe supplier)</th><th className="num">Credit (owed to us)</th><th className="num">Net</th></tr>
              </thead>
              <tbody>
                {r.groups.length === 0 && <tr><td colSpan={10} className="rd-muted">No transactions in this period.</td></tr>}
                {r.groups.map((g) => (
                  <Fragment key={g.key}>
                    <tr className="click" onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))}>
                      <td><strong>{open[g.key] ? '▾' : '▸'} {g.label}</strong></td>
                      <Cells t={g.totals} c={c} />
                    </tr>
                    {open[g.key] && g.children.map((ch) => (
                      <tr key={g.key + ch.key} className="child"><td>{ch.label}</td><Cells t={ch.totals} c={c} /></tr>
                    ))}
                  </Fragment>
                ))}
                {r.groups.length > 0 && <tr className="total"><td>Total</td><Cells t={r.totals} c={c} /></tr>}
              </tbody>
            </table>
          </div>
          <p className="legend">Click a row to see the {effectiveGroup === 'supplier' ? 'service' : 'supplier'} breakdown. Debit = what Ridean owes suppliers for bookings Ridean charged in this period. Credit = what suppliers owe Ridean (commission + markup) on bookings they charged directly. Outstanding balances after payments are on Settlements and each supplier's ledger.</p>
        </>
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: '28px 0 12px' }}>Transactions</h2>
      {!rows.data ? <Loading error={rows.error} /> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Date</th><th>Reference</th><th>Service</th><th>Supplier</th><th>Payment</th><th>Status</th><th className="num">Supplier price</th><th className="num">Commission</th><th className="num">Markup</th><th className="num">Customer</th><th className="num">Earnings</th><th className="num">Debit</th><th className="num">Credit</th></tr></thead>
            <tbody>
              {rows.data.items.length === 0 && <tr><td colSpan={13} className="rd-muted">No transactions.</td></tr>}
              {rows.data.items.map((b) => {
                const p = b.price;
                return (
                  <tr key={b.id} className="click" onClick={() => router.push(`/bookings/${b.id}`)}>
                    <td>{d(b.createdAt)}</td><td><strong>{b.reference}</strong></td><td>{svc(b.service)}</td><td>{b.supplierName}</td><td>{FLOW_LABEL[b.paymentFlow]}</td><td><Status s={b.status} /></td>
                    <td className="num">{m(p.supplierPrice, p.currency)}</td><td className="num">{m(p.commission, p.currency)}</td><td className="num">{m(p.markup, p.currency)}</td><td className="num">{m(p.customerPrice, p.currency)}</td><td className="num pos">{m(p.earnings, p.currency)}</td>
                    <td className="num">{p.owedToSupplier ? m(p.owedToSupplier, p.currency) : '—'}</td><td className="num">{p.owedToRidean ? m(p.owedToRidean, p.currency) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pager">
            Page {rows.data.page} of {pages}
            <button className="rd-btn rd-btn-dark btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="rd-btn rd-btn-dark btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}
