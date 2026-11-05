'use client';

import { useState, type FormEvent } from 'react';
import { toMinor } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';

/** Record a settlement: money we paid a supplier, or money a supplier paid us. */
export function PaymentForm({ supplierId, suggested, onDone }: { supplierId: string; suggested?: number; onDone: () => void }) {
  const { api } = useRidean();
  const [direction, setDirection] = useState<'paid_to_supplier' | 'received_from_supplier'>((suggested ?? 0) < 0 ? 'received_from_supplier' : 'paid_to_supplier');
  const [amount, setAmount] = useState(suggested ? (Math.abs(suggested) / 100).toFixed(2) : '');
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState('ACH');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api.admin.recordPayment(supplierId, { amount: toMinor(Number(amount)), direction, reference, method, note: note || undefined });
      setReference('');
      setNote('');
      setMsg('Payment recorded.');
      onDone();
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rd-stack">
      <div className="seg2">
        <button type="button" aria-pressed={direction === 'paid_to_supplier'} onClick={() => setDirection('paid_to_supplier')}>We paid supplier</button>
        <button type="button" aria-pressed={direction === 'received_from_supplier'} onClick={() => setDirection('received_from_supplier')}>Supplier paid us</button>
      </div>
      <div className="form-grid">
        <label>Amount<input className="inp" type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
        <label>Method<select className="inp" value={method} onChange={(e) => setMethod(e.target.value)}><option>ACH</option><option>Wire</option><option>Corporate card</option><option>Check</option><option>Offset</option></select></label>
        <label>Reference<input className="inp" required value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. ACH-2026-1104" /></label>
        <label>Note<input className="inp" value={note} onChange={(e) => setNote(e.target.value)} /></label>
      </div>
      {msg && <div className="rd-note">{msg}</div>}
      <div><button className="rd-btn btn-sm" disabled={busy}>Record payment</button></div>
    </form>
  );
}
