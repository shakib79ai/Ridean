'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Bar, Btn, Card, Delta, Empty, Icon, Kpi, Loading, PageHead, StatusPill, serviceIcon } from '@/components/ui';
import { RevenueChart } from '@/components/ops/RevenueChart';
import { longDate, passengerName, RefLink, ServiceCell, vehicleClassLabel } from '@/components/ops/bits';
import { m, pct, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

export default function Dashboard() {
  const { api } = useRidean();
  const router = useRouter();
  const { data, error, reload } = useLoad(() => api.admin.dashboard(), [api]);

  const head = (
    <PageHead
      title="Dashboard"
      sub={`Overview for ${longDate()}`}
      actions={<Btn kind="y" icon="plus" onClick={() => router.push('/bookings/new')}>New booking</Btn>}
      searchPlaceholder="Search bookings, customers…"
    />
  );
  if (!data) return <>{head}<Loading error={error} onRetry={reload} height={420} /></>;

  const c = data.currency;
  const total30 = data.revenueSeries.reduce((a, s) => a + s.revenue, 0);
  const services = [...data.byService].filter((s) => s.bookings > 0).sort((a, b) => b.bookings - a.bookings);
  const topService = services[0]?.bookings ?? 0;
  const monthBookings = data.month.bookings || services.reduce((a, s) => a + s.bookings, 0);
  const at = data.attention;
  const attention = [
    at.openMessages > 0 && {
      href: '/inbox', icon: 'inbox', tone: 'var(--gold)',
      title: `${at.openMessages} open contact ${at.openMessages === 1 ? 'message' : 'messages'}`,
      sub: 'From the website contact form — awaiting a reply',
    },
    at.failedBookings > 0 && {
      href: '/bookings?status=failed', icon: 'alert', tone: 'var(--bad)',
      title: `${at.failedBookings} failed ${at.failedBookings === 1 ? 'booking' : 'bookings'}`,
      sub: 'In the last 7 days',
    },
    at.payableToSuppliers > 0 && {
      href: '/settlements', icon: 'bank', tone: 'var(--ok)',
      title: 'Supplier payouts due',
      sub: `${m(at.payableToSuppliers, c)} owed to ${at.suppliersOwed} ${at.suppliersOwed === 1 ? 'supplier' : 'suppliers'}`,
    },
  ].filter(Boolean) as { href: string; icon: string; tone: string; title: string; sub: string }[];

  return (
    <>
      {head}

      <div className="az-grid az-g4">
        <Kpi label="Today's bookings" icon="calendar" value={data.bookingsToday.toLocaleString()} sub={<Delta now={data.bookingsToday} before={data.bookingsYesterday} />} />
        <Kpi label="Active trips" icon="car" value={data.activeTrips.toLocaleString()} sub={`across ${data.activeSuppliers} active ${data.activeSuppliers === 1 ? 'supplier' : 'suppliers'}`} />
        <Kpi label="Revenue today" icon="trend" value={m(data.revenueToday, c)} sub={<Delta now={data.revenueToday} before={data.revenueYesterday} />} />
        <Kpi label="Earnings this month" icon="wallet" value={m(data.month.earnings, c)} sub={`Take rate ${pct(data.month.takeRate)}`} tone="gold" />
      </div>

      <div className="az-grid az-g-main">
        <Card>
          <div className="az-stack" style={{ gap: 10 }}>
            <div className="az-between">
              <h2 className="az-h2">Revenue — last 30 days</h2>
              <span className="az-muted" style={{ fontSize: 14 }}>{m(total30, c)} total</span>
            </div>
            <RevenueChart series={data.revenueSeries} currency={c} />
          </div>
        </Card>

        <Card title="Bookings by service">
          {services.length === 0 ? (
            <Empty title="No bookings yet">Service mix appears once this month has bookings.</Empty>
          ) : (
            <div className="az-stack" style={{ gap: 16, marginTop: 16 }}>
              {services.map((s) => (
                <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div className="az-between" style={{ fontSize: 14, flexWrap: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name={serviceIcon(s.key)} size={16} className="az-gold" />
                      {svc(s.key)}
                    </span>
                    <span style={{ fontWeight: 600 }} title={`${s.bookings} bookings`}>{monthBookings ? Math.round((s.bookings / monthBookings) * 100) : 0}%</span>
                  </div>
                  <Bar value={s.bookings} max={topService} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="az-grid az-g-main" style={{ alignItems: 'start' }}>
        <div className="az-stack" style={{ gap: 12 }}>
          <div className="az-section-title">
            <h2>Recent bookings</h2>
            <Link href="/bookings" className="az-a" style={{ fontSize: 14 }}>View all →</Link>
          </div>
          <div className="az-twrap">
            {data.recent.length === 0 ? (
              <Empty title="No bookings yet" action={<Btn kind="y" size="sm" icon="plus" onClick={() => router.push('/bookings/new')}>New booking</Btn>}>
                Bookings from the website, the app and this panel appear here.
              </Empty>
            ) : (
              <table className="az-t">
                <thead>
                  <tr><th>Booking</th><th>Customer</th><th>Service</th><th>Status</th><th className="num">Amount</th></tr>
                </thead>
                <tbody>
                  {data.recent.map((b) => (
                    <tr key={b.id}>
                      <td><RefLink b={b} /></td>
                      <td>{passengerName(b)}</td>
                      <td><ServiceCell service={b.service} /></td>
                      <td><StatusPill status={b.status} /></td>
                      <td className="num" style={{ fontWeight: 600 }}>{m(b.price.customerPrice, b.price.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="az-stack">
          <Card title="Needs attention">
            {attention.length === 0 ? (
              <div className="az-list-row" style={{ paddingBottom: 0 }}>
                <div className="az-ic" style={{ width: 40, height: 40, color: 'var(--ok)' }}><Icon name="checkCircle" size={19} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>All clear</div>
                  <div className="az-muted" style={{ fontSize: 13, marginTop: 2 }}>No open messages, failed bookings or payouts due.</div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 4 }}>
                {attention.map((a) => (
                  <Link key={a.href} href={a.href} className="az-list-row">
                    <div className="az-ic" style={{ width: 40, height: 40, color: a.tone }}><Icon name={a.icon} size={19} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{a.title}</div>
                      <div className="az-muted" style={{ fontSize: 13, marginTop: 2 }}>{a.sub}</div>
                    </div>
                    <Icon name="chevronRight" size={18} className="az-muted" />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title="Top vehicle tiers">
            {data.topVehicles.length === 0 ? (
              <Empty title="No trips yet">The most-booked vehicle classes this month appear here.</Empty>
            ) : (
              <div style={{ marginTop: 4 }}>
                {data.topVehicles.map((v, i) => (
                  <div key={`${v.vehicleClass}-${v.service}`} className="az-list-row" style={{ gap: 12, padding: '11px 0' }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, background: 'var(--on)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {vehicleClassLabel(v.vehicleClass)}
                        {i === 0 && <span className="az-badge">Most popular</span>}
                      </div>
                      <div className="az-muted" style={{ fontSize: 12.5 }}>{svc(v.service)}</div>
                    </div>
                    <span style={{ fontWeight: 600 }} title={`${v.bookings} bookings`}>{v.share}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
