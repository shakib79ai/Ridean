'use client';

import { Suspense, useCallback, useState, type ReactNode } from 'react';
import type { QuoteSearchRequest } from '@ridean/shared';
import { C } from '@/components/site/ui';
import {
  ConfirmRow,
  CtaButton,
  DateTimeRow,
  FormCard,
  FormError,
  PlaceField,
  QuoteOptions,
  SectionHead,
  ServiceHero,
  ServiceLayout,
  validAddress,
} from '@/components/booking/parts';
import { dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, toGeo, useLocate, useQuoteSearch, type Place } from '@/components/booking/useQuoteSearch';

export default function LuxuryChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <LuxuryChauffeur />
    </Suspense>
  );
}

function Perk({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          {children}
        </svg>
        <span style={{ fontSize: 14.5 }}>{label}</span>
      </div>
    </div>
  );
}

function LuxuryChauffeur() {
  const qs = useQuoteSearch('luxury');
  const init = qs.initial;
  const when = isoToDateTime(init?.pickupAt) ?? defaultDateTime(24);
  const [pickup, setPickup] = useState<Place>(placeFrom(init?.pickup));
  const [dropoff, setDropoff] = useState<Place>(placeFrom(init?.dropoff));
  const [date, setDate] = useState(when.date);
  const [time, setTime] = useState(when.time);
  const [error, setError] = useState('');
  const { locate, locating } = useLocate(useCallback((p: Place) => setPickup(p), []));

  function submit() {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a pickup location');
    if (!validAddress(dropoff)) return setError('Enter a destination');
    const pickupAt = dateTimeToIso(date, time);
    if (!pickupAt) return setError('Choose a pickup date and time');
    if (Date.parse(pickupAt) < Date.now()) return setError('Pickup time is in the past');
    const req: QuoteSearchRequest = { service: 'luxury', pickup: toGeo(pickup), dropoff: toGeo(dropoff), pickupAt };
    qs.search(req);
  }

  return (
    <>
      <ServiceHero
        title="Luxury chauffeur"
        text="First-class cars and vetted professional chauffeurs for the moments that matter."
        img="/img/design/business.png"
        objectPosition="center 30%"
        half
      />
      <ServiceLayout
        form={
          <FormCard onSubmit={submit}>
            <SectionHead size={22}>Plan your journey</SectionHead>
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
            <DateTimeRow date={date} time={time} onDate={setDate} onTime={setTime} />
            <FormError message={error} />
            <CtaButton type="submit" disabled={qs.loading}>
              {qs.loading ? 'Finding cars…' : 'Find a luxury car'}
            </CtaButton>
          </FormCard>
        }
        results={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div className="dz-cols-4" style={{ gap: 12 }}>
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
            <SectionHead>Select your car</SectionHead>
            <QuoteOptions state={qs} idleText="Enter your pickup, destination and time to see first-class cars with upfront prices." />
            <ConfirmRow state={qs} verb="Book" showPayment={false} />
          </div>
        }
      />
    </>
  );
}
