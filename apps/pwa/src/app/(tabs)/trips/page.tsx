'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { Arrow, ErrorNote, Skeleton } from '@/components/site/ui';
import { LogoHeader, TripCard, fetchAllBookings, isUpcoming, tripTime, useLoad } from '@/components/trips/kit';

type Tab = 'up' | 'past';
const TABS: { v: Tab; label: string; empty: string }[] = [
  { v: 'up', label: 'Upcoming', empty: 'You have no upcoming trips.' },
  { v: 'past', label: 'Past', empty: 'Your past and cancelled trips will appear here.' },
];

export default function TripsPage() {
  return (
    <div style={{ paddingBottom: '92px' }}>
      <LogoHeader />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        <h1 style={{ margin: '0', fontFamily: 'Playfair Display,serif', fontSize: '28px', fontWeight: 600 }}>Your trips</h1>
        <RequireAuth>
          <TripsList />
        </RequireAuth>
      </div>
    </div>
  );
}

function TripsList() {
  const { api } = useRidean();
  const [tab, setTab] = useState<Tab>('up');
  const { data, error, loading } = useLoad(() => fetchAllBookings(api), [api]);

  const now = Date.now();
  const all = data ?? [];
  const lists: Record<Tab, typeof all> = {
    up: all.filter((b) => isUpcoming(b, now)).sort((a, b) => tripTime(a) - tripTime(b)),
    past: all.filter((b) => !isUpcoming(b, now)).sort((a, b) => tripTime(b) - tripTime(a)),
  };
  const list = lists[tab];
  const current = TABS.find((t) => t.v === tab)!;

  return (
    <>
      <div className="dz-segw" role="tablist" aria-label="Trips">
        {TABS.map((t) => (
          <button key={t.v} type="button" role="tab" aria-selected={tab === t.v} className={`dz-seg ${tab === t.v ? 'on' : ''}`} onClick={() => setTab(t.v)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton h={130} />
          <Skeleton h={130} />
        </div>
      ) : data && list.length === 0 ? (
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#C9D2CB' }}>{current.empty}</p>
          {tab === 'up' && (
            <Link href="/book/ride" className="dz-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '50px', borderRadius: '12px', background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: '16px', fontWeight: 600 }}>
              <span>Book a ride</span>
              <Arrow />
            </Link>
          )}
        </div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((b) => (
            <TripCard key={b.id} b={b} />
          ))}
        </div>
      ) : null}
    </>
  );
}
