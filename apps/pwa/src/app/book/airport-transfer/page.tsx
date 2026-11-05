'use client';

import { Suspense, useCallback, useState } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import { C, Field } from '@/components/site/ui';
import { FlightIcon, GlobeIcon, ShieldIcon } from '@/components/booking/icons';
import { Column, Cta, DateTimeRow, FormError, HeroHeader, PaymentHint, PlaceField, QuoteOptions, SectionTitle, ServiceTabs, StepperRow, panel, screenStyle } from '@/components/booking/parts';
import { classLabel, dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useLocate, useQuoteSearch, validAddress, type Place } from '@/components/booking/useQuoteSearch';

export default function AirportTransferPage() {
  return (
    <Suspense fallback={null}>
      <AirportTransfer />
    </Suspense>
  );
}

function AirportTransfer() {
  const qs = useQuoteSearch('airport_transfer');
  const init = qs.initial;
  const out = isoToDateTime(init?.pickupAt) ?? defaultDateTime(24);
  const back = isoToDateTime(init?.returnAt) ?? defaultDateTime(24 * 8);
  const [tripType, setTripType] = useState<'one_way' | 'return'>(init?.tripType ?? 'one_way');
  const [pickup, setPickup] = useState<Place>(placeFrom(init?.pickup));
  const [dropoff, setDropoff] = useState<Place>(placeFrom(init?.dropoff));
  const [flight, setFlight] = useState(init?.flightNumber ?? '');
  const [date, setDate] = useState(out.date);
  const [time, setTime] = useState(out.time);
  const [rdate, setRdate] = useState(back.date);
  const [rtime, setRtime] = useState(back.time);
  const [passengers, setPassengers] = useState(init?.passengers ?? 1);
  const [luggage, setLuggage] = useState(init?.luggage ?? 1);
  const [error, setError] = useState('');
  const { locate, locating } = useLocate(useCallback((p: Place) => setPickup(p), []));

  function submit() {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a pickup location');
    if (!validAddress(dropoff)) return setError('Enter a drop-off');
    const pickupAt = dateTimeToIso(date, time);
    if (!pickupAt) return setError('Choose a pickup date and time');
    if (Date.parse(pickupAt) < Date.now()) return setError('Pickup time is in the past');
    const req: QuoteSearchRequest = { service: 'airport_transfer', tripType, pickup: toGeo(pickup), dropoff: toGeo(dropoff), pickupAt, passengers, luggage };
    if (flight.trim()) req.flightNumber = flight.trim().toUpperCase();
    if (tripType === 'return') {
      const returnAt = dateTimeToIso(rdate, rtime);
      if (!returnAt) return setError('Choose a return date and time');
      if (returnAt <= pickupAt) return setError('Return must be after the outbound pickup');
      req.returnAt = returnAt;
    }
    qs.search(req);
  }

  const q = qs.selected;
  const showResults = qs.loading || !!qs.error || qs.quotes !== null;

  return (
    <div style={screenStyle}>
      <HeroHeader img="/img/design/airport.png" objectPosition="center 60%" height={210} title="Airport transfer" text="Airport, hotel and city-to-city transfers." />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Column>
          <div style={panel(16)}>
            <ServiceTabs active="airport" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="dz-segw" role="group" aria-label="Trip type">
                <button type="button" className={`dz-seg ${tripType === 'one_way' ? 'on' : ''}`} aria-pressed={tripType === 'one_way'} onClick={() => setTripType('one_way')}>
                  One way
                </button>
                <button type="button" className={`dz-seg ${tripType === 'return' ? 'on' : ''}`} aria-pressed={tripType === 'return'} onClick={() => setTripType('return')}>
                  Return
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: C.panel2, fontSize: 13, lineHeight: 1.5, color: C.soft }}>
                <GlobeIcon />
                <span>Transfer between any two places: airport to hotel, hotel to city, or city to city.</span>
              </div>
              <PlaceField label="Pickup" name="pickup" value={pickup} onChange={setPickup} placeholder="Airport, hotel or address" onLocate={locate} locating={locating} />
              <PlaceField
                label="Drop-off"
                name="dest"
                value={dropoff}
                onChange={setDropoff}
                placeholder="Airport, hotel, city or address"
                swapLabel="Swap pickup and drop-off"
                onSwap={() => {
                  setPickup(dropoff);
                  setDropoff(pickup);
                }}
              />
              <Field icon={<FlightIcon />} label="Flight number (optional)">
                <input name="flight" type="text" className="dz-input" value={flight} maxLength={12} onChange={(e) => setFlight(e.target.value)} placeholder="e.g. BA 117 — for airport pickups" />
              </Field>
              <DateTimeRow date={date} time={time} onDate={setDate} onTime={setTime} dateLabel="Pickup date" timeLabel="Pickup time" />
              {tripType === 'return' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: C.gold, paddingTop: 2 }}>Return journey</div>
                  <DateTimeRow date={rdate} time={rtime} onDate={setRdate} onTime={setRtime} dateLabel="Return date" timeLabel="Return time" />
                </div>
              )}
            </div>
          </div>
          <div style={panel(14)}>
            <StepperRow label="Passengers" hint="Including you" value={passengers} min={1} max={14} onChange={setPassengers} />
            <StepperRow label="Luggage" hint="Large suitcases" value={luggage} min={0} max={12} onChange={setLuggage} last />
          </div>
          <div style={panel(14)}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <ShieldIcon />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Flight tracking included</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>Add your flight number and your chauffeur adjusts to delays. Included waiting time is shown on each quote.</div>
              </div>
            </div>
          </div>
          <FormError message={error} />
          <Cta type="submit" disabled={qs.loading}>
            {qs.loading ? 'Finding transfers…' : 'Find a transfer'}
          </Cta>

          {showResults && (
            <>
              <SectionTitle>Choose your transfer</SectionTitle>
              <QuoteOptions state={qs} idleText="" />
              {q && !qs.loading && (
                <>
                  <PaymentHint />
                  <Cta onClick={() => qs.confirm()}>{`Confirm ${classLabel(q.vehicle.class)} · ${price(q)}`}</Cta>
                </>
              )}
            </>
          )}
        </Column>
      </form>
    </div>
  );
}
