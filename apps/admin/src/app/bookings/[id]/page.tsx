'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Loading, PageHead } from '@/components/Shell';
import { Status } from '@/components/Status';
import { dt, FLOW_LABEL, m, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const NEXT = ['confirmed', 'driver_assigned', 'in_progress', 'completed', 'cancelled', 'failed'];

export default function BookingAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { api } = useRidean();
  const { data: b, error, setData } = useLoad(() => api.admin.booking(id), [api, id]);
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!b) return <Loading error={error} />;
  const p = b.price;
  const c = p.currency;

  async function apply() {
    if (!status || !b) return;
    if (status === 'cancelled' && !confirm('Cancel this booking with the supplier and refund the customer?')) return;
    setBusy(true);
    setMsg(null);
    try {
      setData(await api.admin.updateBookingStatus(b.id, status));
      setMsg('Status updated.');
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link href="/bookings" className="rd-link" style={{ fontSize: 14 }}>← Bookings</Link>
      <PageHead title={b.reference} sub={`${svc(b.service)} · ${b.supplierName}${b.supplierReference ? ` · supplier ref ${b.supplierReference}` : ''}`}>
        <Status s={b.status} />
      </PageHead>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="rd-card rd-stack">
          <h3 style={{ margin: 0 }}>Trip</h3>
          <dl className="kv">
            <dt>Pickup</dt><dd>{b.pickup.address}</dd>
            {b.dropoff && <><dt>Drop-off</dt><dd>{b.dropoff.address}</dd></>}
            <dt>Pickup time</dt><dd>{b.pickupAt ? dt(b.pickupAt) : 'As soon as possible'}</dd>
            {b.tripType && <><dt>Trip type</dt><dd>{b.tripType === 'return' ? `Return · ${dt(b.returnAt)}` : 'One way'}</dd></>}
            {b.flightNumber && <><dt>Flight</dt><dd>{b.flightNumber}</dd></>}
            <dt>Vehicle</dt><dd>{b.vehicle.name} ({b.vehicle.class})</dd>
            <dt>Passenger</dt><dd>{b.passenger.firstName} {b.passenger.lastName}<br />{b.passenger.email} · {b.passenger.phone}</dd>
            <dt>Created</dt><dd>{dt(b.createdAt)}</dd>
          </dl>
        </div>
        <div className="rd-stack">
          <div className="rd-card rd-stack">
            <h3 style={{ margin: 0 }}>Money</h3>
            <dl className="kv">
              <dt>Payment flow</dt><dd>{FLOW_LABEL[b.paymentFlow]} · collected by {p.collectedBy === 'ridean' ? 'Ridean' : 'supplier'}</dd>
              <dt>Supplier price</dt><dd>{m(p.supplierPrice, c)}</dd>
              <dt>Commission</dt><dd>{m(p.commission, c)}</dd>
              <dt>Markup</dt><dd>{m(p.markup, c)}</dd>
              <dt>Customer paid</dt><dd><strong>{m(p.customerPrice, c)}</strong></dd>
              <dt>Ridean earnings</dt><dd className="pos">{m(p.earnings, c)}</dd>
              <dt>Supplier keeps</dt><dd>{m(p.supplierPayable, c)}</dd>
              <dt>Owed</dt><dd>{p.owedToSupplier ? <span className="pos">We owe supplier {m(p.owedToSupplier, c)}</span> : <span className="neg">Supplier owes us {m(p.owedToRidean, c)}</span>}</dd>
            </dl>
          </div>
          <div className="rd-card rd-stack">
            <h3 style={{ margin: 0 }}>Update status</h3>
            <div className="rd-row">
              <select className="inp" value={status} onChange={(e) => setStatus(e.target.value)} style={{ flex: 1 }}>
                <option value="">Choose status…</option>
                {NEXT.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <button className="rd-btn btn-sm" disabled={!status || busy} onClick={apply}>Apply</button>
            </div>
            {msg && <div className="rd-note">{msg}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
