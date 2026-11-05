'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRidean } from '@ridean/web-core/src/api-context';
import { ServiceSelect, SupplierSelect } from '@/components/Filters';
import { Loading, PageHead } from '@/components/Shell';
import { Status } from '@/components/Status';
import { dt, FLOW_LABEL, m, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const STATUSES = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress', 'completed', 'cancelled', 'failed'];

export default function BookingsPage() {
  const { api } = useRidean();
  const router = useRouter();
  const [f, setF] = useState({ q: '', status: '', service: '', supplierId: '', page: 1 });
  const set = (k: keyof typeof f, v: string | number) => setF((o) => ({ ...o, [k]: v, page: k === 'page' ? Number(v) : 1 }));
  const suppliers = useLoad(() => api.admin.suppliers(), [api]);
  const { data, error } = useLoad(() => api.admin.bookings(f), [api, f]);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (
    <>
      <PageHead title="Bookings" sub={data ? `${data.total} bookings` : undefined} />
      <div className="filters">
        <input className="inp" placeholder="Reference, name or email" value={f.q} onChange={(e) => set('q', e.target.value)} style={{ minWidth: 240 }} />
        <select className="inp" value={f.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <ServiceSelect value={f.service} onChange={(v) => set('service', v)} />
        <SupplierSelect suppliers={suppliers.data ?? []} value={f.supplierId} onChange={(v) => set('supplierId', v)} />
      </div>
      {!data ? <Loading error={error} /> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Reference</th><th>Created</th><th>Service</th><th>Supplier</th><th>Passenger</th><th>Pickup</th><th>Payment</th><th>Status</th><th className="num">Customer</th><th className="num">Earnings</th></tr></thead>
            <tbody>
              {data.items.length === 0 && <tr><td colSpan={10} className="rd-muted">No bookings match these filters.</td></tr>}
              {data.items.map((b) => (
                <tr key={b.id} className="click" onClick={() => router.push(`/bookings/${b.id}`)}>
                  <td><strong>{b.reference}</strong></td>
                  <td>{dt(b.createdAt)}</td>
                  <td>{svc(b.service)}</td>
                  <td>{b.supplierName}</td>
                  <td>{b.passenger.firstName} {b.passenger.lastName}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.pickup.address}</td>
                  <td>{FLOW_LABEL[b.paymentFlow]}</td>
                  <td><Status s={b.status} /></td>
                  <td className="num">{m(b.price.customerPrice, b.price.currency)}</td>
                  <td className="num">{m(b.price.earnings, b.price.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pager">
            Page {data.page} of {pages}
            <button className="rd-btn rd-btn-dark btn-sm" disabled={data.page <= 1} onClick={() => set('page', data.page - 1)}>Previous</button>
            <button className="rd-btn rd-btn-dark btn-sm" disabled={data.page >= pages} onClick={() => set('page', data.page + 1)}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}
