'use client';

// Grouped rows of the Transaction report (expandable group cards → child rows → transactions).
import Link from 'next/link';
import type { ReportTotals, Supplier, TransactionReport } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Empty, Icon, LetterTile, Loading, serviceIcon, StatusPill } from '@/components/ui';
import { d, FLOW_LABEL, m, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';
import { routeShort } from './shared';

export const REP_COLS = 'minmax(200px,1.5fr) 64px repeat(7,minmax(0,1fr)) 24px';
export const REP_MIN_WIDTH = 1060;

const cell = (v: number, c: string, color?: string, bold = false) => (
  <div style={{ textAlign: 'right', color: v ? color : 'var(--muted)', fontWeight: bold && v ? 700 : 400, fontVariantNumeric: 'tabular-nums' }}>{v ? m(v, c) : '—'}</div>
);

/** The 8 numeric cells shared by headers, groups, children and the grand total. */
export function RepCells({ t, c }: { t: ReportTotals; c: string }) {
  return (
    <>
      <div style={{ textAlign: 'right' }}>{t.bookings.toLocaleString()}</div>
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{m(t.gross, c)}</div>
      {cell(t.supplierCost, c, 'var(--soft)')}
      {cell(t.commission, c, 'var(--soft)')}
      {cell(t.markup, c, 'var(--soft)')}
      {cell(t.earnings, c, 'var(--ok)', true)}
      {cell(t.owedToSuppliers, c, 'var(--yellow)', true)}
      {cell(t.owedToRidean, c, 'var(--info)', true)}
    </>
  );
}

export function RepHeader() {
  const h = ['', 'Bookings', 'Gross value', 'Supplier cost', 'Commission', 'Markup', 'Our earnings', 'Owed to them', 'Owed to us', ''];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: REP_COLS, gap: 10, padding: '0 20px 10px', fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }} aria-hidden="true">
      {h.map((x, i) => <div key={i} style={{ textAlign: i > 0 && i < 9 ? 'right' : undefined }}>{x}</div>)}
    </div>
  );
}

function Lead({ big, kind, k, label, sub }: { big: boolean; kind: 'supplier' | 'service'; k: string; label: string; sub: string }) {
  const size = big ? 44 : 36;
  return (
    <div className="az-row" style={{ gap: 12, flexWrap: 'nowrap', minWidth: 0 }}>
      {kind === 'supplier' ? (
        <LetterTile name={label} size={size} />
      ) : (
        <div className="az-ic" style={{ width: size, height: size, borderRadius: big ? 12 : 10, background: big ? 'var(--on)' : 'rgba(217,169,79,.14)' }}><Icon name={serviceIcon(k)} size={18} /></div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={big ? { fontSize: 17, fontWeight: 600, fontFamily: 'var(--serif)' } : { fontSize: 15, fontWeight: 600 }}>{label}</div>
        <div className="az-muted" style={{ fontSize: 12.5, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

const summaryStyle: React.CSSProperties = { listStyle: 'none', cursor: 'pointer' };
const rowGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: REP_COLS, gap: 10, alignItems: 'center', fontSize: 14 };

/** Latest transactions for one supplier × service pair (loaded when the row opens). */
function Transactions({ supplierId, service, q, c, supplier }: { supplierId: string; service: string; q: { from: string; to: string }; c: string; supplier?: Supplier }) {
  const { api } = useRidean();
  const rows = useLoad(() => api.admin.transactions({ ...q, supplierId, service }), [api, q.from, q.to, supplierId, service]);
  if (!rows.data) return <Loading error={rows.error} onRetry={rows.reload} height={90} />;
  const items = rows.data.items;
  return (
    <>
      <div className="az-between" style={{ marginBottom: 10 }}>
        <div className="az-muted" style={{ fontSize: 13 }}>
          {items.length < rows.data.total ? `Latest ${items.length} of ${rows.data.total} transactions` : 'Transactions'} · {svc(service)} via {supplier?.name ?? 'supplier'}
          {supplier && ` · paid via ${FLOW_LABEL[supplier.terms.paymentFlow] ?? supplier.terms.paymentFlow}`}
        </div>
        <Link href={`/suppliers/${supplierId}`} className="az-a">Supplier account</Link>
      </div>
      {items.length === 0 ? (
        <Empty title="No transactions" />
      ) : (
        <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflowX: 'auto' }}>
          <table className="az-t compact">
            <thead>
              <tr>
                <th>Booking · date · trip</th><th className="num">Supplier price</th><th className="num">Commission</th><th className="num">Markup</th>
                <th className="num">Our earnings</th><th className="num">Owed to them</th><th className="num">Owed to us</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const p = b.price;
                return (
                  <tr key={b.id}>
                    <td style={{ whiteSpace: 'normal', minWidth: 220, maxWidth: 300 }}>
                      <Link href={`/bookings/${b.id}`} className="az-ref">#{b.reference}</Link> <span className="az-muted" style={{ fontSize: 12.5 }}>· {d(b.createdAt)}</span>
                      <span className="sub">{[`${b.passenger.firstName} ${b.passenger.lastName}`.trim(), routeShort(b), `customer paid ${m(p.customerPrice, p.currency)}`].filter(Boolean).join(' · ')}</span>
                    </td>
                    <td className="num">{m(p.supplierPrice, p.currency)}</td>
                    <td className="num" style={{ color: 'var(--soft)' }}>{p.commission ? m(p.commission, p.currency) : '—'}</td>
                    <td className="num" style={{ color: 'var(--soft)' }}>{p.markup ? m(p.markup, p.currency) : '—'}</td>
                    <td className="num az-ok" style={{ fontWeight: 700 }}>{m(p.earnings, p.currency)}</td>
                    <td className="num">{p.owedToSupplier ? m(p.owedToSupplier, p.currency) : '—'}</td>
                    <td className="num">{p.owedToRidean ? m(p.owedToRidean, p.currency) : '—'}</td>
                    <td><StatusPill status={b.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

type Group = TransactionReport['groups'][number];

export function RepGroup({
  g, groupBy, c, q, phrase, suppliers, open, onToggle, openChildren, onToggleChild,
}: {
  g: Group; groupBy: 'supplier' | 'service'; c: string; q: { from: string; to: string }; phrase: string;
  suppliers: Map<string, Supplier>; open: boolean; onToggle: (o: boolean) => void; openChildren: Set<string>; onToggleChild: (key: string, o: boolean) => void;
}) {
  const childKind = groupBy === 'supplier' ? 'service' : 'supplier';
  const sup = groupBy === 'supplier' ? suppliers.get(g.key) : undefined;
  const n = g.children.length;
  const sub =
    groupBy === 'supplier'
      ? [`${n} service${n === 1 ? '' : 's'}`, sup && (sup.terms.inventoryType === 'gross' ? 'Gross rate' : 'Net rate'), sup && (FLOW_LABEL[sup.terms.paymentFlow] ?? sup.terms.paymentFlow)].filter(Boolean).join(' · ')
      : `${n} supplier${n === 1 ? '' : 's'}`;
  return (
    <details
      open={open}
      onToggle={(e) => e.target === e.currentTarget && onToggle(e.currentTarget.open)}
      style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}
    >
      <summary style={{ ...summaryStyle, padding: '18px 20px', background: 'linear-gradient(180deg,#12352B,#0E2A22)' }}>
        <div style={rowGrid}>
          <Lead big kind={groupBy} k={g.key} label={g.label} sub={sub} />
          <RepCells t={g.totals} c={c} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--muted)', transform: open ? 'rotate(180deg)' : undefined }}><Icon name="chevronDown" size={18} /></div>
        </div>
      </summary>
      {g.children.map((ch) => {
        const key = `${g.key}|${ch.key}`;
        const chOpen = openChildren.has(key);
        const supplierId = groupBy === 'supplier' ? g.key : ch.key;
        const service = groupBy === 'supplier' ? ch.key : g.key;
        return (
          <details key={key} open={chOpen} onToggle={(e) => e.target === e.currentTarget && onToggleChild(key, e.currentTarget.open)} style={{ borderTop: '1px solid var(--line)' }}>
            <summary style={{ ...summaryStyle, padding: '14px 20px' }}>
              <div style={rowGrid}>
                <Lead big={false} kind={childKind} k={ch.key} label={ch.label} sub={`${ch.totals.bookings.toLocaleString()} booking${ch.totals.bookings === 1 ? '' : 's'} ${phrase}`} />
                <RepCells t={ch.totals} c={c} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--muted)', transform: chOpen ? 'rotate(180deg)' : undefined }}><Icon name="chevronDown" size={18} /></div>
              </div>
            </summary>
            {chOpen && (
              <div style={{ padding: '0 20px 18px' }}>
                <Transactions supplierId={supplierId} service={service} q={q} c={c} supplier={suppliers.get(supplierId)} />
              </div>
            )}
          </details>
        );
      })}
    </details>
  );
}

export function RepGrandTotal({ t, c, phrase, label }: { t: ReportTotals; c: string; phrase: string; label: string }) {
  return (
    <div style={{ background: 'var(--on)', border: '1px solid var(--gold)', borderRadius: 16, padding: '18px 20px' }}>
      <div style={rowGrid}>
        <div className="az-row" style={{ gap: 12, flexWrap: 'nowrap', minWidth: 0 }}>
          <div className="az-ic" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(246,196,40,.16)', color: 'var(--yellow)' }}><Icon name="trend" size={21} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--serif)' }}>{label}</div>
            <div className="az-muted" style={{ fontSize: 12.5, marginTop: 2 }}>Grand total · {phrase}</div>
          </div>
        </div>
        <RepCells t={t} c={c} />
        <div />
      </div>
    </div>
  );
}

