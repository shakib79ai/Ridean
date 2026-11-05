'use client';

import { Suspense, useState, type ReactNode } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import { C } from '@/components/site/ui';
import { Stroke } from '@/components/booking/icons';
import { Column, Cta, DateTimeRow, FormError, HeroHeader, PlaceField, QuoteOptions, SectionTitle, panel, screenStyle } from '@/components/booking/parts';
import { classLabel, dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useQuoteSearch, validAddress, type Place } from '@/components/booking/useQuoteSearch';

export default function LuxuryChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <LuxuryChauffeur />
    </Suspense>
  );
}

function Perk({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: C.cream, minWidth: 0 }}>
      <Stroke size={16} color={C.gold}>
        {children}
      </Stroke>
      {label}
    </div>
  );
}

function LuxuryChauffeur() {
  const qs = useQuoteSearch('luxury');
  const init = qs.initial;
  const when = isoToDateTime(init?.pickupAt) ?? defaultDateTime(24);
  const [pickup, setPickup] = useState<Place>(placeFrom(init?.pickup));
  const [dropoff, setDropoff] = useState<Place>(placeFrom(init?.dropoff));
  // The API only takes "as soon as possible" for Ride, so luxury trips are always scheduled.
  const [date, setDate] = useState(when.date);
  const [time, setTime] = useState(when.time);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const edit =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setDirty(true);
    };

  function submit() {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a pickup location');
    if (!validAddress(dropoff)) return setError('Enter a destination');
    const pickupAt = dateTimeToIso(date, time);
    if (!pickupAt) return setError('Choose a pickup date and time');
    if (Date.parse(pickupAt) < Date.now()) return setError('Pickup time is in the past');
    const req: QuoteSearchRequest = { service: 'luxury', pickup: toGeo(pickup), dropoff: toGeo(dropoff), pickupAt };
    setDirty(false);
    qs.search(req);
  }

  const q = qs.selected;
  const canConfirm = !!q && !dirty && !qs.loading;

  return (
    <div style={screenStyle}>
      <HeroHeader img="/img/design/business.png" objectPosition="center 30%" height={220} title="Luxury chauffeur" text="First-class cars, vetted professional chauffeurs." />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (canConfirm) qs.confirm();
          else submit();
        }}
      >
        <Column>
          <div style={panel(16)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }}>
              <Perk label="Chilled water">
                <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
              </Perk>
              <Perk label="Onboard Wi-Fi">
                <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
              </Perk>
              <Perk label="Suited chauffeur">
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
              </Perk>
              <Perk label="Meet & greet">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M9 7V5h6v2M3 12h18" />
              </Perk>
            </div>
          </div>
          <SectionTitle>Select your car</SectionTitle>
          <QuoteOptions
            state={qs}
            idleText="Enter your pickup, destination and time below to see first-class cars with upfront prices."
            title={(x) => x.vehicle.name}
            sub={(x) => `${x.vehicle.passengers} seats · ${classLabel(x.vehicle.class)} · ${x.supplierName}`}
          />
          <div style={panel(16)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PlaceField label="Pickup" name="pickup" value={pickup} onChange={edit(setPickup)} placeholder="Airport, hotel or address" />
              <PlaceField label="Where to?" name="dest" value={dropoff} onChange={edit(setDropoff)} placeholder="Enter a destination" />
              <DateTimeRow date={date} time={time} onDate={edit(setDate)} onTime={edit(setTime)} />
              <FormError message={error} />
            </div>
          </div>
          <Cta type="submit" disabled={qs.loading}>
            {qs.loading ? 'Finding cars…' : canConfirm && q ? `Book ${classLabel(q.vehicle.class)} · ${price(q)}` : 'Find a luxury car'}
          </Cta>
        </Column>
      </form>
    </div>
  );
}
