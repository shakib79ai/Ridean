'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import type { BookingLiveStatus, BookingStatus } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Card, Empty, Field, Icon, Loading, Modal, PageHead, Pill, StatusPill, serviceIcon, useToast } from '@/components/ui';
import { Divider, KvRow, passengerName, SETTABLE_STATUS, vehicleClassLabel } from '@/components/ops/bits';
import { dt, FLOW_LABEL, m, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const PAID_WITH: Record<string, string> = { card: 'Card', wallet: 'Ridean wallet', business: 'Business account', supplier: 'Paid to supplier', invoice: 'Invoice' };
const SENDER: Record<string, string> = { customer: 'Customer', chauffeur: 'Chauffeur', system: 'Ridean' };

export default function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { api } = useRidean();
  const toast = useToast();
  const { data: b, error, reload, setData } = useLoad(() => api.admin.booking(id), [api, id]);
  const live = useLoad(async () => api.admin.bookingStatus(id), [api, id, b?.status]);
  const messages = useLoad(() => api.admin.bookingMessages(id), [api, id]);
  const [next, setNext] = useState<BookingStatus | ''>('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!b) return <><PageHead title="Booking" /><Loading error={error} onRetry={reload} height={420} /></>;
  const p = b.price;
  const c = p.currency;

  async function apply() {
    if (!next || !b) return;
    setBusy(true);
    try {
      setData(await api.admin.updateBookingStatus(b.id, next));
      toast(next === 'cancelled' ? `Booking ${b.reference} cancelled` : 'Status updated');
      setNext('');
      setConfirmCancel(false);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const closed = b.status === 'cancelled' || b.status === 'completed';

  return (
    <>
      <PageHead
        title={b.reference}
        sub={`${svc(b.service)} · booked ${dt(b.createdAt)}`}
        actions={<StatusPill status={b.status} />}
      />

      <div><Link href="/bookings" className="az-a"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="chevronLeft" size={16} />All bookings</span></Link></div>

      <div className="az-grid az-g-main" style={{ alignItems: 'start' }}>
        {/* ---------------- left column */}
        <div className="az-stack">
          <Card title="Route">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 14 }}>
              <RouteStop icon="pin" label={b.service === 'rent' ? 'Pickup location' : 'Pickup'} value={b.pickup.address} extra={b.pickup.terminal ? `Terminal ${b.pickup.terminal}` : undefined} />
              {b.dropoff && <RouteStop icon="pin" label={b.service === 'rent' ? 'Return location' : 'Destination'} value={b.dropoff.address} extra={b.dropoff.terminal ? `Terminal ${b.dropoff.terminal}` : undefined} last />}
            </div>
            <Divider />
            <KvRow label="Pickup time">{b.pickupAt ? dt(b.pickupAt) : 'As soon as possible'}</KvRow>
            {b.tripType && <KvRow label="Trip">{b.tripType === 'return' ? 'Return' : 'One way'}</KvRow>}
            {b.returnAt && <KvRow label={b.service === 'rent' ? 'Return time' : 'Return pickup'}>{dt(b.returnAt)}</KvRow>}
            {b.flightNumber && <KvRow label="Flight">{b.flightNumber}</KvRow>}
            {b.passengers != null && <KvRow label="Passengers">{b.passengers}</KvRow>}
            {b.luggage != null && <KvRow label="Checked bags">{b.luggage}</KvRow>}
          </Card>

          <div className="az-grid az-g2">
            <Card title="Passenger">
              <div className="az-stack" style={{ gap: 4, marginTop: 12, fontSize: 14.5 }}>
                <strong style={{ fontWeight: 600 }}>{passengerName(b)}</strong>
                <a href={`mailto:${b.passenger.email}`} className="az-a" style={{ fontWeight: 500 }}>{b.passenger.email}</a>
                {b.passenger.phone && <a href={`tel:${b.passenger.phone}`} style={{ color: 'var(--soft)' }}>{b.passenger.phone}</a>}
              </div>
            </Card>
            <Card title="Vehicle & supplier">
              <div className="az-row" style={{ marginTop: 12, flexWrap: 'nowrap' }}>
                <div className="az-ic"><Icon name={serviceIcon(b.service)} size={18} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{b.vehicle.name}</div>
                  <div className="az-muted" style={{ fontSize: 12.5 }}>{vehicleClassLabel(b.vehicle.class)} · {b.vehicle.passengers} seats · {b.vehicle.bags} bags</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 14 }}>
                <Link href={`/suppliers/${b.supplierId}`} className="az-a" style={{ fontSize: 14.5 }}>{b.supplierName}</Link>
                {b.supplierReference && <div className="az-muted" style={{ fontSize: 12.5, marginTop: 2 }}>Supplier ref {b.supplierReference}</div>}
              </div>
            </Card>
          </div>

          <Card title="Notes">
            {b.notes || b.cancelReason ? (
              <div className="az-stack" style={{ gap: 10, marginTop: 12 }}>
                {b.notes && <p style={{ margin: 0, fontSize: 14.5, whiteSpace: 'pre-wrap', color: 'var(--soft)' }}>{b.notes}</p>}
                {b.cancelReason && <div className="az-note">Cancellation reason: {b.cancelReason}</div>}
              </div>
            ) : (
              <p className="az-muted" style={{ margin: '10px 0 0', fontSize: 14 }}>No notes on this booking.</p>
            )}
          </Card>

          <Card title="Messages" desc="Relayed between the customer and the chauffeur">
            {!messages.data ? (
              <div style={{ marginTop: 12 }}><Loading error={messages.error} onRetry={messages.reload} height={80} /></div>
            ) : messages.data.length === 0 ? (
              <Empty title="No messages">Nothing has been sent on this booking.</Empty>
            ) : (
              <div className="az-stack" style={{ gap: 10, marginTop: 14 }}>
                {messages.data.map((msg) => (
                  <div key={msg.id} style={{ alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: msg.sender === 'customer' ? 'var(--on)' : 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px' }}>
                    <div className="az-muted" style={{ fontSize: 12, marginBottom: 4 }}>{SENDER[msg.sender] ?? msg.sender} · {dt(msg.createdAt)}</div>
                    <div style={{ fontSize: 14.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{msg.body}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ---------------- right column */}
        <div className="az-stack">
          <Card title="Live status" action={<button type="button" className="az-a" onClick={live.reload}>Refresh</button>}>
            {!live.data ? (
              <div style={{ marginTop: 12 }}><Loading error={live.error} onRetry={live.reload} height={120} /></div>
            ) : (
              <div className="az-stack" style={{ gap: 14, marginTop: 14 }}>
                {live.data.driver?.name ? (
                  <div className="az-row" style={{ flexWrap: 'nowrap' }}>
                    <div className="az-ic"><Icon name="user" size={18} /></div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14.5 }}>{live.data.driver.name}</div>
                      <div className="az-muted" style={{ fontSize: 12.5 }}>
                        {[live.data.driver.vehicle, live.data.driver.plate, live.data.driver.phone].filter(Boolean).join(' · ') || 'Chauffeur assigned'}
                      </div>
                    </div>
                    {live.data.etaMinutes != null && <Pill tone="info">{live.data.etaMinutes} min away</Pill>}
                  </div>
                ) : (
                  <div className="az-note">No chauffeur assigned yet — the supplier reports one closer to pickup.</div>
                )}
                <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {live.data.events.map((e, i) => (
                    <li key={e.key} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i === live.data!.events.length - 1 ? 0 : 14 }}>
                      <span style={{ width: 20, height: 20, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: e.done ? 'var(--yellow)' : 'var(--on)', color: 'var(--ink)', border: e.done ? 'none' : '1px solid var(--line)' }}>
                        {e.done && <Icon name="check" size={12} />}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: e.done ? 'var(--cream)' : 'var(--muted)' }}>{e.label}</div>
                        {e.at && <div className="az-muted" style={{ fontSize: 12 }}>{dt(e.at)}</div>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>

          <Card title="Money">
            <div style={{ marginTop: 10 }}>
              <KvRow label="Supplier price">{m(p.supplierPrice, c)}</KvRow>
              <KvRow label="Commission">{m(p.commission, c)}</KvRow>
              <KvRow label="Markup">{m(p.markup, c)}</KvRow>
              {!!b.discount && <KvRow label={`Discount${b.promoCode ? ` (${b.promoCode})` : ''}`}>−{m(b.discount, c)}</KvRow>}
              {!!b.tip && <KvRow label="Chauffeur tip">{m(b.tip, c)}</KvRow>}
              <Divider />
              <div className="az-between" style={{ alignItems: 'baseline', flexWrap: 'nowrap' }}>
                <span style={{ fontSize: 15 }}>Customer price</span>
                <span className="az-serif" style={{ fontSize: 26, fontWeight: 600 }}>{m(p.customerPrice, c)}</span>
              </div>
              <KvRow label="Ridean earnings"><span className="az-ok">{m(p.earnings, c)}</span></KvRow>
              <KvRow label="Supplier keeps">{m(p.supplierPayable, c)}</KvRow>
              <KvRow label="Balance">
                {p.owedToSupplier ? <>We owe the supplier {m(p.owedToSupplier, c)}</> : p.owedToRidean ? <>Supplier owes us {m(p.owedToRidean, c)}</> : 'Settled'}
              </KvRow>
              <Divider />
              <KvRow label="Payment method">{b.paymentMethod ? PAID_WITH[b.paymentMethod] ?? b.paymentMethod : '—'}</KvRow>
              <KvRow label="Collected by">{p.collectedBy === 'ridean' ? 'Ridean' : b.supplierName}</KvRow>
              <KvRow label="Payment flow">{FLOW_LABEL[b.paymentFlow] ?? b.paymentFlow}</KvRow>
            </div>
          </Card>

          <Card title="Change status" desc={closed ? 'This booking is closed.' : 'Updates the booking for the customer and in reports.'}>
            <div className="az-stack" style={{ gap: 12, marginTop: 14 }}>
              <Field label="New status">
                <select className="az-in" value={next} onChange={(e) => setNext(e.target.value as BookingStatus | '')} disabled={busy}>
                  <option value="">Choose a status…</option>
                  {SETTABLE_STATUS.filter(([k]) => k !== b.status).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </Field>
              <Btn
                kind={next === 'cancelled' ? 'danger' : 'y'}
                block
                disabled={!next || busy}
                onClick={() => (next === 'cancelled' ? setConfirmCancel(true) : void apply())}
              >
                {busy ? 'Saving…' : next === 'cancelled' ? 'Cancel booking' : 'Update status'}
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      {confirmCancel && (
        <Modal title="Cancel this booking?" onClose={() => !busy && setConfirmCancel(false)}>
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--soft)', lineHeight: 1.55 }}>
            {b.reference} will be cancelled with {b.supplierName}
            {p.collectedBy === 'ridean' ? ` and ${m(p.customerPrice, c)} refunded to ${passengerName(b)}` : ''}. This can’t be undone.
          </p>
          <div className="az-row" style={{ justifyContent: 'flex-end' }}>
            <Btn onClick={() => setConfirmCancel(false)} disabled={busy}>Keep booking</Btn>
            <Btn kind="danger" onClick={() => void apply()} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel booking'}</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

function RouteStop({ icon, label, value, extra, last }: { icon: string; label: string; value: string; extra?: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 14, paddingBottom: last ? 4 : 14 }}>
      <div className="az-ic" style={{ width: 36, height: 36 }}><Icon name={icon} size={17} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="az-muted" style={{ fontSize: 12 }}>{label}</div>
        <div style={{ fontSize: 15, overflowWrap: 'anywhere' }}>{value}</div>
        {extra && <div className="az-muted" style={{ fontSize: 12.5 }}>{extra}</div>}
      </div>
    </div>
  );
}
