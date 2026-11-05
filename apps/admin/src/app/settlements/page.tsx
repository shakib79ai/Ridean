'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReportTotals, TransactionReport } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Chips, Empty, ErrorText, Field, Icon, Kpi, Loading, Modal, PageHead, Pill, Seg, useToast } from '@/components/ui';
import { PAYMENT_METHODS, PaymentModal, dec, monthBounds, toCsv, useStaff, type SupplierRow } from '@/components/partners/shared';
import { FLOW_LABEL, downloadText, m, rangeQuery } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

type Period = 'this' | 'last';
type Filter = 'all' | 'pending' | 'owes' | 'settled';

interface Data {
  suppliers: SupplierRow[];
  report: TransactionReport;
  /** Payments made to each supplier inside the period (minor units) */
  paid: Record<string, number>;
}

const ZERO: ReportTotals = { bookings: 0, gross: 0, supplierCost: 0, commission: 0, markup: 0, earnings: 0, owedToSuppliers: 0, owedToRidean: 0 };

const statusOf = (b: number): Exclude<Filter, 'all'> => (b > 0 ? 'pending' : b < 0 ? 'owes' : 'settled');

function periodLabel(start: Date, end: Date) {
  const mo = start.toLocaleDateString('en-US', { month: 'short' });
  return `${mo} ${start.getDate()}–${end.getDate()}`;
}

export default function SettlementsPage() {
  const { api } = useRidean();
  const { isFinance } = useStaff();
  const [period, setPeriod] = useState<Period>('this');
  const [filter, setFilter] = useState<Filter>('all');
  const [pay, setPay] = useState<SupplierRow | null>(null);
  const [payAll, setPayAll] = useState<SupplierRow[] | null>(null);
  const bounds = monthBounds(period === 'this' ? 0 : -1);

  const { data, error, reload } = useLoad<Data>(async () => {
    const range = rangeQuery(bounds);
    const [suppliers, report] = await Promise.all([
      api.admin.suppliers() as Promise<SupplierRow[]>,
      api.admin.transactionReport({ ...range, groupBy: 'supplier' }),
    ]);
    const fromT = new Date(range.from).getTime();
    const toT = new Date(range.to).getTime();
    const ledgers = await Promise.all(suppliers.map((s) => api.admin.ledger(s.id, { kind: 'payment' })));
    const paid: Record<string, number> = {};
    suppliers.forEach((s, i) => {
      paid[s.id] = ledgers[i]!
        .filter((e) => e.credit > 0 && (() => { const t = new Date(e.createdAt).getTime(); return t >= fromT && t < toT; })())
        .reduce((a, e) => a + e.credit, 0);
    });
    return { suppliers, report, paid };
  }, [api, period]);

  const head = (
    <PageHead
      title="Settlements & payments"
      sub={`Supplier balances and payouts — ${bounds.label}`}
      actions={<Seg label="Period" value={period} onChange={setPeriod} options={[['this', 'This month'], ['last', 'Last month']] as const} />}
    />
  );
  if (!data) return <>{head}<Loading error={error} onRetry={reload} /></>;

  const totalsFor = (id: string) => data.report.groups.find((g) => g.key === id)?.totals ?? ZERO;
  const pending = data.suppliers.filter((s) => s.balance > 0);
  const owing = data.suppliers.filter((s) => s.balance < 0);
  const pendingSum = pending.reduce((a, s) => a + s.balance, 0);
  const owedSum = owing.reduce((a, s) => a - s.balance, 0);
  const paidSum = Object.values(data.paid).reduce((a, v) => a + v, 0);
  const paidCount = Object.values(data.paid).filter((v) => v > 0).length;
  const rows = data.suppliers.filter((s) => filter === 'all' || statusOf(s.balance) === filter);
  const pLabel = periodLabel(bounds.start, bounds.end);
  const flows = Object.entries(
    data.suppliers.reduce<Record<string, number>>((a, s) => ((a[s.terms.paymentFlow] = (a[s.terms.paymentFlow] ?? 0) + 1), a), {}),
  );

  function exportCsv() {
    const csv = toCsv([
      ['Supplier', 'Period', 'Trips', 'Gross', 'Commission', 'Markup', 'Net payout', `Paid in period`, 'Balance', 'Status'],
      ...rows.map((s) => {
        const t = totalsFor(s.id);
        return [s.name, `${bounds.from} to ${bounds.to}`, t.bookings, dec(t.gross), dec(t.commission), dec(t.markup), dec(t.owedToSuppliers), dec(data!.paid[s.id] ?? 0), dec(s.balance), { pending: 'Pending', owes: 'Owes us', settled: 'Settled' }[statusOf(s.balance)]];
      }),
    ]);
    downloadText(`ridean-settlements-${bounds.from.slice(0, 7)}.csv`, csv);
  }

  return (
    <>
      {head}

      <div className="az-grid az-g3">
        <Kpi label="Pending payouts" icon="bank" value={m(pendingSum)} sub={`${pending.length} supplier${pending.length === 1 ? '' : 's'}`} tone="gold" />
        <Kpi label={period === 'this' ? 'Paid this month' : 'Paid last month'} icon="check" value={m(paidSum)} sub={paidCount ? `to ${paidCount} supplier${paidCount === 1 ? '' : 's'}` : 'No payouts recorded'} tone={paidCount ? 'up' : undefined} />
        <Kpi label="Owed to us" icon="wallet" value={m(owedSum)} sub={`${owing.length} supplier${owing.length === 1 ? '' : 's'} owe commission`} tone="info" />
      </div>

      <div className="az-between">
        <Chips label="Filter settlements" value={filter} onChange={setFilter} options={[['all', 'All'], ['pending', 'Pending'], ['owes', 'Owes us'], ['settled', 'Settled']] as const} />
        {isFinance && (
          <Btn kind="y" icon="send" disabled={pending.length === 0} onClick={() => setPayAll(pending)}>Pay all pending</Btn>
        )}
      </div>

      <div className="az-twrap">
        {rows.length === 0 ? (
          <Empty title={data.suppliers.length ? 'Nothing in this view' : 'No suppliers yet'}>{data.suppliers.length ? 'Try another filter.' : 'Add a supplier to start settling.'}</Empty>
        ) : (
          <table className="az-t compact">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Period</th>
                <th>Trips</th>
                <th className="num">Gross</th>
                <th className="num">Commission</th>
                <th className="num">Net payout</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const t = totalsFor(s.id);
                const st = statusOf(s.balance);
                return (
                  <tr key={s.id}>
                    <td>
                      {s.name}
                      <span className="sub">{FLOW_LABEL[s.terms.paymentFlow] ?? s.terms.paymentFlow}</span>
                    </td>
                    <td>{pLabel}</td>
                    <td>{t.bookings.toLocaleString()}</td>
                    <td className="num">{m(t.gross)}</td>
                    <td className="num">{m(t.commission)}</td>
                    <td className="num">
                      <strong>{m(t.owedToSuppliers)}</strong>
                      {t.owedToRidean > 0 && <span className="sub az-info">{m(t.owedToRidean)} due to us</span>}
                    </td>
                    <td>
                      {st === 'pending' && <Pill tone="warn">Pending</Pill>}
                      {st === 'owes' && <Pill tone="info">Owes us</Pill>}
                      {st === 'settled' && <Pill tone="ok">Settled</Pill>}
                      {st !== 'settled' && <span className="sub">Balance {m(Math.abs(s.balance))}</span>}
                    </td>
                    <td className="num">
                      <div className="az-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap', gap: 14 }}>
                        <Link className="az-a" href={`/suppliers/${s.id}`}>Statement</Link>
                        {isFinance && st === 'pending' && <Btn kind="y" size="sm" onClick={() => setPay(s)}>Pay</Btn>}
                        {isFinance && st === 'owes' && <Btn kind="g" size="sm" onClick={() => setPay(s)}>Receive</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="az-muted" style={{ margin: '-8px 0 0', fontSize: 13 }}>
        Trips, gross and payout cover {bounds.label}. Status and amounts in the status column are each supplier’s running ledger balance.
      </p>

      <div className="az-grid az-g2">
        <section className="az-card" style={{ padding: 20 }}>
          <div className="az-row" style={{ flexWrap: 'nowrap', gap: 16 }}>
            <div className="az-ic" style={{ width: 44, height: 44 }}><Icon name="bank" size={20} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="az-muted" style={{ fontSize: 13 }}>Payout method</div>
              <div style={{ fontSize: 15, marginTop: 2 }}>
                {flows.length ? flows.map(([f, n]) => `${FLOW_LABEL[f] ?? f} · ${n}`).join('  ·  ') : 'No suppliers yet'}
              </div>
            </div>
            <Link className="az-a" href="/suppliers">Change</Link>
          </div>
        </section>
        <section className="az-card" style={{ padding: 20 }}>
          <div className="az-between" style={{ flexWrap: 'nowrap' }}>
            <div style={{ minWidth: 0 }}>
              <div className="az-muted" style={{ fontSize: 13 }}>Export</div>
              <div style={{ fontSize: 15, marginTop: 2 }}>{bounds.label} · {rows.length} supplier{rows.length === 1 ? '' : 's'}</div>
            </div>
            <Btn kind="o" icon="download" onClick={exportCsv} disabled={rows.length === 0}>CSV</Btn>
          </div>
        </section>
      </div>

      {pay && <PaymentModal supplier={pay} onClose={() => setPay(null)} onDone={reload} />}
      {payAll && <PayAllModal suppliers={payAll} onClose={() => setPayAll(null)} onDone={reload} />}
    </>
  );
}

function PayAllModal({ suppliers, onClose, onDone }: { suppliers: SupplierRow[]; onClose: () => void; onDone: () => void }) {
  const { api } = useRidean();
  const toast = useToast();
  const [method, setMethod] = useState<string>('ACH');
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [prefix, setPrefix] = useState(`PAY-${today}`);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Record<string, 'ok' | string>>({});
  const total = suppliers.reduce((a, s) => a + s.balance, 0);
  const finished = Object.keys(done).length === suppliers.length;
  const failures = Object.entries(done).filter(([, v]) => v !== 'ok');

  async function run() {
    setBusy(true);
    const result: Record<string, 'ok' | string> = { ...done };
    for (const s of suppliers) {
      if (result[s.id] === 'ok') continue;
      try {
        await api.admin.recordPayment(s.id, { amount: s.balance, direction: 'paid_to_supplier', method, reference: `${prefix.trim()}-${s.code.toUpperCase()}`.slice(0, 60) });
        result[s.id] = 'ok';
      } catch (e) {
        result[s.id] = (e as Error).message;
      }
      setDone({ ...result });
    }
    setBusy(false);
    const ok = Object.values(result).filter((v) => v === 'ok').length;
    toast(`${ok} of ${suppliers.length} payments recorded`);
    onDone();
  }

  return (
    <Modal title="Pay all pending" onClose={busy ? () => {} : onClose}>
      <p className="az-muted" style={{ margin: 0, fontSize: 13.5 }}>
        Records a payment to each supplier below for its full balance ({m(total)} in total). Make the transfers in your bank first — this only updates Ridean’s ledger.
      </p>
      <div className="az-stack" style={{ gap: 0 }}>
        {suppliers.map((s) => (
          <div key={s.id} className="az-list-row" style={{ padding: '10px 0' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {s.name}
              <div className="az-muted" style={{ fontSize: 12.5 }}>{`${prefix.trim()}-${s.code.toUpperCase()}`.slice(0, 60)}</div>
            </div>
            <strong className="az-gold">{m(s.balance)}</strong>
            {done[s.id] === 'ok' && <Icon name="checkCircle" size={18} className="az-ok" />}
            {done[s.id] && done[s.id] !== 'ok' && <Icon name="alert" size={18} className="az-bad" />}
          </div>
        ))}
      </div>
      <div className="az-form">
        <Field label="Method">
          <select className="az-in" value={method} onChange={(e) => setMethod(e.target.value)} disabled={busy}>
            {PAYMENT_METHODS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Reference prefix">
          <input className="az-in" value={prefix} maxLength={40} onChange={(e) => setPrefix(e.target.value)} disabled={busy} />
        </Field>
      </div>
      {failures.length > 0 && (
        <ErrorText>
          {failures.map(([id, msg]) => `${suppliers.find((s) => s.id === id)?.name}: ${msg}`).join(' · ')}
        </ErrorText>
      )}
      <div className="az-row" style={{ justifyContent: 'flex-end' }}>
        <Btn kind="o" onClick={onClose} disabled={busy}>{finished ? 'Close' : 'Cancel'}</Btn>
        {!(finished && failures.length === 0) && (
          <Btn kind="y" icon="send" onClick={run} disabled={busy || !prefix.trim()}>
            {busy ? 'Recording…' : failures.length ? 'Retry failed' : `Record ${suppliers.length} payment${suppliers.length === 1 ? '' : 's'}`}
          </Btn>
        )}
      </div>
    </Modal>
  );
}
