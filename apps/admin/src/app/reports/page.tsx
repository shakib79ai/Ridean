'use client';

import { useMemo, useState } from 'react';
import { SERVICE_KEYS, type TransactionReport } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Bar, Btn, Card, Chips, Empty, Icon, Kpi, Loading, PageHead, Seg, serviceIcon, useToast } from '@/components/ui';
import { PERIOD_LABEL, periodPhrase, periodRange, SelectBtn, type Period } from '@/components/finance/shared';
import { RepGrandTotal, RepGroup, RepHeader, REP_MIN_WIDTH } from '@/components/finance/ReportRows';
import { downloadText, m, rangeQuery, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const SERVICE_CHIPS = [['', 'All services'], ...SERVICE_KEYS.map((k) => [k, svc(k)] as const)] as const;
const PERIODS: Period[] = ['month', 'last_month', 'week', 'custom'];

function BarCard({ title, rows, c, green, icons }: { title: string; rows: TransactionReport['groups']; c: string; green?: boolean; icons?: boolean }) {
  const max = Math.max(0, ...rows.map((r) => r.totals.earnings));
  return (
    <Card title={title}>
      {rows.length === 0 ? (
        <Empty title="No earnings">Nothing in this period.</Empty>
      ) : (
        <div className="az-stack" style={{ gap: 10, marginTop: 14 }}>
          {rows.map((r) => (
            <div key={r.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 160px) minmax(60px, 1fr) auto', gap: 14, alignItems: 'center', fontSize: 14 }}>
              <div className="az-row" style={{ gap: 8, flexWrap: 'nowrap', minWidth: 0 }}>
                {icons && <Icon name={serviceIcon(r.key)} size={16} style={{ color: 'var(--soft)' }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
              </div>
              <Bar value={r.totals.earnings} max={max} green={green} />
              <div style={{ fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{m(r.totals.earnings, c)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  const { api } = useRidean();
  const toast = useToast();
  const [groupBy, setGroupBy] = useState<'supplier' | 'service'>('supplier');
  const [service, setService] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [period, setPeriod] = useState<Period>('month');
  const [custom, setCustom] = useState(periodRange('month'));
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [openChildren, setOpenChildren] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const range = useMemo(() => (period === 'custom' ? custom : periodRange(period)), [period, custom]);
  const validRange = range.from && range.to && range.from <= range.to;
  const q = useMemo(() => (validRange ? rangeQuery(range) : rangeQuery(periodRange('month'))), [range, validRange]);
  const filters = { ...q, supplierId: supplierId || undefined, service: service || undefined };
  const phrase = periodPhrase(period, range);

  const suppliers = useLoad(() => api.admin.suppliers(), [api]);
  const bySupplier = useLoad(() => api.admin.transactionReport({ ...filters, groupBy: 'supplier' }), [api, q, supplierId, service]);
  const byService = useLoad(() => api.admin.transactionReport({ ...filters, groupBy: 'service' }), [api, q, supplierId, service]);
  const supMap = useMemo(() => new Map((suppliers.data ?? []).map((s) => [s.id, s] as const)), [suppliers.data]);

  const main = groupBy === 'supplier' ? bySupplier : byService;
  const r = main.data;
  const t = (bySupplier.data ?? byService.data)?.totals;
  const c = (bySupplier.data ?? byService.data)?.currency ?? 'USD';
  const anyOpen = !!r && r.groups.some((g) => !closed.has(g.key));

  function resetOpen() {
    setClosed(new Set());
    setOpenChildren(new Set());
  }
  function toggleAll() {
    if (!r) return;
    if (anyOpen) {
      setClosed(new Set(r.groups.map((g) => g.key)));
      setOpenChildren(new Set());
    } else setClosed(new Set());
  }

  async function exportCsv() {
    setExporting(true);
    try {
      downloadText(`ridean-transactions-${range.from}-to-${range.to}.csv`, await api.admin.transactionsCsv({ ...q, supplierId: supplierId || undefined, service: service || undefined }));
      toast('Transaction report exported (CSV)');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  const allLabel = service ? svc(service) : supplierId ? supMap.get(supplierId)?.name ?? 'Supplier' : 'All services';

  return (
    <>
      <PageHead title="Transaction report" sub="Bookings by service and supplier" searchPlaceholder="Search bookings, customers, suppliers…" />

      {!t ? (
        <Loading error={bySupplier.error ?? byService.error} onRetry={() => { bySupplier.reload(); byService.reload(); }} height={240} />
      ) : (
        <div className="az-grid az-g3">
          <Kpi label="Bookings" icon="calendar" value={t.bookings.toLocaleString()} sub={`${service ? svc(service) : 'All services'} · ${phrase}`} />
          <Kpi label="Gross booking value" icon="wallet" value={m(t.gross, c)} sub="What customers paid" />
          <Kpi label="Supplier cost" icon="send" value={m(t.supplierCost, c)} sub="Paid or payable to suppliers" />
          <Kpi label="Our earnings" icon="star" value={m(t.earnings, c)} sub={`Commission ${m(t.commission, c)} · markup ${m(t.markup, c)}`} tone="gold" />
          <Kpi label="We owe suppliers" icon="bank" value={m(t.owedToSuppliers, c)} sub="On bookings we charged by card or ACH" tone="gold" />
          <Kpi label="Suppliers owe us" icon="download" value={m(t.owedToRidean, c)} sub="Commission + markup they collected" tone="info" />
        </div>
      )}

      <div className="az-grid az-g2">
        {byService.data ? <BarCard title="Earnings by service" rows={byService.data.groups} c={c} icons /> : <Loading error={byService.error} onRetry={byService.reload} height={200} />}
        {bySupplier.data ? <BarCard title="Earnings by supplier" rows={bySupplier.data.groups} c={c} green /> : <Loading error={bySupplier.error} onRetry={bySupplier.reload} height={200} />}
      </div>

      <div className="az-row" style={{ gap: 14 }}>
        <Seg label="Group report" style={{ width: 296, maxWidth: '100%' }} options={[['supplier', 'By supplier'], ['service', 'By service']]} value={groupBy} onChange={(v) => { setGroupBy(v); resetOpen(); }} />
        <div className="az-muted" style={{ fontSize: 13 }}>Pick a supplier to see it by service, or pick a service to see it by supplier.</div>
      </div>

      <div className="az-stack" style={{ gap: 14 }}>
        <Chips label="Service" options={SERVICE_CHIPS} value={service} onChange={(v) => { setService(v); resetOpen(); }} />
        <div className="az-row" style={{ gap: 10 }}>
          <SelectBtn label="Supplier" value={supplierId} onChange={(v) => { setSupplierId(v); resetOpen(); }} minWidth={180}>
            <option value="">All suppliers</option>
            {(suppliers.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </SelectBtn>
          <SelectBtn label="Period" value={period} onChange={(v) => { setPeriod(v as Period); resetOpen(); }} minWidth={140}>
            {PERIODS.map((p) => <option key={p} value={p}>{PERIOD_LABEL[p]}</option>)}
          </SelectBtn>
          {period === 'custom' && (
            <>
              <input className="az-in" type="date" aria-label="From date" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} style={{ width: 'auto', height: 44 }} />
              <input className="az-in" type="date" aria-label="To date" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} style={{ width: 'auto', height: 44 }} />
            </>
          )}
          <Btn icon="filter" onClick={toggleAll} disabled={!r || r.groups.length === 0}>{anyOpen ? 'Collapse all' : 'Expand all'}</Btn>
          <Btn kind="y" icon="download" onClick={exportCsv} disabled={exporting}>{exporting ? 'Exporting…' : 'Export'}</Btn>
        </div>
        {!validRange && <div className="az-alert" role="alert">The start date must be on or before the end date — showing this month instead.</div>}
      </div>

      {!r ? (
        <Loading error={main.error} onRetry={main.reload} />
      ) : r.groups.length === 0 ? (
        <div className="az-card"><Empty title="No transactions">No confirmed bookings match these filters {phrase}.</Empty></div>
      ) : (
        <div style={{ overflowX: 'auto', margin: '0 -2px', padding: '0 2px' }}>
          <div className="az-stack" style={{ gap: 14, minWidth: REP_MIN_WIDTH }}>
            <RepHeader />
            {r.groups.map((g) => (
              <RepGroup
                key={g.key}
                g={g}
                groupBy={groupBy}
                c={c}
                q={q}
                phrase={phrase}
                suppliers={supMap}
                open={!closed.has(g.key)}
                onToggle={(o) => setClosed((s) => { const n = new Set(s); if (o) n.delete(g.key); else n.add(g.key); return n; })}
                openChildren={openChildren}
                onToggleChild={(k, o) => setOpenChildren((s) => { const n = new Set(s); if (o) n.add(k); else n.delete(k); return n; })}
              />
            ))}
            <RepGrandTotal t={r.totals} c={c} phrase={phrase} label={allLabel} />
          </div>
        </div>
      )}

      <div className="az-muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
        Supplier cost is net cost, or gross price minus commission. Our earnings are commission plus markup. Owed to them is what we owe the supplier for bookings we charged; owed to us is what suppliers owe us on bookings they charged. Outstanding balances after payments are on Settlements and each supplier account. Open a supplier, then a service, to see its transactions.
      </div>
    </>
  );
}
