'use client';

// Supplier accounts — master/detail (list of suppliers on the left, the selected account on the right).
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LedgerEntry, Supplier, SupplierCommercialTerms } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Card, Chips, Empty, ErrorText, Field, Icon, LetterTile, Loading, PageHead, RateTag, Toggle, useToast } from '@/components/ui';
import { AdjustmentModal, PaymentModal, dec, monthBounds, toCsv, useStaff, type SupplierRow } from '@/components/partners/shared';
import { FLOW_ICON, IntegrationFields, TermsFields, parseConfig } from '@/components/partners/TermsFields';
import { FLOW_LABEL, downloadText, m, rangeQuery, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

type Detail = Supplier & { balance: number; config?: Record<string, unknown> };
type Kind = 'all' | 'booking' | 'payment' | 'invoice' | 'adjustment';
const KINDS = [['all', 'All'], ['booking', 'Bookings'], ['payment', 'Payments'], ['invoice', 'Invoices'], ['adjustment', 'Adjustments']] as const;

const services = (s: Supplier) => s.services.map(svc).join(' & ') || 'No services';
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function SupplierAccounts({ selectedId }: { selectedId?: string }) {
  const { api } = useRidean();
  const { isAdmin } = useStaff();
  const router = useRouter();
  const list = useLoad(() => api.admin.suppliers() as Promise<SupplierRow[]>, [api]);
  const id = selectedId ?? list.data?.[0]?.id;

  return (
    <>
      <PageHead title="Supplier accounts" sub="Commercial terms, payment set-up and accounting history per supplier" />
      <div className="az-grid az-g-list" style={{ gap: 22 }}>
        <section className="az-card" style={{ padding: 18 }}>
          <div className="az-stack" style={{ gap: 14 }}>
            <div className="az-between">
              <h2 style={{ fontSize: 18 }}>Suppliers</h2>
              {list.data && <span className="az-muted" style={{ fontSize: 12.5 }}>{list.data.filter((s) => s.active).length} active</span>}
            </div>
            {!list.data ? (
              <Loading error={list.error} onRetry={list.reload} height={300} />
            ) : list.data.length === 0 ? (
              <Empty title="No suppliers yet">Add your first API partner.</Empty>
            ) : (
              <nav className="az-stack" style={{ gap: 10 }} aria-label="Suppliers">
                {list.data.map((s) => {
                  const on = s.id === id;
                  return (
                    <Link
                      key={s.id}
                      href={`/suppliers/${s.id}`}
                      aria-current={on ? 'page' : undefined}
                      className="az-opt"
                      style={{ alignItems: 'flex-start', padding: 14, ...(on ? { borderColor: 'var(--gold)', background: 'var(--on)' } : null) }}
                    >
                      <LetterTile name={s.name} size={42} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="az-row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 15, fontWeight: 600, overflowWrap: 'anywhere' }}>{s.name}</span>
                          <RateTag type={s.terms.inventoryType} />
                        </div>
                        <div className="az-muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                          {services(s)}
                          {!s.active && ' · Paused'}
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 6 }}>
                          {s.balance > 0 ? <span style={{ color: 'var(--yellow)' }}>We owe {m(s.balance)}</span> : s.balance < 0 ? <span className="az-info">Owes us {m(-s.balance)}</span> : <span className="az-muted">Settled</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            )}
            {isAdmin && <Btn kind="y" icon="plus" block onClick={() => router.push('/suppliers/new')}>Add supplier</Btn>}
          </div>
        </section>
        <div style={{ minWidth: 0 }}>
          {id ? <SupplierDetail key={id} id={id} onChanged={list.reload} /> : list.data ? <Card><Empty title="Select a supplier">Choose a supplier on the left to see its account.</Empty></Card> : <Loading height={400} />}
        </div>
      </div>
    </>
  );
}

function SupplierDetail({ id, onChanged }: { id: string; onChanged: () => void }) {
  const { api } = useRidean();
  const { isFinance } = useStaff();
  const toast = useToast();
  const sup = useLoad(() => api.admin.supplier(id) as Promise<Detail>, [api, id]);
  const earnings = useLoad(() => api.admin.transactionReport({ ...rangeQuery(monthBounds(0)), groupBy: 'supplier', supplierId: id }), [api, id]);
  const [kind, setKind] = useState<Kind>('all');
  const ledger = useLoad(() => api.admin.ledger(id, { kind: kind === 'all' ? undefined : kind }), [api, id, kind]);
  const [modal, setModal] = useState<'pay' | 'adjust' | null>(null);
  const [downloading, setDownloading] = useState(false);

  const s = sup.data;
  if (!s) return <Loading error={sup.error} onRetry={sup.reload} height={420} />;

  const refresh = () => {
    sup.reload();
    ledger.reload();
    onChanged();
  };
  const earned = earnings.data?.groups.find((g) => g.key === id)?.totals.earnings ?? earnings.data?.totals.earnings ?? 0;

  async function statement() {
    setDownloading(true);
    try {
      const all: LedgerEntry[] = await api.admin.ledger(id);
      const rows = [...all].reverse();
      const csv = toCsv([
        ['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance', 'Currency'],
        ...rows.map((e) => [e.createdAt.slice(0, 10), e.kind, e.reference, e.description, dec(e.debit), dec(e.credit), dec(e.balance), e.currency]),
      ]);
      downloadText(`${s!.code}-statement-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="az-stack" style={{ gap: 20 }}>
      {/* Header */}
      <section className="az-card">
        <div className="az-stack" style={{ gap: 16 }}>
          <div className="az-row" style={{ gap: 14, flexWrap: 'nowrap' }}>
            <LetterTile name={s.name} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="az-serif" style={{ fontSize: 24, fontWeight: 600, overflowWrap: 'anywhere' }}>{s.name}</div>
              <div className="az-muted" style={{ fontSize: 13, marginTop: 2, overflowWrap: 'anywhere' }}>
                {services(s)}
                {s.contactEmail ? ` · ${s.contactEmail}` : ''}
              </div>
            </div>
            <RateTag type={s.terms.inventoryType} />
          </div>
          <div className="az-grid az-g3" style={{ gap: 12 }}>
            <Tile label={s.balance > 0 ? `We owe ${s.name}` : s.balance < 0 ? `${s.name} owes us` : 'Balance'}>
              <span className={`az-serif ${s.balance > 0 ? 'az-gold' : s.balance < 0 ? 'az-info' : ''}`} style={{ fontSize: 24, fontWeight: 600 }}>{m(Math.abs(s.balance))}</span>
            </Tile>
            <Tile label="Earnings this month">
              {earnings.data ? <span className="az-serif az-ok" style={{ fontSize: 24, fontWeight: 600 }}>{m(earned)}</span> : earnings.error ? <span className="az-bad" style={{ fontSize: 13 }}>Couldn’t load</span> : <span className="az-muted">…</span>}
            </Tile>
            <Tile label="Paid / collected via">
              <span className="az-row" style={{ gap: 8, fontSize: 15, fontWeight: 600, marginTop: 4, flexWrap: 'nowrap' }}>
                <Icon name={FLOW_ICON[s.terms.paymentFlow] ?? 'card'} size={18} className="az-gold" />
                {FLOW_LABEL[s.terms.paymentFlow] ?? s.terms.paymentFlow}
              </span>
            </Tile>
          </div>
        </div>
      </section>

      <CommercialSettings key={JSON.stringify([s.terms, s.active, s.contactEmail])} s={s} onSaved={refresh} />

      {/* Accounting history */}
      <Card
        title="Accounting history"
        action={
          <div className="az-row" style={{ gap: 10 }}>
            <Btn kind="o" size="sm" icon="download" onClick={statement} disabled={downloading}>{downloading ? 'Preparing…' : 'Statement'}</Btn>
            {isFinance && <Btn kind="o" size="sm" icon="edit" onClick={() => setModal('adjust')}>Adjustment</Btn>}
            {isFinance && <Btn kind="g" size="sm" icon="plus" onClick={() => setModal('pay')}>Record payment</Btn>}
          </div>
        }
      >
        <div className="az-stack" style={{ gap: 12, marginTop: 6 }}>
          <p className="az-muted" style={{ margin: 0, fontSize: 13 }}>
            Every booking, payment, invoice and adjustment with this supplier. Debit: we owe the supplier more. Credit: we paid them, or they owe us.
          </p>
          <Chips label="Entry type" value={kind} onChange={setKind} options={KINDS} />
          {!ledger.data ? (
            <Loading error={ledger.error} onRetry={ledger.reload} height={180} />
          ) : ledger.data.length === 0 ? (
            <div className="az-twrap" style={{ background: 'transparent' }}><Empty title="No entries yet">{kind === 'all' ? 'Entries appear as bookings are confirmed and payments recorded.' : 'Nothing of this type yet.'}</Empty></div>
          ) : (
            <div className="az-twrap" style={{ background: 'transparent' }}>
              <table className="az-t compact">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th className="num">Debit</th>
                    <th className="num">Credit</th>
                    <th className="num">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.data.map((e) => (
                    <tr key={e.id}>
                      <td title={new Date(e.createdAt).toLocaleString()}>{shortDate(e.createdAt)}</td>
                      <td>{e.bookingId ? <Link className="az-ref" href={`/bookings/${e.bookingId}`}>{e.reference}</Link> : <span className="az-ref">{e.reference}</span>}</td>
                      <td style={{ whiteSpace: 'normal', minWidth: 200, maxWidth: 340 }}>{e.description}</td>
                      <td className="num">{e.debit ? m(e.debit, e.currency) : '—'}</td>
                      <td className="num">{e.credit ? m(e.credit, e.currency) : '—'}</td>
                      <td className="num" style={{ fontWeight: 600 }}>
                        {e.balance > 0 ? <span className="az-gold">{m(e.balance, e.currency)} owed</span> : e.balance < 0 ? <span className="az-info">{m(-e.balance, e.currency)} due to us</span> : m(0, e.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <IntegrationCard s={s} onSaved={refresh} />

      {modal === 'pay' && <PaymentModal supplier={s} onClose={() => setModal(null)} onDone={refresh} />}
      {modal === 'adjust' && <AdjustmentModal supplier={s} onClose={() => setModal(null)} onDone={refresh} />}
    </div>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--line)', minWidth: 0 }}>
      <div className="az-muted" style={{ fontSize: 12.5, marginBottom: 4, overflowWrap: 'anywhere' }}>{label}</div>
      {children}
    </div>
  );
}

function CommercialSettings({ s, onSaved }: { s: Detail; onSaved: () => void }) {
  const { api } = useRidean();
  const { isFinance } = useStaff();
  const toast = useToast();
  const [terms, setTerms] = useState<SupplierCommercialTerms>(s.terms);
  const [email, setEmail] = useState(s.contactEmail ?? '');
  const [active, setActive] = useState(s.active);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const disabled = !isFinance;

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      await api.admin.updateSupplier(s.id, { terms: { ...terms, paymentTerms: terms.paymentTerms?.trim() || undefined }, active, contactEmail: email.trim() || undefined });
      toast(`${s.name} settings saved`);
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Commercial settings"
      action={isFinance ? <Btn kind="y" size="sm" icon="check" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn> : undefined}
    >
      <div className="az-stack" style={{ gap: 14, marginTop: 6 }}>
        <p className="az-muted" style={{ margin: 0, fontSize: 13 }}>
          How this supplier gives us inventory, what we earn and how money moves{disabled ? ' — only admin and finance staff can change these.' : '.'}
        </p>
        <TermsFields terms={terms} onChange={(p) => setTerms((t) => ({ ...t, ...p }))} disabled={disabled} />
        <div className="az-form" style={{ gap: 12, alignItems: 'end' }}>
          <Field label="Contact email">
            <input className="az-in" type="email" value={email} disabled={disabled} onChange={(e) => setEmail(e.target.value)} placeholder="partners@supplier.com" />
          </Field>
          <div className="az-between" style={{ height: 48, padding: '0 14px', border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg)', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: 14.5 }}>Accepting bookings</span>
            <Toggle checked={active} onChange={setActive} label="Accepting bookings" disabled={disabled} />
          </div>
        </div>
        <ErrorText>{err}</ErrorText>
      </div>
    </Card>
  );
}

function IntegrationCard({ s, onSaved }: { s: Detail; onSaved: () => void }) {
  const { api } = useRidean();
  const { isFinance } = useStaff();
  const toast = useToast();
  const [adapter, setAdapter] = useState(s.adapter);
  const [config, setConfig] = useState(JSON.stringify(s.config ?? {}, null, 2));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = parseConfig(config);
    } catch (e) {
      return setErr((e as Error).message);
    }
    setBusy(true);
    try {
      await api.admin.updateSupplier(s.id, { adapter, config: parsed } as Parameters<typeof api.admin.updateSupplier>[1]);
      toast('Integration saved');
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="az-card">
      <details>
        <summary className="az-between" style={{ cursor: 'pointer', listStyle: 'none' }}>
          <div>
            <h2>Integration</h2>
            <p className="desc">Adapter <strong style={{ color: 'var(--cream)' }}>{s.adapter}</strong> · code <strong style={{ color: 'var(--cream)' }}>{s.code}</strong></p>
          </div>
          <Icon name="chevronDown" size={18} className="az-muted" />
        </summary>
        <div className="az-stack" style={{ gap: 14, marginTop: 16 }}>
          <IntegrationFields code={s.code} adapter={adapter} config={config} onAdapter={setAdapter} onConfig={setConfig} disabled={!isFinance} />
          <ErrorText>{err}</ErrorText>
          {isFinance && (
            <div>
              <Btn kind="o" icon="check" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save integration'}</Btn>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
