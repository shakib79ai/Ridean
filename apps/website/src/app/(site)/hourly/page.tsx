'use client';

import { Suspense, useCallback, useState } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import { C } from '@/components/site/ui';
import {
  bookingStyles as s,
  CtaButton,
  DateTimeRow,
  FeatureTile,
  FormCard,
  FormError,
  PlaceField,
  QuoteOptions,
  SectionHead,
  ServiceHero,
  ServiceLayout,
  validAddress,
} from '@/components/booking/parts';
import { classLabel, dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useLocate, useQuoteSearch, type Place } from '@/components/booking/useQuoteSearch';

export default function HourlyChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <HourlyChauffeur />
    </Suspense>
  );
}

const HOURS = [2, 3, 4, 6, 8, 10];
const goldIcon = { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: C.gold, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

function HourlyChauffeur() {
  const qs = useQuoteSearch('hourly');
  const init = qs.initial;
  const start = isoToDateTime(init?.pickupAt) ?? defaultDateTime(24);
  const [hours, setHours] = useState(init?.hours ?? 3);
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

  const q = qs.selected;
  const shownHours = qs.last?.hours ?? hours;

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
        form={
          <FormCard onSubmit={() => submit()}>
            <SectionHead size={22}>Book by the hour</SectionHead>
            <div style={{ fontSize: 13, color: C.muted }} id="hours-label">
              How many hours?
            </div>
            <div role="group" aria-labelledby="hours-label" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {HOURS.map((h) => (
                <button key={h} type="button" className={`dz-chip ${hours === h ? 'on' : ''}`} aria-pressed={hours === h} onClick={() => pickHours(h)}>
                  {h} h
                </button>
              ))}
            </div>
            <PlaceField label="Pickup" name="pickup" value={pickup} onChange={setPickup} placeholder="Hotel, office or address" onLocate={locate} locating={locating} />
            <DateTimeRow date={date} time={time} onDate={setDate} onTime={setTime} timeLabel="Start time" />
            <PlaceField label="Final drop-off (optional)" name="dest" value={dropoff} onChange={setDropoff} placeholder="Where the day ends, if you know" />
            <FormError message={error} />
            <CtaButton type="submit" disabled={qs.loading}>
              {qs.loading ? 'Finding chauffeurs…' : 'See prices'}
            </CtaButton>
          </FormCard>
        }
        results={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <SectionHead>Vehicle class</SectionHead>
            <QuoteOptions
              state={qs}
              idleText="Choose how many hours, your pickup and start time to see prices for a dedicated chauffeur."
              meta={(x) => `${shownHours} h · up to ${x.vehicle.passengers}`}
            />
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
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 22 }}>
              <div className={s.hourlyTotal}>
                <div>
                  <div style={{ fontSize: 13, color: C.muted }}>
                    {q ? `${classLabel(q.vehicle.class)} · ${q.supplierName} · ` : 'Total · '}
                    {shownHours} hours
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 600, marginTop: 2 }}>{q ? price(q) : '—'}</div>
                </div>
                <div className={s.hourlyBtn}>
                  <CtaButton disabled={!q || qs.loading} onClick={() => qs.confirm()}>
                    Continue
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </>
  );
}
