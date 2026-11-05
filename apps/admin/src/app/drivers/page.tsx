'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminDriver } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Avatar, Btn, Chips, Empty, Icon, Kpi, LetterTile, Loading, PageHead, Pill, RateTag, Seg, Toggle, useToast } from '@/components/ui';
import { BalanceText, useStaff, type SupplierRow } from '@/components/partners/shared';
import { FLOW_LABEL, m, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

type Tab = 'drivers' | 'suppliers';
type DriverFilter = 'all' | 'on' | 'off';

export default function DriversPage() {
  const { api } = useRidean();
  const { isAdmin } = useStaff();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('drivers');
  const drivers = useLoad(() => api.admin.drivers(), [api]);
  const suppliers = useLoad(() => api.admin.suppliers() as Promise<SupplierRow[]>, [api]);

  const sub = [
    drivers.data ? `${drivers.data.length} chauffeur${drivers.data.length === 1 ? '' : 's'}` : null,
    suppliers.data ? `${suppliers.data.length} supplier partner${suppliers.data.length === 1 ? '' : 's'}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <PageHead
        title="Drivers & Suppliers"
        sub={sub || undefined}
        actions={tab === 'suppliers' && isAdmin ? <Btn kind="y" icon="plus" onClick={() => router.push('/suppliers/new')}>Add supplier</Btn> : undefined}
      />
      <Seg label="View" value={tab} onChange={setTab} options={[['drivers', 'Drivers'], ['suppliers', 'Supplier partners']] as const} style={{ width: 420, maxWidth: '100%' }} />
      {tab === 'drivers' ? <DriversTab state={drivers} /> : <SuppliersTab state={suppliers} />}
    </>
  );
}

function DriversTab({ state }: { state: ReturnType<typeof useLoad<AdminDriver[]>> }) {
  const [filter, setFilter] = useState<DriverFilter>('all');
  const { data, error, reload } = state;
  if (!data) return <Loading error={error} onRetry={reload} />;

  const onDuty = data.filter((x) => x.onTrip).length;
  const supplierCount = new Set(data.map((x) => x.supplierId)).size;
  const rated = data.filter((x) => typeof x.rating === 'number' && x.rating > 0);
  const avg = rated.length ? rated.reduce((a, x) => a + (x.rating ?? 0), 0) / rated.length : null;
  const rows = data.filter((x) => (filter === 'all' ? true : filter === 'on' ? x.onTrip : !x.onTrip));

  return (
    <>
      <div className="az-grid az-g3">
        <Kpi label="On duty now" icon="car" value={onDuty.toLocaleString()} sub={`of ${data.length.toLocaleString()} chauffeurs seen`} tone="up" />
        <Kpi label="Chauffeurs seen" icon="users" value={data.length.toLocaleString()} sub={`across ${supplierCount} supplier${supplierCount === 1 ? '' : 's'}`} />
        <Kpi
          label="Average rating"
          icon="star"
          value={avg == null ? '—' : avg.toFixed(1)}
          sub={avg == null ? 'No ratings reported yet' : `from ${rated.length} rated chauffeur${rated.length === 1 ? '' : 's'}`}
        />
      </div>

      <Chips label="Filter chauffeurs" value={filter} onChange={setFilter} options={[['all', 'All'], ['on', 'On duty'], ['off', 'Off duty']] as const} />

      <div className="az-stack" style={{ gap: 12 }}>
        <div className="az-twrap">
          {rows.length === 0 ? (
            <Empty title={data.length ? 'No chauffeurs match this filter' : 'No chauffeurs yet'}>
              {data.length ? 'Try another filter.' : 'Chauffeurs show up once a partner assigns one to a Ridean trip.'}
            </Empty>
          ) : (
            <table className="az-t">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Supplier</th>
                  <th>Rating</th>
                  <th>Trips</th>
                  <th>Status</th>
                  <th aria-label="Last trip" />
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.key}>
                    <td>
                      <div className="az-row" style={{ gap: 12, flexWrap: 'nowrap' }}>
                        <Avatar name={x.name} size={36} />
                        <div>
                          {x.name}
                          {x.phone && <span className="sub">{x.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{[x.vehicle, x.plate].filter(Boolean).join(' · ') || <span className="az-muted">—</span>}</td>
                    <td>{x.supplierName}</td>
                    <td>
                      {typeof x.rating === 'number' && x.rating > 0 ? (
                        <span className="az-row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                          <Icon name="star" size={15} className="az-gold" />
                          {x.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="az-muted">—</span>
                      )}
                    </td>
                    <td>
                      {x.trips.toLocaleString()}
                      <span className="sub">{x.completedTrips.toLocaleString()} completed</span>
                    </td>
                    <td>{x.onTrip ? <Pill tone="ok">On duty</Pill> : <Pill tone="mut">Off duty</Pill>}</td>
                    <td className="num">
                      <Link className="az-a" href={`/bookings/${x.lastBookingId}`}>Last trip</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="az-muted" style={{ margin: 0, fontSize: 13 }}>
          Chauffeurs are managed by each partner. They appear here once a partner assigns them to a Ridean trip.
        </p>
      </div>
    </>
  );
}

function SuppliersTab({ state }: { state: ReturnType<typeof useLoad<SupplierRow[]>> }) {
  const { api } = useRidean();
  const { isFinance } = useStaff();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const { data, error, reload, setData } = state;
  if (!data) return <Loading error={error} onRetry={reload} />;

  async function setActive(s: SupplierRow, active: boolean) {
    setBusy(s.id);
    try {
      await api.admin.updateSupplier(s.id, { active });
      setData((list) => (list ?? []).map((x) => (x.id === s.id ? { ...x, active } : x)));
      toast(active ? `${s.name} is accepting bookings` : `${s.name} paused — no new bookings will be routed`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (data.length === 0) return <Empty title="No supplier partners yet">Add a supplier to start routing bookings.</Empty>;

  return (
    <>
      <p className="az-muted" style={{ margin: 0, fontSize: 13.5 }}>
        Toggle a partner off to stop routing new bookings to them.{!isFinance && ' Only admin and finance staff can change this.'}
      </p>
      <div className="az-grid az-g3">
        {data.map((s) => {
          const t = s.terms;
          return (
            <section key={s.id} className="az-card" style={{ padding: 20 }}>
              <div className="az-stack" style={{ gap: 14 }}>
                <div className="az-row" style={{ flexWrap: 'nowrap' }}>
                  <LetterTile name={s.name} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</div>
                    <div className="az-muted" style={{ fontSize: 13 }}>{s.services.map(svc).join(' · ') || 'No services'}</div>
                  </div>
                  {s.active ? <Pill tone="ok">Active</Pill> : <Pill tone="mut">Paused</Pill>}
                </div>
                <PartnerRow label="Rate">
                  <span className="az-row" style={{ gap: 8 }}>
                    <RateTag type={t.inventoryType} />
                    {t.inventoryType === 'gross' && <span>{t.commissionPct}% commission</span>}
                  </span>
                </PartnerRow>
                <PartnerRow label="Markup">{t.markupType === 'percent' ? `${t.markupValue}%` : m(t.markupValue)}</PartnerRow>
                <PartnerRow label="Payment flow">{FLOW_LABEL[t.paymentFlow] ?? t.paymentFlow}</PartnerRow>
                <PartnerRow label="Balance"><BalanceText v={s.balance} style={{ fontWeight: 600 }} /></PartnerRow>
                <div className="az-between" style={{ fontSize: 14 }}>
                  <span className="az-muted">Accepting bookings</span>
                  <Toggle checked={s.active} label={`Accepting bookings for ${s.name}`} disabled={!isFinance || busy === s.id} onChange={(v) => setActive(s, v)} />
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, textAlign: 'right' }}>
                  <Link className="az-a" href={`/suppliers/${s.id}`}>Manage</Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function PartnerRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="az-between" style={{ fontSize: 14, flexWrap: 'nowrap' }}>
      <span className="az-muted">{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{children}</span>
    </div>
  );
}
