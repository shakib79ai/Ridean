'use client';

import Link from 'next/link';
import { SERVICE_LIST } from '@ridean/shared';
import { BookingSearch, useRidean } from '@ridean/web-core';

const TILE_IMG: Record<string, string> = {
  ride_now: '/img/svc-ride.jpg', airport_transfer: '/img/svc-air.jpg', rent: '/img/svc-rent.jpg', hourly: '/img/seat.jpg', luxury: '/img/cls-black.jpg',
};

export default function Home() {
  const { user } = useRidean();
  return (
    <div className="rd-stack" style={{ ['--gap' as string]: '20px' }}>
      <div className="app-head">
        <div>
          <div className="rd-muted" style={{ fontSize: 14 }}>{user ? `Good to see you, ${user.firstName}` : 'Welcome to'}</div>
          <h1 className="app-title" style={{ color: 'var(--gold)' }}>Ridean</h1>
        </div>
        {!user && <Link href="/signin" className="rd-btn rd-btn-ghost" style={{ height: 40 }}>Sign in</Link>}
      </div>
      <BookingSearch />
      <div className="rd-stack" style={{ ['--gap' as string]: '10px' }}>
        <span className="rd-eyebrow">All services</span>
        <div className="svc-grid">
          {SERVICE_LIST.map((s) => (
            <Link key={s.key} href={`/book/${s.slug}`} className="svc-tile" style={{ backgroundImage: `url(${TILE_IMG[s.key] ?? '/img/hero-mobile.jpg'})` }}>
              <span>{s.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <Link href="/book/airport-transfer" className="promo" style={{ textDecoration: 'none', color: 'var(--cream)' }}>
        <div>
          <span className="rd-eyebrow">Meet &amp; Greet</span>
          <div className="rd-display" style={{ fontSize: 24, marginTop: 4 }}>Your chauffeur waits in arrivals</div>
          <div className="rd-muted" style={{ fontSize: 13.5, marginTop: 4 }}>Flight tracking and free waiting time included.</div>
        </div>
      </Link>
    </div>
  );
}
