'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRidean } from '@ridean/web-core';
import type { Booking, BookingStatus } from '@ridean/shared';
import { C, Skeleton } from '@/components/site/ui';
import {
  EmptyCard, ErrorNote, Icon, ListRow, S, SectionHead, TripCard, fetchAllBookings, fmtDay, isCancelled, isUpcoming, money, serviceMeta, signedMoney, tripTime, useLoad, type IconName,
} from '@/components/account/kit';

const SHORTCUTS = [
  { href: '/ride', img: '/img/design/seat.png', title: 'Ride', text: 'Premium rides for every occasion.' },
  { href: '/airport-transfer', img: '/img/design/airport.png', title: 'Airport transfer', text: 'Seamless journeys to and from the airport.' },
  { href: '/rent', img: '/img/design/business.png', title: 'Rent a car', text: 'Freedom to move on your terms.' },
];
const NEXT_STATUSES: BookingStatus[] = ['confirmed', 'driver_assigned', 'payment_authorised'];

function greeting(h: number) {
  if (h < 5) return 'Good evening';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

interface Activity { key: string; icon: IconName; title: string; date: string; amount: number; currency: string; href?: string }

export default function DashboardPage() {
  const { api, user } = useRidean();
  const [hello, setHello] = useState('Welcome back');
  useEffect(() => setHello(greeting(new Date().getHours())), []);

  const { data, error, loading } = useLoad(async () => {
    const [bookings, wallet] = await Promise.all([fetchAllBookings(api), api.wallet()]);
    return { bookings, wallet };
  }, [api]);

  const now = Date.now();
  const year = new Date().getFullYear();
  const bookings = data?.bookings ?? [];
  const thisYear = bookings.filter((b) => !isCancelled(b) && new Date(b.pickupAt ?? b.createdAt).getFullYear() === year);
  const airport = thisYear.filter((b) => b.service === 'airport_transfer').length;
  const upcoming = bookings.filter((b) => isUpcoming(b, now));
  const next = bookings
    .filter((b) => NEXT_STATUSES.includes(b.status) && b.pickupAt && new Date(b.pickupAt).getTime() > now)
    .sort((a, b) => tripTime(a) - tripTime(b))[0] as Booking | undefined;

  const activity: Activity[] = [];
  if (data) {
    const refs = new Set(bookings.map((b) => b.reference));
    for (const b of bookings) {
      if (b.status === 'failed' || b.status === 'pending_payment') continue;
      const m = serviceMeta(b.service);
      activity.push({ key: `b-${b.id}`, icon: m.icon, title: `${m.label} · ${b.dropoff?.address ?? b.vehicle?.name ?? b.supplierName}`, date: b.createdAt, amount: -b.price.customerPrice, currency: b.price.currency, href: `/bookings/${b.id}` });
    }
    for (const t of data.wallet.transactions) {
      // Wallet debits for bookings are already listed as the booking itself.
      const m = /^Booking (\S+)$/.exec(t.description);
      if (t.amount < 0 && m && refs.has(m[1])) continue;
      activity.push({ key: `w-${t.id}`, icon: t.amount >= 0 ? (t.description.startsWith('Refund') ? 'refund' : 'plus') : 'minus', title: t.description, date: t.createdAt, amount: t.amount, currency: data.wallet.currency, href: '/account/wallet' });
    }
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  const recent = activity.slice(0, 5);

  const tile = (label: string, value: string, sub?: string) => (
    <div style={{ ...S.panel, padding: 20 }}>
      <div style={{ fontSize: 13, color: C.muted }}>{label}</div>
      <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, fontWeight: 600, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: C.gold, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={S.page}>
      <div className="dz-acct-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={S.h1}>{hello}{user?.firstName ? `, ${user.firstName}` : ''}</h1>
          <div style={{ marginTop: 6 }}><p style={S.sub}>Where would you like to go today?</p></div>
        </div>
      </div>

      <div className="dz-cols-3">
        {SHORTCUTS.map((s) => (
          <Link key={s.href} href={s.href} className="dz-card-link" style={{ display: 'flex', alignItems: 'center', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', height: 112 }}>
            <div style={{ width: 104, height: '100%', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, padding: '0 12px 0 14px' }}>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 19, fontWeight: 600, lineHeight: 1.15 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: C.soft, marginTop: 4, lineHeight: 1.35 }}>{s.text}</div>
            </div>
            <div style={{ paddingRight: 14 }}><Icon name="right" size={20} color={C.cream} /></div>
          </Link>
        ))}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading && !data ? (
        <div className="dz-cols-3"><Skeleton h={112} /><Skeleton h={112} /><Skeleton h={112} /></div>
      ) : data ? (
        <div className="dz-cols-3">
          {tile('Trips this year', String(thisYear.length), `${airport} airport transfer${airport === 1 ? '' : 's'}`)}
          {tile('Wallet balance', money(data.wallet.balance, data.wallet.currency))}
          {tile('Upcoming trips', String(upcoming.length), upcoming.length ? undefined : 'Nothing booked yet')}
        </div>
      ) : null}

      <div className="dz-acct-dash">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <SectionHead title="Next trip" link={<Link href="/account/trips" style={S.goldLink}>All trips</Link>} />
          {loading && !data ? (
            <Skeleton h={130} />
          ) : next ? (
            <TripCard b={next} />
          ) : data ? (
            <EmptyCard text="No upcoming trips." action={<Link href="/ride" style={S.goldLink}>Book a ride</Link>} />
          ) : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <SectionHead title="Recent activity" link={<Link href="/account/wallet" style={S.goldLink}>Wallet</Link>} />
          {loading && !data ? (
            <Skeleton h={200} />
          ) : data && recent.length === 0 ? (
            <EmptyCard text="No activity yet — your trips and wallet top-ups will show here." />
          ) : data ? (
            <div style={{ ...S.panel, padding: '2px 16px' }}>
              {recent.map((a, i) => (
                <ListRow
                  key={a.key}
                  icon={a.icon}
                  href={a.href}
                  title={a.title}
                  sub={fmtDay(a.date)}
                  last={i === recent.length - 1}
                  right={<span style={{ fontSize: 15, fontWeight: 600, color: a.amount > 0 ? C.ok : C.cream, whiteSpace: 'nowrap' }}>{signedMoney(a.amount, a.currency)}</span>}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
