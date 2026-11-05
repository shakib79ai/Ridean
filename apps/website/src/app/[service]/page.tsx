import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICE_LIST, serviceBySlug, type CoreServiceKey } from '@ridean/shared';
import { BookingSearch } from '@ridean/web-core';

const HERO: Record<string, { img: string; pos: string; blurb: string; points: string[] }> = {
  ride_now: { img: '/img/hero.jpg', pos: '70% center', blurb: 'Premium rides for every occasion — upfront prices, vetted chauffeurs, no surge.', points: ['Now or scheduled', 'Price fixed before you book', 'Live tracking'] },
  airport_transfer: { img: '/img/svc-air.jpg', pos: 'center', blurb: 'Pre-booked transfers to and from the airport, between hotels, or from city to city.', points: ['One way or return', 'Flight tracking & meet and greet', 'Free waiting after landing'] },
  rent: { img: '/img/svc-rent.jpg', pos: 'center', blurb: 'Freedom to move on your terms. Compare rental partners in one search.', points: ['Unlimited miles on most cars', 'Free cancellation on most rates', 'Different return location'] },
  hourly: { img: '/img/hero.jpg', pos: '85% 30%', blurb: 'Your time. Our chauffeur. A dedicated car and driver for as long as you need.', points: ['From 2 hours', 'Unlimited stops', 'Same chauffeur all day'] },
  luxury: { img: '/img/hero.jpg', pos: '65% 60%', blurb: 'First-class cars and vetted professional chauffeurs for the moments that matter.', points: ['S-Class, 7 Series, Range Rover', 'Suited chauffeurs', 'Complimentary water'] },
};

export function generateStaticParams() {
  return SERVICE_LIST.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const s = serviceBySlug((await params).service);
  return s ? { title: s.label, description: s.tagline } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const def = serviceBySlug((await params).service);
  if (!def) notFound();
  const h = HERO[def.key] ?? { img: '/img/hero.jpg', pos: '70% center', blurb: def.tagline, points: [] };
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(7,26,20,.96) 0%, rgba(7,26,20,.75) 45%, rgba(7,26,20,.2) 100%), url(${h.img}) ${h.pos}/cover no-repeat`, height: 520 }} />
      <div className="rd-container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 40, padding: '64px 24px' }}>
        <div className="rd-stack" style={{ ['--gap' as string]: '18px' }}>
          <h1 className="rd-display" style={{ fontSize: 'clamp(44px,5vw,64px)' }}>{def.label}</h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: '#d7ded6', maxWidth: 520 }}>{h.blurb}</p>
          <BookingSearch services={[def.key as CoreServiceKey]} hideTabs />
        </div>
        <div className="rd-stack" style={{ alignSelf: 'end', ['--gap' as string]: '12px' }}>
          {h.points.map((p) => (
            <div key={p} className="rd-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--gold)' }} />
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
