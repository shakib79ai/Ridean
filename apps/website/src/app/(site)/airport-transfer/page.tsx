'use client';

import { Suspense, useCallback, useState } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import { C, Field } from '@/components/site/ui';
import { ClockIcon, GlobeIcon, PlaneIcon } from '@/components/booking/icons';
import {
  ConfirmRow,
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
  ServiceTabs,
  StepperRow,
  validAddress,
} from '@/components/booking/parts';
import { dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, toGeo, useLocate, useQuoteSearch, type Place } from '@/components/booking/useQuoteSearch';

export default function AirportTransferPage() {
  return (
    <Suspense fallback={null}>
      <AirportTransfer />
    </Suspense>
  );
}

const goldIcon = { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: C.gold, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

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

  return (
    <>
      <ServiceHero
        title="Airport transfer"
        text="Pre-booked transfers to and from the airport, between hotels, or from city to city."
        img="/img/design/airport.png"
        objectPosition="center 60%"
        half
      />
      <ServiceLayout
        form={
          <FormCard onSubmit={submit} tabs={<ServiceTabs active="airport" />}>
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
            <Field icon={<PlaneIcon />} label="Flight number (optional)">
              <input name="flight" type="text" className="dz-input" value={flight} maxLength={12} onChange={(e) => setFlight(e.target.value)} placeholder="e.g. BA 117 — for airport pickups" />
            </Field>
            <DateTimeRow date={date} time={time} onDate={setDate} onTime={setTime} dateLabel="Pickup date" timeLabel="Pickup time" />
            {tripType === 'return' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: C.gold, paddingTop: 2 }}>Return journey</div>
                <DateTimeRow date={rdate} time={rtime} onDate={setRdate} onTime={setRtime} dateLabel="Return date" timeLabel="Return time" />
              </div>
            )}
            <StepperRow label="Passengers" hint="Including you" value={passengers} min={1} max={14} onChange={setPassengers} />
            <StepperRow label="Luggage" hint="Large suitcases" value={luggage} min={0} max={12} onChange={setLuggage} />
            <FormError message={error} />
            <CtaButton type="submit" disabled={qs.loading}>
              {qs.loading ? 'Finding transfers…' : 'Find a transfer'}
            </CtaButton>
          </FormCard>
        }
        results={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <SectionHead size={28}>Arrive relaxed, every time</SectionHead>
            <div className="dz-split" style={{ gap: 14 }}>
              <FeatureTile icon={<PlaneIcon size={21} color={C.gold} />} title="Flight tracking" text="We follow your flight and adjust pickup to delays automatically." />
              <FeatureTile icon={<ClockIcon size={21} color={C.gold} />} title="Free waiting time" text="Clear customs at your own pace — included waiting time is shown on each quote." />
              <FeatureTile
                icon={
                  <svg {...goldIcon} style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                  </svg>
                }
                title="Meet & greet"
                text="Your chauffeur waits in arrivals with a name sign."
              />
              <FeatureTile
                icon={
                  <svg {...goldIcon} style={{ flexShrink: 0 }}>
                    <path d="M3 12V4h8l10 10-8 8z" />
                    <circle cx="7.5" cy="8.5" r="1.5" />
                  </svg>
                }
                title="Fixed price"
                text="One upfront price, agreed before you book."
              />
            </div>
            <SectionHead>Vehicle classes</SectionHead>
            <QuoteOptions state={qs} idleText="Enter your trip details and choose “Find a transfer” to compare upfront prices from our partners." />
            {qs.quotes && qs.quotes.length > 0 && <ConfirmRow state={qs} />}
          </div>
        }
      />
    </>
  );
}
