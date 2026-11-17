'use client';

import { Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { LUXURY_CLASS_KEYS, type QuoteSearchRequest } from '@ridean/shared';
import { ClassPicker, bestQuoteByClass, chauffeurChoices } from '@ridean/web-core';
import { C } from '@/components/site/ui';
import {
  bookingStyles as s,
  CtaButton,
  DateTimeRow,
  FormCard,
  FormError,
  PlaceField,
  SectionHead,
  ServiceHero,
  ServiceLayout,
  validAddress,
} from '@/components/booking/parts';
import { classLabel as chauffeurLabel, dateTimeToIso, price, defaultDateTime, isoToDateTime, placeFrom, toGeo, useLocate, useQuoteSearch, type Place } from '@/components/booking/useQuoteSearch';

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
  // Only luxury classes are offered here: keep the selection on one of them (cheapest by default).
  const { quotes, selected, select } = qs;
  useEffect(() => {
    if (!quotes?.length || (selected && LUXURY_CLASS_KEYS.includes(selected.vehicle.class))) return;
    const lux = quotes.filter((x) => LUXURY_CLASS_KEYS.includes(x.vehicle.class)).sort((a, b) => a.price.customerPrice - b.price.customerPrice);
    if (lux[0]) select(lux[0].id);
  }, [quotes, selected, select]);
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
        flat
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
              {qs.loading ? 'Searching…' : qs.quotes ? 'Search again' : 'Search'}
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
            <div>
              <SectionHead size={28}>Choose your car</SectionHead>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>First-class sedans and SUVs · fixed price for your trip</div>
            </div>
            {qs.error && <FormError message={qs.error} />}
            {qs.loading ? (
              <div className={s.classGrid}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="dz-skel" style={{ height: 196, borderRadius: 16 }} />
                ))}
              </div>
            ) : qs.quotes ? (
              <>
                <ClassPicker
                  className={s.classGrid}
                  choices={chauffeurChoices('luxury', qs.quotes)}
                  value={qs.selected?.vehicle.class ?? null}
                  onPick={(key) => {
                    const best = bestQuoteByClass(qs.quotes).get(key);
                    if (best) qs.select(best.id);
                  }}
                />
                {qs.selected && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: 400, maxWidth: '100%' }}>
                      <CtaButton onClick={() => qs.confirm()}>{`Continue with ${chauffeurLabel(qs.selected.vehicle.class)} · ${price(qs.selected)}`}</CtaButton>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 16, padding: '24px', color: C.muted, fontSize: 15, lineHeight: 1.6 }}>
                Enter your pickup and destination, choose a date and time, then press <b style={{ color: C.cream }}>Search</b> to see the available luxury cars and prices.
              </div>
            )}
          </div>
        }
      />
    </>
  );
}
