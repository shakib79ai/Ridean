'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { HOURLY_INCLUDED_MILES, chauffeurClass, formatMoney, minHoursFor, type QuoteSearchRequest } from '@ridean/shared';
import { ClassPicker, HoursStepper, bestQuoteByClass, billedHours, chauffeurChoices } from '@ridean/web-core';
import { C } from '@/components/site/ui';
import {
  bookingStyles as s,
  CtaButton,
  DateTimeRow,
  FeatureTile,
  FormCard,
  FormError,
  PlaceField,
  SectionHead,
  ServiceHero,
  ServiceLayout,
  validAddress,
} from '@/components/booking/parts';
import { dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useLocate, useQuoteSearch, type Place } from '@/components/booking/useQuoteSearch';

export default function HourlyChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <HourlyChauffeur />
    </Suspense>
  );
}

const goldIcon = { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: C.gold, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

function HourlyChauffeur() {
  const qs = useQuoteSearch('hourly');
  const init = qs.initial;
  const start = isoToDateTime(init?.pickupAt) ?? defaultDateTime(24);
  const [cls, setCls] = useState<string>(init?.vehicleClass ?? 'business');
  const [hours, setHours] = useState(Math.max(init?.hours ?? 3, minHoursFor(init?.vehicleClass ?? 'business')));
  const [pickup, setPickup] = useState<Place>(placeFrom(init?.pickup));
  const [dropoff, setDropoff] = useState<Place>(placeFrom(init?.dropoff));
  const [date, setDate] = useState(start.date);
  const [time, setTime] = useState(start.time);
  const [error, setError] = useState('');
  const { locate, locating } = useLocate(useCallback((p: Place) => setPickup(p), []));

  function submit(h = hours) {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a pickup location');
    const pickupAt = dateTimeToIso(date, time);
    if (!pickupAt) return setError('Choose a date and start time');
    if (Date.parse(pickupAt) < Date.now()) return setError('Start time is in the past');
    const req: QuoteSearchRequest = { service: 'hourly', pickup: toGeo(pickup), pickupAt, hours: h };
    if (dropoff.address.trim()) {
      if (!validAddress(dropoff)) return setError('Enter a full final drop-off, or leave it empty');
      req.dropoff = toGeo(dropoff);
    }
    qs.search(req);
  }

  function pickHours(h: number) {
    setHours(h);
    // Prices depend on the hours, so refresh them when a search is already showing.
    if (qs.last) submit(h);
  }

  // Keep the selected quote on the chosen class (cheapest supplier for it).
  const best = bestQuoteByClass(qs.quotes);
  const classQuote = best.get(cls) ?? null;
  const { selected, select } = qs;
  useEffect(() => {
    if (classQuote && selected?.id !== classQuote.id) select(classQuote.id);
  }, [classQuote, selected, select]);

  function pickClass(key: string) {
    setCls(key);
    const min = minHoursFor(key);
    if (hours < min) pickHours(min);
  }

  const c = chauffeurClass(cls);
  const minH = minHoursFor(cls);
  const shownHours = qs.last?.hours ?? hours;
  const q = classQuote;
  const billed = billedHours(cls, shownHours);
  const perHour = q ? Math.round(q.price.customerPrice / billed) : (c?.hourlyRate ?? 0);
  const currency = q?.price.currency ?? 'USD';
  const total = q ? price(q) : formatMoney(perHour * billed, currency);
  const stale = !!qs.last && qs.last.hours !== hours;

  return (
    <>
      <ServiceHero
        title="Hourly chauffeur"
        text="Your time. Our chauffeur. A dedicated car and driver for as long as you need."
        img="/img/design/seat.png"
        objectPosition="center 40%"
        half
      />
      <ServiceLayout
        flat
        form={
          <FormCard onSubmit={() => submit()}>
            <SectionHead size={22}>Book by the hour</SectionHead>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: -2 }}>How long do you need the car?</div>
            <HoursStepper value={hours} min={minH} onChange={pickHours} disabled={qs.loading} />
            <PlaceField label="Pickup" name="pickup" value={pickup} onChange={setPickup} placeholder="Hotel, office or address" onLocate={locate} locating={locating} />
            <DateTimeRow date={date} time={time} onDate={setDate} onTime={setTime} timeLabel="Start time" />
            <PlaceField label="Final drop-off (optional)" name="dest" value={dropoff} onChange={setDropoff} placeholder="Where the day ends, if you know" />
            <FormError message={error} />
            <CtaButton type="submit" disabled={qs.loading}>
              {qs.loading ? 'Searching…' : qs.quotes && !stale ? 'Search again' : 'Search'}
            </CtaButton>
          </FormCard>
        }
        summary={
          q && (
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 6 }}>Your booking</div>
            <SummaryRow k="Vehicle" v={c?.label ?? cls} />
            <SummaryRow k="Hourly rate" v={`${formatMoney(perHour, currency).replace(/\.00$/, '')} × ${billed} h`} />
            <SummaryRow k="Miles included" v={`${billed * HOURLY_INCLUDED_MILES} miles`} />
            {q && <SummaryRow k="Chauffeur company" v={q.supplierName} />}
            <div style={{ height: 1, background: C.line, margin: '10px 0 12px' }} />
            <div style={{ fontSize: 12.5, color: C.muted }}>Total · {billed} hours</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>{qs.loading ? '…' : total}</div>
            <div style={{ marginTop: 16 }}>
              <CtaButton disabled={qs.loading || stale} onClick={() => qs.confirm(q)}>
                {stale ? 'Search again to update the price' : 'Continue'}
              </CtaButton>
            </div>
            <div style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>Free cancellation until 24 h before pickup. Tolls, parking and taxes shown at checkout.</div>
          </div>
          )
        }
        results={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <SectionHead size={28}>Choose your car</SectionHead>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>Economy Light to Ride XXL · licensed chauffeurs · cars 2019 or newer</div>
              </div>
              {qs.quotes && <div style={{ fontSize: 13, color: C.muted }}>Prices per hour · {shownHours} h booking</div>}
            </div>
            {qs.error && <FormError message={qs.error} />}
            {qs.loading ? (
              <div className={s.classGrid}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="dz-skel" style={{ height: 196, borderRadius: 16 }} />
                ))}
              </div>
            ) : qs.quotes ? (
              <ClassPicker className={s.classGrid} choices={chauffeurChoices('hourly', qs.quotes, shownHours)} value={cls} onPick={pickClass} />
            ) : (
              <div style={{ background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 16, padding: '28px 24px', color: C.muted, fontSize: 15, lineHeight: 1.6 }}>
                Choose how many hours, your pickup, date and start time, then press <b style={{ color: C.cream }}>Search</b>. You’ll see all 8 car classes with live prices here.
              </div>
            )}
            <div className="dz-cols-3" style={{ gap: 14 }}>
              <FeatureTile
                icon={
                  <svg {...goldIcon} style={{ flexShrink: 0 }}>
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M9 7V5h6v2M3 12h18" />
                  </svg>
                }
                title="Multi-stop days"
                text="Meetings across town without waiting for rides."
              />
              <FeatureTile
                icon={
                  <svg {...goldIcon} style={{ flexShrink: 0 }}>
                    <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
                  </svg>
                }
                title="Onboard comforts"
                text="Chilled water, Wi-Fi and charging."
              />
              <FeatureTile
                icon={
                  <svg {...goldIcon} style={{ flexShrink: 0 }}>
                    <path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                }
                title="Free waiting"
                text="Your chauffeur stays with you for the hours you book."
              />
            </div>
          </div>
        }
      />
    </>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 14, color: C.muted, padding: '5px 0' }}>
      <span>{k}</span>
      <b style={{ color: C.cream, fontWeight: 600, textAlign: 'right' }}>{v}</b>
    </div>
  );
}
