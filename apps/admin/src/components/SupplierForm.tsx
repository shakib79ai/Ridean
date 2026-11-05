'use client';

import { useState, type FormEvent } from 'react';
import { SERVICE_LIST, type Supplier, type SupplierCommercialTerms } from '@ridean/shared';

export type SupplierInput = Omit<Supplier, 'id'> & { config?: Record<string, unknown> };

const ADAPTERS = ['generic_http', 'curb', 'sixt', 'hertz', 'priceline', 'mozio'];
export const EMPTY_SUPPLIER: SupplierInput = {
  code: '', name: '', adapter: 'generic_http', services: [], active: true, contactEmail: undefined,
  terms: { inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 10, paymentFlow: 'ach_debit', settlementCycle: 'weekly', paymentTerms: 'Net 7' },
  config: {},
};

export function SupplierForm({ initial, isNew, onSave }: { initial: SupplierInput; isNew?: boolean; onSave: (v: SupplierInput) => Promise<void> }) {
  const [v, setV] = useState<SupplierInput>(initial);
  const [config, setConfig] = useState(JSON.stringify(initial.config ?? {}, null, 2));
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const t = v.terms;
  const setT = (patch: Partial<SupplierCommercialTerms>) => setV({ ...v, terms: { ...t, ...patch } });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const parsed = config.trim() ? JSON.parse(config) : {};
      await onSave({ ...v, contactEmail: v.contactEmail || undefined, config: parsed });
      setMsg('Saved.');
    } catch (err) {
      setMsg(err instanceof SyntaxError ? 'Adapter config must be valid JSON.' : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rd-stack" style={{ ['--gap' as string]: '18px' }}>
      <div className="form-grid">
        <label>Name<input className="inp" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></label>
        <label>Code<input className="inp" required pattern="[a-z0-9_]{2,30}" disabled={!isNew} value={v.code} onChange={(e) => setV({ ...v, code: e.target.value })} title="lowercase letters, numbers and _" /></label>
        <label>API adapter<select className="inp" value={v.adapter} onChange={(e) => setV({ ...v, adapter: e.target.value })}>{ADAPTERS.map((a) => <option key={a}>{a}</option>)}</select></label>
        <label>Contact email<input className="inp" type="email" value={v.contactEmail ?? ''} onChange={(e) => setV({ ...v, contactEmail: e.target.value })} /></label>
        <label>Status<select className="inp" value={v.active ? '1' : '0'} onChange={(e) => setV({ ...v, active: e.target.value === '1' })}><option value="1">Active</option><option value="0">Paused</option></select></label>
      </div>
      <div>
        <div className="rd-muted" style={{ fontSize: 12.5, marginBottom: 6 }}>Services</div>
        <div className="rd-row" style={{ flexWrap: 'wrap' }}>
          {SERVICE_LIST.map((s) => {
            const on = v.services.includes(s.key);
            return <button type="button" key={s.key} className="rd-chip" aria-pressed={on} onClick={() => setV({ ...v, services: on ? v.services.filter((x) => x !== s.key) : [...v.services, s.key] })}>{s.label}</button>;
          })}
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 10px' }}>Commercial terms</h3>
        <div className="form-grid">
          <label>Rate type<select className="inp" value={t.inventoryType} onChange={(e) => setT({ inventoryType: e.target.value as 'net' | 'gross' })}><option value="net">Net rate (we add markup)</option><option value="gross">Gross rate (supplier pays commission)</option></select></label>
          <label>Commission %<input className="inp" type="number" min={0} max={100} step="0.1" disabled={t.inventoryType === 'net'} value={t.commissionPct} onChange={(e) => setT({ commissionPct: Number(e.target.value) })} /></label>
          <label>Markup type<select className="inp" value={t.markupType} onChange={(e) => setT({ markupType: e.target.value as 'percent' | 'fixed' })}><option value="percent">Percent</option><option value="fixed">Fixed amount (cents)</option></select></label>
          <label>Markup {t.markupType === 'percent' ? '%' : '(cents)'}<input className="inp" type="number" min={0} step={t.markupType === 'percent' ? '0.1' : '1'} value={t.markupValue} onChange={(e) => setT({ markupValue: Number(e.target.value) })} /></label>
          <label>Payment flow<select className="inp" value={t.paymentFlow} onChange={(e) => setT({ paymentFlow: e.target.value as SupplierCommercialTerms['paymentFlow'] })}><option value="corporate_card">Ridean pays by corporate card</option><option value="ach_debit">Ridean pays by ACH</option><option value="supplier_collects">Supplier charges customer</option></select></label>
          <label>Settlement cycle<select className="inp" value={t.settlementCycle} onChange={(e) => setT({ settlementCycle: e.target.value as SupplierCommercialTerms['settlementCycle'] })}><option value="per_booking">Per booking</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
          <label>Payment terms<input className="inp" value={t.paymentTerms ?? ''} onChange={(e) => setT({ paymentTerms: e.target.value })} placeholder="e.g. Net 15" /></label>
        </div>
      </div>
      <label className="rd-stack" style={{ ['--gap' as string]: '6px', fontSize: 12.5, color: '#9fb3aa' }}>
        Adapter config (JSON — endpoints and field mappings for generic_http; credentials stay in environment variables)
        <textarea className="inp" rows={6} value={config} onChange={(e) => setConfig(e.target.value)} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }} />
      </label>
      {msg && <div className="rd-note">{msg}</div>}
      <div><button className="rd-btn btn-sm" disabled={busy}>{isNew ? 'Create supplier' : 'Save changes'}</button></div>
    </form>
  );
}
