'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { VEHICLE_CLASSES } from '@ridean/shared';
import { IconArrow, IconBag, IconChat, IconCheck, IconChevron, IconClock, IconPlane, IconShield, IconTag, IconUser } from '@ridean/web-core';

/** "From" prices are marketing copy — keep them in line with real supplier rates. */
export const SERVICE_CARDS = [
  { href: '/ride', img: '/img/svc-ride.jpg', title: 'Ride', text: 'On-demand and scheduled rides with upfront prices.', price: 'From $9.40' },
  { href: '/airport-transfer', img: '/img/svc-air.jpg', title: 'Airport transfer', text: 'Flight-tracked pickups with meet & greet, one way or return.', price: 'From $64' },
  { href: '/rent', img: '/img/svc-rent.jpg', title: 'Rent a car', text: 'Compare rental partners in one search.', price: 'From $31/day' },
  { href: '/hourly', img: '/img/hero.jpg', pos: '84% 22%', zoom: 2.3, title: 'Hourly chauffeur', text: 'A dedicated car and chauffeur, booked by the hour.', price: 'From $65/h' },
  { href: '/luxury', img: '/img/hero.jpg', pos: '92% 64%', zoom: 1.9, title: 'Luxury chauffeur', text: 'First-class cars such as the S-Class, 7 Series and Range Rover.', price: 'From $40' },
];

export function ServiceSlider() {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const step = () => (track.current?.querySelector('a')?.clientWidth ?? 400) + 22;
  const go = (d: number) => {
    const t = track.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    let x = t.scrollLeft + d * step();
    if (x > max + 4) x = 0;
    if (x < -4) x = max;
    t.scrollTo({ left: x, behavior: 'smooth' });
  };
  return (
    <section className="band" aria-label="Our services">
      <div className="rd-container" style={{ position: 'relative' }}>
        <div className="slider" ref={track} onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / step()))}>
          {SERVICE_CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="svc-card">
              <div className="photo" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos ?? 'center', backgroundSize: c.zoom ? `${c.zoom * 100}% auto` : 'cover' }}>
                <span className="price-tag">{c.price}</span>
              </div>
              <div className="rd-stack" style={{ padding: '4px 22px 18px', ['--gap' as string]: '7px' }}>
                <span className="rd-display" style={{ fontSize: 26, fontWeight: 500 }}>{c.title}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: '#d7ded9', minHeight: 44 }}>{c.text}</span>
                <span className="rd-row" style={{ justifyContent: 'space-between', paddingTop: 11, borderTop: '1px solid rgba(70,120,104,.35)' }}>
                  <span className="rd-row" style={{ color: '#FCCB2C', fontWeight: 600, fontSize: 15, ['--gap' as string]: '8px' }}>Book now <IconArrow size={18} /></span>
                  <IconChevron size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <button className="slider-arrow rd-hide-mobile" style={{ left: 4 }} aria-label="Previous" onClick={() => go(-1)}><IconChevron size={20} style={{ transform: 'rotate(180deg)' }} /></button>
        <button className="slider-arrow rd-hide-mobile" style={{ right: 4 }} aria-label="Next" onClick={() => go(1)}><IconChevron size={20} /></button>
        <div className="rd-row" style={{ justifyContent: 'center', paddingTop: 14, ['--gap' as string]: '8px' }}>
          {[0, 1, 2].map((i) => (
            <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => track.current?.scrollTo({ left: i * step(), behavior: 'smooth' })}
              style={{ all: 'unset', cursor: 'pointer', width: page === i ? 26 : 8, height: 8, borderRadius: 4, background: page === i ? 'var(--gold)' : 'rgba(243,238,223,.28)', transition: 'all .2s' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustStrip() {
  const items = [
    [IconTag, 'No surge pricing', 'One upfront price, every time'],
    [IconCheck, 'Free cancellation', 'Up to 1 hour before pickup'],
    [IconShield, 'Vetted chauffeurs', 'Licensed and background-checked'],
    [IconChat, '24/7 support', 'Real people, day or night'],
  ] as const;
  return (
    <div className="band" style={{ paddingTop: 0 }}>
      <div className="rd-container">
        <div className="trust">
          {items.map(([Icon, t, s]) => (
            <div key={t}>
              <span style={{ width: 42, height: 42, borderRadius: 21, border: '1px solid rgba(217,169,79,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}><Icon size={19} /></span>
              <span><strong style={{ fontSize: 15 }}>{t}</strong><br /><span className="rd-muted" style={{ fontSize: 13 }}>{s}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CLASS_IMG: Record<string, string> = { sedan: 'cls-sedan', xl: 'cls-xl', extra_comfort: 'cls-comfort', business: 'cls-business', black: 'cls-black' };
const CLASS_SUB: Record<string, string> = { sedan: 'Everyday comfort', xl: 'More room for everyone', extra_comfort: 'Space to unwind', business: 'Refined executive travel', black: 'Our most elevated ride' };

export function CarClasses() {
  return (
    <section className="section" style={{ background: 'linear-gradient(180deg,#0B2A20,#071A14)' }}>
      <div className="rd-container rd-stack" style={{ ['--gap' as string]: '28px' }}>
        <div className="rd-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="rd-stack" style={{ ['--gap' as string]: '10px' }}>
            <span className="rd-eyebrow">Choose your class</span>
            <h2 className="rd-display" style={{ fontSize: 'clamp(36px,4.5vw,62px)' }}>A car for every journey.</h2>
            <span style={{ fontSize: 18, color: '#d7ded9' }}>Find the space, comfort and style that suit your journey.</span>
          </div>
          <Link href="/ride" className="rd-btn rd-btn-ghost">Find your ride ↗</Link>
        </div>
        <div className="classes">
          {VEHICLE_CLASSES.map((c) => (
            <Link key={c.key} href="/ride" className={`cls-card ${c.key === 'business' ? 'featured' : ''}`}>
              <div style={{ position: 'relative', aspectRatio: '16/10', background: '#0B2A20' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/img/${CLASS_IMG[c.key]}.jpg`} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {c.key === 'business' && <span className="rd-pill" style={{ position: 'absolute', top: 10, left: 10, border: '1px solid var(--gold)', color: 'var(--gold)', background: 'rgba(7,26,20,.75)', letterSpacing: '.14em', fontSize: 10.5 }}>EXECUTIVE</span>}
              </div>
              <div className="rd-stack" style={{ padding: '14px 18px 18px', ['--gap' as string]: '10px' }}>
                <div><div className="rd-display" style={{ fontSize: 24 }}>{c.label}</div><div style={{ fontSize: 14, color: '#c9d2cb', marginTop: 2 }}>{CLASS_SUB[c.key]}</div></div>
                <div className="rd-row" style={{ fontSize: 13, padding: '9px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', ['--gap' as string]: '16px' }}>
                  <span className="rd-row" style={{ ['--gap' as string]: '6px' }}><IconUser size={15} style={{ color: 'var(--gold)' }} />{c.passengers} passengers</span>
                  <span className="rd-row" style={{ ['--gap' as string]: '6px' }}><IconBag size={15} style={{ color: 'var(--gold)' }} />{c.bags} bags</span>
                </div>
                <span className="rd-row" style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 14, ['--gap' as string]: '6px' }}>Explore class <IconArrow size={16} /></span>
              </div>
            </Link>
          ))}
        </div>
        <p className="rd-muted" style={{ textAlign: 'center', fontSize: 12, margin: 0 }}>Vehicle models and capacity vary by supplier. Images are illustrative.</p>
      </div>
    </section>
  );
}

export function MeetGreet() {
  const tiles = [
    [IconUser, 'Name sign in arrivals', 'Your chauffeur waits inside the terminal — not in the car park.'],
    [IconPlane, 'Flight tracking', 'Pickup moves automatically if you land early or late.'],
    [IconClock, 'Free waiting time', 'Waiting time after landing is included, so delays never cost you more.'],
    [IconBag, 'Help with luggage', 'Your chauffeur carries your bags to the car.'],
  ] as const;
  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="rd-container">
        <div className="rd-card rd-stack" style={{ padding: 'clamp(22px,4vw,44px)', borderRadius: 22, background: 'linear-gradient(135deg,#0F2E25 0%,#0A2019 100%)', ['--gap' as string]: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 40, alignItems: 'center' }}>
            <div className="rd-stack">
              <span className="rd-eyebrow">Meet &amp; Greet</span>
              <h2 className="rd-display" style={{ fontSize: 40 }}>Your chauffeur is waiting in arrivals</h2>
              <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: '#c9d2cb' }}>Walk out of customs to a friendly face holding your name sign. No queues, no searching for a car.</p>
              <div className="rd-row" style={{ flexWrap: 'wrap' }}>
                <Link href="/airport-transfer" className="rd-btn">Book an airport transfer <IconArrow /></Link>
                <Link href="/help" className="rd-link">How it works</Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
              {tiles.map(([Icon, t, s]) => (
                <div key={t} className="rd-row" style={{ alignItems: 'flex-start', padding: 18, borderRadius: 14, background: '#0B241D', border: '1px solid var(--line)', ['--gap' as string]: '14px' }}>
                  <span style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}><Icon size={20} /></span>
                  <span><strong style={{ fontSize: 15.5 }}>{t}</strong><br /><span className="rd-muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>{s}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
            {['Add your flight number when you book.', "Get your chauffeur's name, photo and phone before you land.", 'Meet them in arrivals and go.'].map((t, i) => (
              <div key={t} className="rd-row" style={{ alignItems: 'flex-start', ['--gap' as string]: '12px' }}>
                <span className="rd-display" style={{ width: 34, height: 34, borderRadius: 17, border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 17, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: '#c9d2cb', paddingTop: 6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
