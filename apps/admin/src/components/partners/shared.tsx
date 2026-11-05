'use client';

// Helpers shared by the supplier-facing pages (Drivers & Suppliers, Settlements, Supplier accounts).
import { useState, type FormEvent } from 'react';
import { toMinor, type Supplier } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, ErrorText, Field, Modal, Seg, useToast } from '@/components/ui';
import { m } from '@/lib/format';

export type SupplierRow = Supplier & { balance: number };

export const PAYMENT_METHODS = ['ACH', 'Wire', 'Corporate card', 'Check', 'Offset'] as const;

/** Staff permissions as enforced by the API (admin always passes). */
export function useStaff() {
  const { user } = useRidean();
  const role = user?.role;
  return { isAdmin: role === 'admin', isFinance: role === 'finance' || role === 'admin' };
}

/** yyyy-mm-dd bounds of a calendar month: offset 0 = this month (to today), -1 = last month. */
export function monthBounds(offset = 0) {
  const now = new Date();
  const f = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = offset === 0 ? now : new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  return { from: iso(f), to: iso(end), label: f.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), start: f, end };
}

/** RFC 4180 CSV from a header row + data rows. */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = c == null ? '' : String(c);
          return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(','),
    )
    .join('\n');
}

/** Minor units → plain decimal string for CSV cells (no currency symbol). */
export const dec = (minor: number) => (minor / 100).toFixed(2);

/** Balance text in the supplier's voice: "We owe $x" (gold) / "Owes us $x" (info) / "Settled". */
export function BalanceText({ v, style }: { v: number; style?: React.CSSProperties }) {
  if (v > 0) return <span className="az-gold" style={style}>We owe {m(v)}</span>;
  if (v < 0) return <span className="az-info" style={style}>Owes us {m(-v)}</span>;
  return <span className="az-muted" style={style}>Settled</span>;
}

/** Record a settlement — money we paid a supplier, or money a supplier paid us (finance role). */
export function PaymentModal({ supplier, onClose, onDone }: { supplier: { id: string; name: string; balance: number }; onClose: () => void; onDone: () => void }) {
  const { api } = useRidean();
  const toast = useToast();
  const [direction, setDirection] = useState<'paid_to_supplier' | 'received_from_supplier'>(supplier.balance < 0 ? 'received_from_supplier' : 'paid_to_supplier');
  const [amount, setAmount] = useState(supplier.balance ? (Math.abs(supplier.balance) / 100).toFixed(2) : '');
  const [method, setMethod] = useState<string>('ACH');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const minor = toMinor(Number(amount));
    if (!(minor > 0)) return setErr('Enter an amount greater than zero.');
    setBusy(true);
    setErr(null);
    try {
      await api.admin.recordPayment(supplier.id, { amount: minor, direction, reference: reference.trim(), method, note: note.trim() || undefined });
      toast(direction === 'paid_to_supplier' ? `Payment to ${supplier.name} recorded` : `Receipt from ${supplier.name} recorded`);
      onDone();
      onClose();
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Settle with ${supplier.name}`} onClose={onClose}>
      <p className="az-muted" style={{ margin: 0, fontSize: 13.5 }}>
        Current balance: {supplier.balance > 0 ? <span className="az-gold">we owe {m(supplier.balance)}</span> : supplier.balance < 0 ? <span className="az-info">{m(-supplier.balance)} due to us</span> : 'settled'}
      </p>
      <form onSubmit={submit} className="az-stack" style={{ gap: 14 }}>
        <Seg
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[['paid_to_supplier', 'We paid supplier'], ['received_from_supplier', 'Supplier paid us']] as const}
        />
        <div className="az-form">
          <Field label="Amount">
            <div className="az-in-affix">
              <span className="affix">$</span>
              <input type="number" step="0.01" min="0.01" required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" />
            </div>
          </Field>
          <Field label="Method">
            <select className="az-in" value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAYMENT_METHODS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Reference">
            <input className="az-in" required maxLength={60} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. ACH-2026-1104" />
          </Field>
          <Field label="Note (optional)">
            <input className="az-in" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
        <ErrorText>{err}</ErrorText>
        <div className="az-row" style={{ justifyContent: 'flex-end' }}>
          <Btn kind="o" onClick={onClose}>Cancel</Btn>
          <Btn kind="y" type="submit" icon="check" disabled={busy}>{busy ? 'Recording…' : 'Record payment'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

/** Manual ledger adjustment (finance role). */
export function AdjustmentModal({ supplier, onClose, onDone }: { supplier: { id: string; name: string }; onClose: () => void; onDone: () => void }) {
  const { api } = useRidean();
  const toast = useToast();
  const [side, setSide] = useState<'debit' | 'credit'>('debit');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const a = toMinor(Number(amount));
    if (!(a > 0)) return setErr('Enter an amount greater than zero.');
    setBusy(true);
    setErr(null);
    try {
      await api.admin.adjustment(supplier.id, { debit: side === 'debit' ? a : 0, credit: side === 'credit' ? a : 0, reference: reference.trim(), description: description.trim() });
      toast('Adjustment posted');
      onDone();
      onClose();
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Adjustment · ${supplier.name}`} onClose={onClose}>
      <form onSubmit={submit} className="az-stack" style={{ gap: 14 }}>
        <Seg label="Side" value={side} onChange={setSide} options={[['debit', 'Debit (we owe more)'], ['credit', 'Credit (they owe more)']] as const} />
        <div className="az-form">
          <Field label="Amount">
            <div className="az-in-affix">
              <span className="affix">$</span>
              <input type="number" step="0.01" min="0.01" required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" />
            </div>
          </Field>
          <Field label="Reference">
            <input className="az-in" required maxLength={60} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. ADJ-0032" />
          </Field>
          <Field label="Description" className="full">
            <input className="az-in" required maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
        <ErrorText>{err}</ErrorText>
        <div className="az-row" style={{ justifyContent: 'flex-end' }}>
          <Btn kind="o" onClick={onClose}>Cancel</Btn>
          <Btn kind="y" type="submit" icon="check" disabled={busy}>{busy ? 'Posting…' : 'Post adjustment'}</Btn>
        </div>
      </form>
    </Modal>
  );
}
