'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { priceQuote, type Booking, type ReportTotals } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Card, Chips, Empty, Icon, Kpi, Loading, PageHead, Pager, Pill, RateTag, Seg, StatusPill, useToast } from '@/components/ui';
import { PaidVia, PERIOD_LABEL, periodPhrase, periodRange, routeShort, SelectBtn, termsLine, type Period } from '@/components/finance/shared';
import { downloadText, m, rangeQuery, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

type Row = ReportTotals & { key: string; label: string };
interface Earnings { currency: string; from: string; to: string; totals: ReportTotals & { takeRate: number }; bySupplier: Row[]; byService: Row[] }
type Filter = 'all' | 'net' | 'gross' | 'collects';

const FILTERS = [['all', 'All bookings'], ['net', 'Net rate'], ['gross', 'Gross rate'], ['collects', 'Supplier collects']] as const;
const PERIODS = ['month', 'last_month', 'week'] as const;

/** Booking-level money status: what this booking adds to the supplier balance. */
function MoneyStatus({ b }: { b: Booking }) {
  if (!['confirmed', 'driver_assigned', 'in_progress', 'completed'].includes(b.status)) return <StatusPill status={b.status} />;
  if (b.paymentFlow === 'supplier_collects')
    return <span title="The supplier charged the customer and owes Ridean our earnings (settled on the supplier account)"><Pill tone="info">Receivable</Pill></span>;
  return <span title="Ridean charged the customer and owes the supplier their share (settled on the supplier account)"><Pill tone="warn">Payable</Pill></span>;
}

function TwoToneBar({ commission, markup, max }: { commission: number; markup: number; max: number }) {
  const w = (v: number) => (max > 0 ? `${Math.max(0, (v / max) * 100)}%` : '0%');
  return (
    <div className="az-bar dark" style={{ display: 'flex' }} aria-hidden="true">
      <i style={{ width: w(commission), background: 'var(--gold)', borderRadius: markup ? '4px 0 0 4px' : 4 }} />
      <i style={{ width: w(markup), background: 'var(--ok)', borderRadius: commission ? '0 4px 4px 0' : 4 }} />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="az-row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', flexWrap: 'nowrap' }}>
      <i style={{ width: 9, height: 9, borderRadius: 2, background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function FlowBox({ icon, tone, title, desc, value }: { icon: string; tone: 'gold' | 'info'; title: string; desc: string; value: string }) {
  return (
    <div className="az-row" style={{ flexWrap: 'nowrap', gap: 14, padding: 16, borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--line)' }}>
      <div className="az-ic" style={{ width: 42, height: 42, ...(tone === 'info' ? { background: 'rgba(127,178,255,.12)', color: 'var(--info)' } : {}) }}><Icon name={icon} size={19} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5 }}>{title}</div>
        <div className="az-muted" style={{ fontSize: 12, marginTop: 2, lineHeight: 1.35 }}>{desc}</div>
      </div>
      <div className="az-serif" style={{ fontSize: 26, fontWeight: 600, color: tone === 'info' ? 'var(--info)' : 'var(--cream)', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Price & earnings calculator (client-side, same formula as the API: priceQuote)

function AffixInput({ label, prefix, suffix, value, onChange }: { label: string; prefix?: string; suffix?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="az-field">
      <span>{label}</span>
      <div className="az-in-affix">
        {prefix && <span className="affix">{prefix}</span>}
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
        {suffix && <span className="affix">{suffix}</span>}
      </div>
    </label>
  );
}

function Calculator() {
  const [inv, setInv] = useState<'net' | 'gross'>('gross');
  const [price, setPrice] = useState('100.00');
  const [comm, setComm] = useState('10');
  const [mkType, setMkType] = useState<'percent' | 'fixed'>('percent');
  const [mk, setMk] = useState('8');
  const [payer, setPayer] = useState<'ridean' | 'supplier'>('ridean');

  const num = (s: string) => {
    const n = Number(s.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const q = priceQuote(Math.round(num(price) * 100), {
    inventoryType: inv,
    commissionPct: num(comm),
    markupType: mkType,
    markupValue: mkType === 'fixed' ? Math.round(num(mk) * 100) : num(mk),
    paymentFlow: payer === 'supplier' ? 'supplier_collects' : 'corporate_card',
    settlementCycle: 'monthly',
  });
  const flow =
    q.collectedBy === 'supplier'
      ? `The supplier charges the customer ${m(q.customerPrice)} and owes Ridean ${m(q.owedToRidean)}.`
      : `Ridean charges the customer ${m(q.customerPrice)} and pays the supplier ${m(q.owedToSupplier)}.`;

  const line = (l: string, v: string, strong = false) => (
    <div className="az-between" style={{ fontSize: 14.5, flexWrap: 'nowrap' }}>
      <span className="az-muted">{l}</span>
      <span style={{ fontWeight: strong ? 600 : 400 }}>{v}</span>
    </div>
  );

  return (
    <Card
      title="Price & earnings calculator"
      desc="See the customer price and what Ridean earns before you set a supplier’s markup."
      action={<span className="az-row az-muted" style={{ gap: 8, fontSize: 12.5 }}><Icon name="ledger" size={16} style={{ color: 'var(--gold)' }} />Try any supplier rate</span>}
    >
      <div className="az-grid az-g2" style={{ gap: 24, marginTop: 16 }}>
        <div className="az-stack" style={{ gap: 14 }}>
          <div className="az-field">
            <span>Supplier rate type</span>
            <Seg label="Supplier rate type" options={[['net', 'Net rate'], ['gross', 'Gross rate']]} value={inv} onChange={setInv} />
          </div>
          <div className="az-form" style={{ gap: 12 }}>
            <AffixInput label="Supplier price" prefix="$" value={price} onChange={setPrice} />
            {inv === 'gross' && <AffixInput label="Commission from supplier" suffix="%" value={comm} onChange={setComm} />}
          </div>
          <div className="az-field">
            <span>Our markup</span>
            <div className="az-row" style={{ gap: 10, flexWrap: 'nowrap' }}>
              <Seg label="Markup type" style={{ width: 150, flexShrink: 0 }} options={[['percent', '%'], ['fixed', '$']]} value={mkType} onChange={setMkType} />
              <div className="az-in-affix" style={{ flex: 1, minWidth: 0 }}>
                {mkType === 'fixed' && <span className="affix">$</span>}
                <input aria-label={mkType === 'fixed' ? 'Markup in dollars' : 'Markup percent'} inputMode="decimal" value={mk} onChange={(e) => setMk(e.target.value)} />
                {mkType === 'percent' && <span className="affix">%</span>}
              </div>
            </div>
          </div>
          <div className="az-field">
            <span>Who charges the customer?</span>
            <Seg label="Who charges the customer" options={[['ridean', 'Ridean'], ['supplier', 'Supplier']]} value={payer} onChange={setPayer} />
          </div>
        </div>
        <div className="az-stack" style={{ gap: 10, padding: 20, borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--line)', alignSelf: 'stretch' }} aria-live="polite">
          {line('Customer pays', m(q.customerPrice), true)}
          {line('Commission', m(q.commission))}
          {line('Markup', m(q.markup))}
          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
          <div className="az-between" style={{ alignItems: 'baseline', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: 15 }}>Ridean earns</span>
            <span className="az-serif az-ok" style={{ fontSize: 30, fontWeight: 600 }}>{m(q.earnings)}</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: '#C9D2CB', padding: 12, borderRadius: 10, background: 'var(--on)' }}>{flow}</div>
        </div>
      </div>
    </Card>
  );
}

const EXPLAIN = [
  ['tag', 'Net-rate supplier', 'The supplier gives us their net cost. We add our markup and pay the supplier the net cost.', 'Earnings = markup'],
  ['trend', 'Gross-rate supplier', 'The supplier gives us a gross price and pays us a commission on it. We can add a markup on top.', 'Earnings = commission + markup'],
  ['swap', 'Supplier charges the customer', 'The customer’s card is charged on the supplier’s merchant account. The supplier then owes us our share.', 'Supplier owes us commission + markup'],
] as const;

// ---------------------------------------------------------------------------

export default function EarningsPage() {
  const { api } = useRidean();
  const toast = useToast();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('month');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const range = useMemo(() => periodRange(period), [period]);
  const q = useMemo(() => rangeQuery(range), [range]);

  const earnings = useLoad(() => api.admin.earnings(q) as unknown as Promise<Earnings>, [api, q]);
  const suppliers = useLoad(() => api.admin.suppliers(), [api]);
  const rows = useLoad(() => api.admin.transactions({ ...q, page }), [api, q, page]);

  const byId = useMemo(() => new Map((suppliers.data ?? []).map((s) => [s.id, s] as const)), [suppliers.data]);
  const inventoryOf = (b: Booking): 'net' | 'gross' => byId.get(b.supplierId)?.terms.inventoryType ?? (b.price.commission > 0 ? 'gross' : 'net');
  const visible = (rows.data?.items ?? []).filter((b) =>
    filter === 'all' ? true : filter === 'collects' ? b.paymentFlow === 'supplier_collects' : inventoryOf(b) === filter,
  );

  const e = earnings.data;
  const c = e?.currency ?? 'USD';
  const phrase = periodPhrase(period as Period, range);
  const maxSup = Math.max(0, ...(e?.bySupplier ?? []).map((r) => r.earnings));

  async function exportCsv() {
    setExporting(true);
    try {
      downloadText(`ridean-earnings-${range.from}-to-${range.to}.csv`, await api.admin.transactionsCsv(q));
      toast('Transactions exported (CSV)');
    } catch (err) {
      toast((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHead title="Earnings" sub="Commission and markup across all suppliers" searchPlaceholder="Search bookings, suppliers…" />

      {!e ? (
        <Loading error={earnings.error} onRetry={earnings.reload} height={160} />
      ) : (
        <div className="az-grid az-g4">
          <Kpi label="Gross booking value" icon="wallet" value={m(e.totals.gross, c)} sub="What customers paid" />
          <Kpi label="Commission earned" icon="tag" value={m(e.totals.commission, c)} sub="From gross-rate suppliers" tone="up" />
          <Kpi label="Markup earned" icon="trend" value={m(e.totals.markup, c)} sub="Added on top of supplier rates" tone="up" />
          <Kpi label="Total earnings" icon="star" value={m(e.totals.earnings, c)} sub={`Commission + markup · ${e.totals.takeRate}% take rate`} tone="gold" />
        </div>
      )}

      <div className="az-grid az-g-main">
        <Card
          title="Earnings by supplier"
          desc={`${phrase.charAt(0).toUpperCase()}${phrase.slice(1)} · commission and markup per supplier`}
          action={<div className="az-row" style={{ gap: 18 }}><Legend color="var(--gold)" label="Commission" /><Legend color="var(--ok)" label="Markup" /></div>}
        >
          {!e ? (
            <Loading error={earnings.error} height={160} />
          ) : e.bySupplier.length === 0 ? (
            <Empty title="No earnings yet">No confirmed bookings {phrase}.</Empty>
          ) : (
            <div className="az-stack" style={{ gap: 14, marginTop: 16 }}>
              {e.bySupplier.map((r) => (
                <div key={r.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 180px) minmax(60px, 1fr) auto', gap: 16, alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                    <div className="az-muted" style={{ fontSize: 12, marginTop: 1 }}>{termsLine(byId.get(r.key))}</div>
                  </div>
                  <TwoToneBar commission={r.commission} markup={r.markup} max={maxSup} />
                  <div style={{ fontWeight: 600, fontSize: 15, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{m(r.earnings, c)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Money flow" desc="Who owes whom for this period’s bookings">
          {!e ? (
            <Loading error={earnings.error} height={160} />
          ) : (
            <div className="az-stack" style={{ gap: 12, marginTop: 16 }}>
              <FlowBox icon="send" tone="gold" title="We owe suppliers" desc="Net cost or gross minus commission · paid by card or ACH" value={m(e.totals.owedToSuppliers, c)} />
              <FlowBox icon="download" tone="info" title="Suppliers owe us" desc="Commission + markup where the supplier charged the customer" value={m(e.totals.owedToRidean, c)} />
              <Link href="/suppliers" className="az-btn g block"><Icon name="ledger" size={18} />Open supplier accounts</Link>
            </div>
          )}
        </Card>
      </div>

      <div className="az-between">
        <Chips label="Filter bookings" options={FILTERS} value={filter} onChange={setFilter} />
        <div className="az-row">
          <SelectBtn label="Period" value={period} onChange={(v) => { setPeriod(v as (typeof PERIODS)[number]); setPage(1); }} minWidth={140}>
            {PERIODS.map((p) => <option key={p} value={p}>{PERIOD_LABEL[p]}</option>)}
          </SelectBtn>
          <Btn icon="download" onClick={exportCsv} disabled={exporting}>{exporting ? 'Exporting…' : 'Export'}</Btn>
        </div>
      </div>

      {!rows.data ? (
        <Loading error={rows.error} onRetry={rows.reload} />
      ) : (
        <div className="az-stack" style={{ gap: 14 }}>
          <div className="az-twrap">
            {visible.length === 0 ? (
              <Empty title="No bookings">{rows.data.items.length ? 'No bookings on this page match the filter.' : `No bookings ${phrase}.`}</Empty>
            ) : (
              <table className="az-t compact">
                <thead>
                  <tr>
                    <th>Booking</th><th>Supplier</th><th>Rate</th><th className="num">Supplier price</th><th className="num">Commission</th><th className="num">Markup</th>
                    <th className="num">Customer paid</th><th className="num">Our earnings</th><th>Paid via</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => {
                    const p = b.price;
                    const sub = [svc(b.service), routeShort(b)].filter(Boolean).join(' · ');
                    return (
                      <tr key={b.id}>
                        <td><Link href={`/bookings/${b.id}`} className="az-ref">#{b.reference}</Link></td>
                        <td>{b.supplierName}<span className="sub">{sub}</span></td>
                        <td><RateTag type={inventoryOf(b)} /></td>
                        <td className="num">{m(p.supplierPrice, p.currency)}</td>
                        <td className="num">{p.commission ? m(p.commission, p.currency) : '—'}</td>
                        <td className="num">{p.markup ? m(p.markup, p.currency) : '—'}</td>
                        <td className="num">{m(p.customerPrice, p.currency)}</td>
                        <td className="num az-ok" style={{ fontWeight: 700 }}>{m(p.earnings, p.currency)}</td>
                        <td><PaidVia flow={b.paymentFlow} /></td>
                        <td><MoneyStatus b={b} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <Pager page={rows.data.page} pageSize={rows.data.pageSize} total={rows.data.total} onPage={setPage} noun="bookings" />
        </div>
      )}

      <Calculator />

      <Card title="How earnings are calculated">
        <div className="az-grid az-g3" style={{ gap: 14, marginTop: 16 }}>
          {EXPLAIN.map(([icon, t, body, f]) => (
            <div key={t} className="az-stack" style={{ gap: 8, padding: 16, borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--line)' }}>
              <div className="az-row" style={{ gap: 10, fontSize: 15, fontWeight: 600, flexWrap: 'nowrap' }}><Icon name={icon} size={18} style={{ color: 'var(--gold)' }} />{t}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#C9D2CB' }}>{body}</div>
              <div className="az-gold" style={{ fontSize: 12.5, fontWeight: 600 }}>{f}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

