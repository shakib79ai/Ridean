'use client';

import { Suspense, useCallback, useState } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import { C } from '@/components/site/ui';
import { Column, Cta, DateTimeRow, FormError, PageHeader, PaymentHint, PlaceField, QuoteOptions, RouteMap, SectionTitle, ServiceTabs, panel, screenStyle } from '@/components/booking/parts';
import { classLabel, dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useLocate, useQuoteSearch, validAddress, type Place } from '@/components/booking/useQuoteSearch';

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
  const [error, setError] = useState('');
  // Form edited since the prices on screen were fetched → the CTA searches again.
  const [dirty, setDirty] = useState(false);
  const edit =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setDirty(true);
    };
  const { locate, locating } = useLocate(useCallback((p: Place) => (setPickup(p), setDirty(true)), []));

  function submit() {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a pickup location');
    if (!validAddress(dropoff)) return setError('Enter a destination');
    const req: QuoteSearchRequest = { service: 'ride_now', pickup: toGeo(pickup), dropoff: toGeo(dropoff), passengers: init?.passengers ?? 1 };
    if (!now) {
      const at = dateTimeToIso(date, time);
      if (!at) return setError('Choose a pickup date and time');
      if (Date.parse(at) < Date.now()) return setError('Pickup time is in the past');
      req.pickupAt = at;
    }
    setDirty(false);
    qs.search(req);
  }

  const q = qs.selected;
  const canConfirm = !!q && !dirty && !qs.loading;

  return (
    <div style={screenStyle}>
      <PageHeader title="Ride" subtitle="Premium rides for every occasion." fallback="/" />
      <Column>
        <RouteMap />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={panel(16)}
        >
          <ServiceTabs active="ride" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="dz-segw" role="group" aria-label="When">
              <button type="button" className={`dz-seg ${now ? 'on' : ''}`} aria-pressed={now} onClick={() => edit(setNow)(true)}>
                Now
              </button>
              <button type="button" className={`dz-seg ${!now ? 'on' : ''}`} aria-pressed={!now} onClick={() => edit(setNow)(false)}>
                Schedule
              </button>
            </div>
            {!now && <DateTimeRow date={date} time={time} onDate={edit(setDate)} onTime={edit(setTime)} />}
            <PlaceField label="Pickup" name="pickup" value={pickup} onChange={edit(setPickup)} placeholder="Airport, hotel or address" onLocate={locate} locating={locating} />
            <PlaceField
              label="Where to?"
              name="dest"
              value={dropoff}
              onChange={edit(setDropoff)}
              placeholder="Enter a destination"
              onSwap={() => {
                setPickup(dropoff);
                setDropoff(pickup);
                setDirty(true);
              }}
            />
            <FormError message={error} />
          </div>
          {/* Enter in a field submits the search */}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
        <SectionTitle>Choose your ride</SectionTitle>
        <QuoteOptions state={qs} idleText="Enter your pickup and destination to see upfront prices from our partners." />
        <PaymentHint />
        <Cta disabled={qs.loading} onClick={() => (canConfirm ? qs.confirm() : submit())}>
          {qs.loading ? 'Finding rides…' : canConfirm && q ? `Confirm ${classLabel(q.vehicle.class)} · ${price(q)}` : 'See prices'}
        </Cta>
        {dirty && qs.quotes && qs.quotes.length > 0 && !qs.loading && (
          <div style={{ fontSize: 12.5, color: C.muted, textAlign: 'center', marginTop: -6 }}>Trip details changed — tap to refresh prices.</div>
        )}
      </Column>
    </div>
  );
}
