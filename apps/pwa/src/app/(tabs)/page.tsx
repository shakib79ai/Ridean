'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import { encodeSearch } from '@ridean/web-core';
import { C, Field } from '@/components/site/ui';
import { CalendarIcon, Stroke } from '@/components/booking/icons';
import { Cta, DateTimeRow, FormError, PlaceField } from '@/components/booking/parts';
import { dateTimeToIso, defaultDateTime, toGeo, useLocate, validAddress, emptyPlace, type Place } from '@/components/booking/useQuoteSearch';

// ---------------------------------------------------------------- hero search

type Tab = 'ride' | 'airport' | 'rent';

const CAR_PATH =
  'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z';
const TABS: { key: Tab; label: string; cta: string; icon: (fill: string) => ReactNode }[] = [
  { key: 'ride', label: 'Ride', cta: 'Find a ride', icon: (fill) => <path fill={fill} d={CAR_PATH} /> },
  {
    key: 'airport',
    label: 'Airport transfer',
    cta: 'Find a transfer',
    icon: (fill) => <path fill={fill} transform="rotate(45 12 12)" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />,
  },
  { key: 'rent', label: 'Rent a car', cta: 'Find a car', icon: (fill) => <path fill={fill} fillRule="evenodd" d={`${CAR_PATH}M9.25 14.6h5.5v1.1h-5.5zM9.25 16.6h5.5v1h-5.5z`} /> },
];
const ROUTE: Record<Tab, string> = { ride: '/book/ride', airport: '/book/airport-transfer', rent: '/book/rent' };
const RENT_TIME = '10:00';

function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('ride');
  const [now, setNow] = useState(true);
  const first = defaultDateTime(1);
  const [date, setDate] = useState(first.date);
  const [time, setTime] = useState(first.time);
  const [d1, setD1] = useState(defaultDateTime(24).date);
  const [d2, setD2] = useState(defaultDateTime(24 * 4).date);
  const [pickup, setPickup] = useState<Place>(emptyPlace);
  const [dropoff, setDropoff] = useState<Place>(emptyPlace);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { locate, locating } = useLocate(useCallback((p: Place) => setPickup(p), []));

  function pickTab(t: Tab) {
    setTab(t);
    setError('');
    // Airport transfers are always pre-booked; give them a sensible default a day ahead.
    if (t === 'airport' && now) {
      const d = defaultDateTime(24);
      setDate(d.date);
      setTime(d.time);
    }
  }

  function submit() {
    setError('');
    if (!validAddress(pickup)) return setError(tab === 'rent' ? 'Enter a pick-up location' : 'Enter a pickup location');
    let req: QuoteSearchRequest;
    if (tab === 'rent') {
      const rentalPickupAt = dateTimeToIso(d1, RENT_TIME);
      const rentalReturnAt = dateTimeToIso(d2, RENT_TIME);
      if (!rentalPickupAt || !rentalReturnAt) return setError('Choose pick-up and return dates');
      if (rentalReturnAt <= rentalPickupAt) return setError('Return must be after pick-up');
      req = { service: 'rent', pickup: toGeo(pickup), rentalPickupAt, rentalReturnAt };
    } else {
      if (!validAddress(dropoff)) return setError(tab === 'airport' ? 'Enter a drop-off' : 'Enter a destination');
      const scheduled = tab === 'airport' || !now;
      const at = scheduled ? dateTimeToIso(date, time) : undefined;
      if (scheduled) {
        if (!at) return setError('Choose a pickup date and time');
        if (Date.parse(at) < Date.now()) return setError('Pickup time is in the past');
      }
      req =
        tab === 'airport'
          ? { service: 'airport_transfer', tripType: 'one_way', pickup: toGeo(pickup), dropoff: toGeo(dropoff), pickupAt: at, passengers: 1, luggage: 1 }
          : { service: 'ride_now', pickup: toGeo(pickup), dropoff: toGeo(dropoff), passengers: 1, ...(at ? { pickupAt: at } : {}) };
    }
    setBusy(true);
    router.push(`${ROUTE[tab]}?s=${encodeSearch(req)}`);
  }

  const active = TABS.find((t) => t.key === tab)!;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{
        margin: '0 12px',
        padding: '0 14px 14px',
        borderRadius: 18,
        background: 'rgba(4,24,19,.8)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(70,120,104,.5)',
        boxShadow: '0 24px 50px -18px rgba(0,0,0,.7)',
      }}
    >
      <div role="tablist" aria-label="Service" style={{ display: 'flex', borderBottom: `1px solid ${C.line}`, margin: '0 -14px 12px', padding: '0 8px' }}>
        {TABS.map((t) => {
          const on = t.key === tab;
          const color = on ? C.yellow : C.cream;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              className="dz-btn-reset"
              onClick={() => pickTab(t.key)}
              style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 2px 11px', borderBottom: `2.5px solid ${on ? C.yellow : 'transparent'}` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                {t.icon(color)}
              </svg>
              <span style={{ fontSize: 12.5, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'ride' && (
          <div className="dz-segw" role="group" aria-label="When">
            <button type="button" className={`dz-seg ${now ? 'on' : ''}`} aria-pressed={now} onClick={() => setNow(true)}>
              Now
            </button>
            <button type="button" className={`dz-seg ${!now ? 'on' : ''}`} aria-pressed={!now} onClick={() => setNow(false)}>
              Schedule
            </button>
          </div>
        )}
        {((tab === 'ride' && !now) || tab === 'airport') && <DateTimeRow date={date} time={time} onDate={setDate} onTime={setTime} dateLabel={tab === 'airport' ? 'Pickup date' : 'Date'} timeLabel={tab === 'airport' ? 'Pickup time' : 'Time'} />}
        <PlaceField
          label={tab === 'rent' ? 'Pickup location' : 'Pickup'}
          name="pickup"
          value={pickup}
          onChange={setPickup}
          placeholder={tab === 'rent' ? 'Airport, city or address' : 'Airport, hotel or address'}
          onLocate={tab === 'rent' ? undefined : locate}
          locating={locating}
        />
        {tab === 'rent' ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Field icon={<CalendarIcon />} label="Pick-up">
                <input name="d1" type="date" className="dz-input" value={d1} onChange={(e) => setD1(e.target.value)} />
              </Field>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Field icon={<CalendarIcon />} label="Return">
                <input name="d2" type="date" className="dz-input" value={d2} min={d1} onChange={(e) => setD2(e.target.value)} />
              </Field>
            </div>
          </div>
        ) : (
          <PlaceField
            label={tab === 'airport' ? 'Drop-off' : 'Where to?'}
            name="dest"
            value={dropoff}
            onChange={setDropoff}
            placeholder={tab === 'airport' ? 'Airport, hotel, city or address' : 'Enter a destination'}
            onSwap={() => {
              setPickup(dropoff);
              setDropoff(pickup);
            }}
          />
        )}
        <FormError message={error} />
        <Cta type="submit" disabled={busy} style={{ height: 50 }}>
          {active.cta}
        </Cta>
      </div>
    </form>
  );
}

function Hero() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#000909', paddingBottom: 12 }}>
      <img src="/img/hero-mobile.jpg" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 430, objectFit: 'cover', objectPosition: 'center 30%' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 430, background: 'linear-gradient(180deg,rgba(0,9,9,.55) 0%,rgba(0,9,9,.05) 28%,rgba(0,9,9,.15) 60%,#000909 100%)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Ridean" style={{ display: 'block', height: 44, width: 'auto' }} />
          <Link href="/account" aria-label="Menu" style={{ display: 'flex', padding: 6, marginRight: -6 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F3EEDF" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
            </svg>
          </Link>
        </div>
        <div style={{ padding: '56px 20px 0' }}>
          <h1 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 40, lineHeight: 1.02, letterSpacing: '-.01em', color: '#FFFFFF', maxWidth: 300, textShadow: '0 2px 18px rgba(0,0,0,.45)' }}>
            Arrive exceptionally.
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.3, color: '#EEF1EC', maxWidth: 200, textShadow: '0 1px 10px rgba(0,0,0,.5)' }}>Premium mobility for wherever life takes you.</p>
        </div>
        <div style={{ paddingTop: 92 }}>
          <HeroSearch />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- board sections

const ArrowSm = ({ size = 13, color = '#FCCB2C' }: { size?: number; color?: string }) => (
  <Stroke size={size} color={color}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Stroke>
);

const SERVICE_CARDS: { href: string; img: string; imgStyle: CSSProperties; title: string; text: string }[] = [
  { href: '/book/ride', img: '/img/design/seat.png', imgStyle: { objectPosition: '30% center' }, title: 'Ride', text: 'On-demand and scheduled rides with upfront prices.' },
  { href: '/book/airport-transfer', img: '/img/design/airport.png', imgStyle: { objectPosition: '45% 60%' }, title: 'Airport transfer', text: 'Flight-tracked pickups with meet & greet, one way or return.' },
  { href: '/book/rent', img: '/img/design/business.png', imgStyle: { objectPosition: '35% center' }, title: 'Rent a car', text: 'Compare rental partners in one search.' },
  {
    href: '/book/hourly',
    img: '/img/design/night-car.jpg',
    imgStyle: { objectPosition: '68% 22%', transform: 'scale(1.7)', transformOrigin: '68% 22%' },
    title: 'Hourly chauffeur',
    text: 'A dedicated car and chauffeur, booked by the hour.',
  },
  {
    href: '/book/luxury',
    img: '/img/design/night-car.jpg',
    imgStyle: { objectPosition: '40% 62%', transform: 'scale(1.15)', transformOrigin: '40% 62%' },
    title: 'Luxury chauffeur',
    text: 'First-class cars such as the S-Class, 7 Series and Range Rover.',
  },
];

const TRUST: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'No surge pricing',
    text: 'One upfront price',
    icon: (
      <>
        <path d="M3 12V4h8l10 10-8 8z" />
        <circle cx="7.5" cy="8.5" r="1.5" />
      </>
    ),
  },
  { title: 'Free cancellation', text: 'Up to 1 hour before', icon: <path d="M5 12.5l4.5 4.5L19 7.5" /> },
  {
    title: 'Vetted chauffeurs',
    text: 'Fully licensed',
    icon: (
      <>
        <path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  { title: '24/7 support', text: 'Day or night', icon: <path d="M4 5h16v11H9l-5 4z" /> },
];

const CLASSES = [
  { img: '/img/design/cls-sedan.jpg', name: 'Sedan', text: 'Everyday comfort', pax: 3, bags: 2 },
  { img: '/img/design/cls-xl.jpg', name: 'XL', text: 'More room for everyone', pax: 6, bags: 4 },
  { img: '/img/design/cls-comfort.jpg', name: 'Extra Comfort', text: 'Space to unwind', pax: 3, bags: 2 },
  { img: '/img/design/cls-business.jpg', name: 'Business', text: 'Refined executive travel', pax: 3, bags: 2 },
  { img: '/img/design/cls-black.jpg', name: 'Black Car Service', text: 'Our most elevated ride', pax: 3, bags: 2 },
];

const MEET: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Name sign in arrivals',
    text: 'Your chauffeur waits inside the terminal.',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
  },
  { title: 'Flight tracking', text: 'Pickup moves if you land early or late.', icon: <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" /> },
  {
    title: 'Free waiting time',
    text: 'Waiting after landing is included.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    title: 'Help with luggage',
    text: 'Your chauffeur carries your bags.',
    icon: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </>
    ),
  },
];

const STEPS = ['Add your flight number when you book.', "Get your chauffeur's name, photo and phone before you land.", 'Meet them in arrivals and go.'];

const rail: CSSProperties = { display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollPaddingLeft: 20, scrollbarWidth: 'none' };
const eyebrow: CSSProperties = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: C.gold };
const h2: CSSProperties = { margin: 0, fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 600, lineHeight: 1.12, color: C.cream };

export default function MainPage() {
  return (
    <>
      <Hero />
      <div style={{ background: 'linear-gradient(180deg,#000909 0%,#071A14 80px)' }}>
        {/* Services */}
        <div style={{ padding: '18px 0 0' }}>
          <div style={{ ...rail, gap: 10, padding: '0 20px 4px' }}>
            {SERVICE_CARDS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                style={{ flex: '0 0 206px', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', background: '#001814', border: '1px solid rgba(70,120,104,.42)' }}
              >
                <div style={{ position: 'relative', height: 90, overflow: 'hidden' }}>
                  <img src={s.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...s.imgStyle }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,24,20,0) 55%,rgba(0,24,20,.95) 100%)' }} />
                </div>
                <div style={{ padding: '0 11px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16.5, fontWeight: 500, color: '#F7F4EC', whiteSpace: 'nowrap' }}>{s.title}</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.4, color: '#D7DED9', minHeight: 32 }}>{s.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(70,120,104,.35)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#FCCB2C' }}>
                      Book now
                      <ArrowSm />
                    </span>
                    <span style={{ width: 24, height: 24, borderRadius: 12, border: '1px solid rgba(243,238,223,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                      <Stroke size={14}>
                        <path d="M9 6l6 6-6 6" />
                      </Stroke>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <div style={{ flex: '0 0 8px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 10, fontSize: 11.5, color: C.muted }}>
            <Stroke size={13} color={C.muted}>
              <path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" />
            </Stroke>
            Swipe to see all services
          </div>
        </div>

        {/* Trust tiles */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
            {TRUST.map((t) => (
              <div key={t.title} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 10px', borderRadius: 14, background: C.panel, border: `1px solid ${C.line}`, minWidth: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: 15, border: '1px solid rgba(217,169,79,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                  <Stroke size={16} color={C.gold}>
                    {t.icon}
                  </Stroke>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{t.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Car classes */}
        <div style={{ padding: '34px 0 0' }}>
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={eyebrow}>Choose your class</div>
            <h2 style={h2}>A car for every journey.</h2>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: C.soft }}>Find the space, comfort and style that suit your journey.</div>
          </div>
          <div style={{ ...rail, gap: 12, padding: '16px 20px 6px' }}>
            {CLASSES.map((c) => (
              <Link
                key={c.name}
                href="/book/ride"
                style={{ flex: '0 0 206px', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', background: C.panel, border: `1px solid ${C.line}`, position: 'relative' }}
              >
                <div style={{ height: 124, background: '#0B2A20' }}>
                  <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 600, color: C.cream, whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: C.soft, marginTop: 2 }}>{c.text}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, padding: '9px 0', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, fontSize: 12.5, color: C.cream }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Stroke size={14} color={C.gold}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                      </Stroke>
                      {c.pax} passengers
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Stroke size={14} color={C.gold}>
                        <rect x="4" y="7" width="16" height="13" rx="2" />
                        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </Stroke>
                      {c.bags} bags
                    </span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: C.gold }}>
                    Explore class
                    <ArrowSm size={15} color={C.gold} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ padding: '4px 20px 0', fontSize: 11, color: C.muted }}>Vehicle models and capacity vary by supplier. Images are illustrative.</div>
        </div>

        {/* Meet & greet */}
        <div style={{ padding: '34px 20px 28px' }}>
          <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: 'linear-gradient(160deg,#0F2E25,#0A2019)', padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={eyebrow}>Meet & Greet</div>
            <h2 style={h2}>Your chauffeur is waiting in arrivals</h2>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: C.soft }}>Walk out of customs to a friendly face holding your name sign. No queues, no searching for a car.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              {MEET.map((m) => (
                <div key={m.title} style={{ padding: 12, borderRadius: 12, background: '#0B241D', border: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stroke size={16} color={C.gold}>
                      {m.icon}
                    </Stroke>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.cream }}>{m.title}</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.45, color: C.muted }}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      border: `1px solid ${C.gold}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 14,
                      color: C.gold,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: C.soft }}>{s}</span>
                </div>
              ))}
            </div>
            <Link
              href="/book/airport-transfer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 50, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 16, fontWeight: 600, marginTop: 4 }}
            >
              Book an airport transfer
              <ArrowSm size={18} color="#0A1F18" />
            </Link>
            <Link href="/help" style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: C.gold }}>
              How Meet & Greet works
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
