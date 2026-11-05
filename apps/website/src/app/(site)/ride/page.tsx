'use client';

import { Suspense, useCallback, useState } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import {
  ConfirmRow,
  CtaButton,
  DateTimeRow,
  FormCard,
  FormError,
  PlaceField,
  QuoteOptions,
  RouteMap,
  SectionHead,
  ServiceHero,
  ServiceLayout,
  ServiceTabs,
  StepperRow,
  validAddress,
} from '@/components/booking/parts';
import { dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, toGeo, useLocate, useQuoteSearch, type Place } from '@/components/booking/useQuoteSearch';

export default function RideNowPage() {
  return (
    <Suspense fallback={null}>
      <RideNow />
    </Suspense>
  );
}

function RideNow() {
  const qs = useQuoteSearch('ride_now');
  const init = qs.initial;
  const initWhen = isoToDateTime(init?.pickupAt) ?? defaultDateTime(1);
  const [now, setNow] = useState(!init?.pickupAt);
  const [date, setDate] = useState(initWhen.date);
  const [time, setTime] = useState(initWhen.time);
  const [pickup, setPickup] = useState<Place>(placeFrom(init?.pickup));
  const [dropoff, setDropoff] = useState<Place>(placeFrom(init?.dropoff));
  const [passengers, setPassengers] = useState(init?.passengers ?? 1);
  const [error, setError] = useState('');
  const { locate, locating } = useLocate(useCallback((p: Place) => setPickup(p), []));

  function submit() {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a pickup location');
    if (!validAddress(dropoff)) return setError('Enter a destination');
    const req: QuoteSearchRequest = { service: 'ride_now', pickup: toGeo(pickup), dropoff: toGeo(dropoff), passengers };
    if (!now) {
      const at = dateTimeToIso(date, time);
      if (!at) return setError('Choose a pickup date and time');
      if (Date.parse(at) < Date.now()) return setError('Pickup time is in the past');
      req.pickupAt = at;
    }
    qs.search(req);
  }

  return (
    <>
      <ServiceHero title="Ride" text="Premium rides for every occasion — upfront prices, vetted chauffeurs, no surge." img="/img/design/hero-wide.jpg" objectPosition="right 24%" />
      <ServiceLayout
        form={
          <FormCard onSubmit={submit} tabs={<ServiceTabs active="ride" />}>
            <div className="dz-segw" role="group" aria-label="When">
              <button type="button" className={`dz-seg ${now ? 'on' : ''}`} aria-pressed={now} onClick={() => setNow(true)}>
                Now
              </button>
              <button type="button" className={`dz-seg ${!now ? 'on' : ''}`} aria-pressed={!now} onClick={() => setNow(false)}>
                Schedule
              </button>
            </div>
            {!now && <DateTimeRow date={date} time={time} onDate={setDate} onTime={setTime} />}
            <PlaceField label="Pickup" name="pickup" value={pickup} onChange={setPickup} placeholder="Airport, hotel or address" onLocate={locate} locating={locating} />
            <PlaceField
              label="Where to?"
              name="dest"
              value={dropoff}
              onChange={setDropoff}
              placeholder="Enter a destination"
              onSwap={() => {
                setPickup(dropoff);
                setDropoff(pickup);
              }}
            />
            <StepperRow label="Passengers" hint="Including you" value={passengers} min={1} max={8} onChange={setPassengers} />
            <FormError message={error} />
            <CtaButton type="submit" disabled={qs.loading}>
              {qs.loading ? 'Finding rides…' : 'See prices'}
            </CtaButton>
          </FormCard>
        }
        results={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <RouteMap />
            <SectionHead>Choose your ride</SectionHead>
            <QuoteOptions state={qs} idleText="Enter your pickup and destination to see upfront prices from our partners." />
            <ConfirmRow state={qs} />
          </div>
        }
      />
    </>
  );
}
