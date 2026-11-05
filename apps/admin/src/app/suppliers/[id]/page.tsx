'use client';

import { use, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toMinor, type Supplier } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { PaymentForm } from '@/components/PaymentForm';
import { Loading, PageHead } from '@/components/Shell';
import { Balance } from '@/components/Status';
import { SupplierForm, type SupplierInput } from '@/components/SupplierForm';
import { dt, m } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const KINDS = ['', 'booking', 'payment', 'refund', 'adjustment', 'invoice'];

function AdjustmentForm({ supplierId, onDone }: { supplierId: string; onDone: () => void }) {
  const { api } = useRidean();
  const [side, setSide] = useState<'debit' | 'credit'>('debit');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const a = toMinor(Number(amount));
      await api.admin.adjustment(supplierId, { debit: side === 'debit' ? a : 0, credit: side === 'credit' ? a : 0, reference, description });
      setAmount(''); setReference(''); setDescription('');
      setMsg('Adjustment posted.');
      onDone();
    } catch (err) {
      setMsg((err as Error).message);
    }
  }
  return (
    <form onSubmit={submit} className="rd-stack">
      <div className="seg2">
        <button type="button" aria-pressed={side === 'debit'} onClick={() => setSide('debit')}>Debit (we owe more)</button>
        <button type="button" aria-pressed={side === 'credit'} onClick={() => setSide('credit')}>Credit (they owe more)</button>
      </div>
      <div className="form-grid">
        <label>Amount<input className="inp" type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
        <label>Reference<input className="inp" required value={reference} onChange={(e) => setReference(e.target.value)} /></label>
        <label>Description<input className="inp" required value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      </div>
      {msg && <div className="rd-note">{msg}</div>}
      <div><button className="rd-btn rd-btn-ghost btn-sm">Post adjustment</button></div>
    </form>
  );
}

export default function SupplierDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { api, user } = useRidean();
  const [tab, setTab] = useState<'ledger' | 'settings'>('ledger');
  const [kind, setKind] = useState('');
  const sup = useLoad(() => api.admin.supplier(id) as Promise<Supplier & { balance: number; config?: Record<string, unknown> }>, [api, id]);
  const ledger = useLoad(() => api.admin.ledger(id, { kind: kind || undefined }), [api, id, kind]);
  const s = sup.data;
  if (!s) return <Loading error={sup.error} />;
  const finance = user?.role === 'finance' || user?.role === 'admin';
  const refresh = () => { sup.reload(); ledger.reload(); };
  const debits = (ledger.data ?? []).reduce((a, e) => a + e.debit, 0);
  const credits = (ledger.data ?? []).reduce((a, e) => a + e.credit, 0);

  return (
    <>
      <Link href="/suppliers" className="rd-link" style={{ fontSize: 14 }}>← Supplier accounts</Link>
      <PageHead title={s.name} sub={`${s.code} · ${s.adapter} adapter`}>
        <div className="kpi" style={{ padding: '10px 16px' }}><div className="l">Balance</div><div style={{ fontSize: 18, marginTop: 4 }}><Balance v={s.balance} fmt={(n) => m(n)} /></div></div>
      </PageHead>
      <div className="rd-tabs" style={{ marginBottom: 18 }}>
        <button aria-selected={tab === 'ledger'} onClick={() => setTab('ledger')}>Ledger &amp; payments</button>
        <button aria-selected={tab === 'settings'} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'settings' ? (
        <div className="rd-card">
          <SupplierForm
            initial={{ code: s.code, name: s.name, adapter: s.adapter, services: s.services, active: s.active, contactEmail: s.contactEmail, terms: s.terms, config: s.config ?? {} }}
            onSave={async (v: SupplierInput) => { const { code: _code, ...rest } = v; void _code; await api.admin.updateSupplier(s.id, rest); sup.reload(); }}
          />
        </div>
      ) : (
        <div className="rd-stack" style={{ ['--gap' as string]: '18px' }}>
          <div className="filters" style={{ marginBottom: 0 }}>
            <label>Entry type<select className="inp" value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map((k) => <option key={k} value={k}>{k ? k[0].toUpperCase() + k.slice(1) : 'All entries'}</option>)}</select></label>
            <span className="rd-muted" style={{ fontSize: 13, paddingBottom: 10 }}>Debits {m(debits)} · Credits {m(credits)}</span>
          </div>
          {!ledger.data ? <Loading error={ledger.error} /> : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Description</th><th className="num">Debit</th><th className="num">Credit</th><th className="num">Balance</th></tr></thead>
                <tbody>
                  {ledger.data.length === 0 && <tr><td colSpan={7} className="rd-muted">No ledger entries yet.</td></tr>}
                  {ledger.data.map((e) => (
                    <tr key={e.id}>
                      <td>{dt(e.createdAt)}</td><td style={{ textTransform: 'capitalize' }}>{e.kind}</td>
                      <td>{e.bookingId ? <Link className="rd-link" href={`/bookings/${e.bookingId}`}>{e.reference}</Link> : e.reference}</td>
                      <td style={{ whiteSpace: 'normal', maxWidth: 320 }}>{e.description}</td>
                      <td className="num">{e.debit ? m(e.debit, e.currency) : '—'}</td>
                      <td className="num">{e.credit ? m(e.credit, e.currency) : '—'}</td>
                      <td className="num"><Balance v={e.balance} fmt={(n) => m(n, e.currency)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="legend" style={{ margin: 0 }}>Debit = Ridean owes the supplier more (bookings we charged). Credit = we paid the supplier, or the supplier owes us commission/markup on bookings they charged.</p>
          {finance && (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="rd-card rd-stack"><h3 style={{ margin: 0 }}>Record payment</h3><PaymentForm supplierId={s.id} suggested={s.balance} onDone={refresh} /></div>
              <div className="rd-card rd-stack"><h3 style={{ margin: 0 }}>Manual adjustment</h3><AdjustmentForm supplierId={s.id} onDone={refresh} /></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
