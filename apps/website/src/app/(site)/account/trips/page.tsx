'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRidean } from '@ridean/web-core';
import { Arrow, Skeleton } from '@/components/site/ui';
import { EmptyCard, ErrorNote, PageHead, S, TripCard, fetchAllBookings, isCancelled, isUpcoming, tripTime, useLoad } from '@/components/account/kit';

type Tab = 'up' | 'past' | 'cancelled';
const TABS: { v: Tab; label: string; empty: string }[] = [
  { v: 'up', label: 'Upcoming', empty: 'You have no upcoming trips.' },
  { v: 'past', label: 'Past', empty: 'Your completed trips will appear here.' },
  { v: 'cancelled', label: 'Cancelled', empty: 'No cancelled trips.' },
];

export default function TripsPage() {
  const { api } = useRidean();
  const [tab, setTab] = useState<Tab>('up');
  const { data, error, loading } = useLoad(() => fetchAllBookings(api), [api]);

  const now = Date.now();
  const all = data ?? [];
  const lists: Record<Tab, typeof all> = {
    up: all.filter((b) => isUpcoming(b, now)).sort((a, b) => tripTime(a) - tripTime(b)),
    past: all.filter((b) => !isCancelled(b) && !isUpcoming(b, now)).sort((a, b) => tripTime(b) - tripTime(a)),
    cancelled: all.filter(isCancelled).sort((a, b) => tripTime(b) - tripTime(a)),
  };
  const list = lists[tab];
  const current = TABS.find((t) => t.v === tab)!;

  return (
    <div style={S.page}>
      <PageHead
        title="Your trips"
        action={
          <div style={{ width: 220 }}>
            <Link href="/ride" className="dz-cta" style={S.cta}>
              <span>Book a ride</span>
              <Arrow />
            </Link>
          </div>
        }
      />
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div className="dz-segw" role="tablist" aria-label="Trips">
          {TABS.map((t) => (
            <button key={t.v} type="button" role="tab" aria-selected={tab === t.v} className={`dz-seg ${tab === t.v ? 'on' : ''}`} onClick={() => setTab(t.v)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading && !data ? (
        <div className="dz-split" style={{ gap: 16 }}><Skeleton h={130} /><Skeleton h={130} /></div>
      ) : data && list.length === 0 ? (
        <EmptyCard text={current.empty} action={tab === 'up' ? <Link href="/ride" style={S.goldLink}>Book a ride</Link> : undefined} />
      ) : data ? (
        <div className="dz-split" style={{ gap: 16 }}>
          {list.map((b) => <TripCard key={b.id} b={b} />)}
        </div>
      ) : null}
    </div>
  );
}
