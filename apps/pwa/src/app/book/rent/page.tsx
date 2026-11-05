'use client';

import { Suspense, useMemo, useState } from 'react';
import { formatMoney, type Quote, type QuoteSearchRequest } from '@ridean/shared';
import { C, ErrorNote, Field, Toggle } from '@/components/site/ui';
import { CalendarIcon } from '@/components/booking/icons';
import { Column, Cta, FormError, HeroHeader, PlaceField, SectionTitle, ServiceTabs, SupplierErrors, panel, screenStyle } from '@/components/booking/parts';
import { classLabel, classThumb, dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useQuoteSearch, validAddress, type Place } from '@/components/booking/useQuoteSearch';

export default function RentComparePage() {
  return (
    <Suspense fallback={null}>
      <RentCompare />
    </Suspense>
  );
}

/** Filter chips → Ridean vehicle classes (rental partners' ACRISS codes are mapped to these by the API). */
const FILTERS = [
  { key: 'all', label: 'All', classes: [] as string[] },
  { key: 'economy', label: 'Economy', classes: ['sedan', 'extra_comfort'] },
  { key: 'suv', label: 'SUV', classes: ['xl'] },
  { key: 'lux', label: 'Luxury', classes: ['business', 'black'] },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

const RENT_TIME = '10:00';

function days(req: QuoteSearchRequest | null): number {
  if (!req?.rentalPickupAt || !req.rentalReturnAt) return 1;
  return Math.max(1, Math.ceil((Date.parse(req.rentalReturnAt) - Date.parse(req.rentalPickupAt)) / 86_400_000));
}

function RentCompare() {
  const qs = useQuoteSearch('rent');
  const init = qs.initial;
  const from = isoToDateTime(init?.rentalPickupAt) ?? defaultDateTime(24);
  const to = isoToDateTime(init?.rentalReturnAt) ?? defaultDateTime(24 * 4);
  const [pickup, setPickup] = useState<Place>(placeFrom(init?.pickup));
  const [sameReturn, setSameReturn] = useState(!init?.returnLocation);
  const [returnLocation, setReturnLocation] = useState<Place>(placeFrom(init?.returnLocation));
  const [d1, setD1] = useState(from.date);
  const [d2, setD2] = useState(to.date);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<'price' | 'seats'>('price');

  function submit() {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a pick-up location');
    const rentalPickupAt = dateTimeToIso(d1, RENT_TIME);
    const rentalReturnAt = dateTimeToIso(d2, RENT_TIME);
    if (!rentalPickupAt || !rentalReturnAt) return setError('Choose pick-up and return dates');
    if (rentalReturnAt <= rentalPickupAt) return setError('Return must be after pick-up');
    const req: QuoteSearchRequest = { service: 'rent', pickup: toGeo(pickup), rentalPickupAt, rentalReturnAt };
    if (!sameReturn) {
      if (!validAddress(returnLocation)) return setError('Enter a return location');
      req.returnLocation = toGeo(returnLocation);
    }
    qs.search(req);
  }

  const n = days(qs.last);
  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const list = (qs.quotes ?? []).filter((q) => !f.classes.length || (f.classes as readonly string[]).includes(q.vehicle.class));
    return [...list].sort((a, b) => (sort === 'price' ? a.price.customerPrice - b.price.customerPrice : b.vehicle.passengers - a.vehicle.passengers));
  }, [qs.quotes, filter, sort]);
  const place = qs.last?.pickup.address ?? '';

  const heading = qs.loading ? 'Searching…' : qs.quotes ? `${shown.length} ${shown.length === 1 ? 'car' : 'cars'} · ${sort === 'price' ? 'best prices' : 'most seats'}` : 'Compare rental cars';

  return (
    <div style={screenStyle}>
      <HeroHeader img="/img/design/business.png" objectPosition="center 30%" height={190} title="Rent a car" text="Freedom to move on your terms." />
      <Column>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div style={panel(16)}>
            <ServiceTabs active="rent" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PlaceField label="Pickup location" name="pickup" value={pickup} onChange={setPickup} placeholder="Airport, city or address" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: C.cream }}>
                <Toggle on={sameReturn} onChange={setSameReturn} label="Return to same location" />
                <span aria-hidden="true" onClick={() => setSameReturn(!sameReturn)} style={{ cursor: 'pointer' }}>
                  Return to same location
                </span>
              </div>
              {!sameReturn && <PlaceField label="Return location" name="ret" value={returnLocation} onChange={setReturnLocation} placeholder="Enter a different return address" />}
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
              <FormError message={error} />
            </div>
          </div>
          <Cta type="submit" disabled={qs.loading}>
            {qs.loading ? 'Searching partners…' : 'Search rental partners'}
          </Cta>
        </form>
        <SectionTitle
          right={
            <button
              type="button"
              className="dz-btn-reset"
              onClick={() => setSort(sort === 'price' ? 'seats' : 'price')}
              style={{ fontSize: 12.5, fontWeight: 600, color: C.gold, whiteSpace: 'nowrap' }}
              aria-label={`Sort by ${sort === 'price' ? 'seats' : 'price'}`}
            >
              Sort: {sort === 'price' ? 'Price' : 'Seats'}
            </button>
          }
        >
          {heading}
        </SectionTitle>
        <div role="group" aria-label="Filter by category" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={`dz-chip ${filter === f.key ? 'on' : ''}`} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        {qs.loading ? (
          [0, 1, 2].map((i) => <div key={i} className="dz-skel" style={{ height: 160 }} />)
        ) : qs.error ? (
          <ErrorNote>{qs.error}</ErrorNote>
        ) : !qs.quotes ? (
          <EmptyCard text="Enter a pick-up location and your dates to compare prices from our rental partners." />
        ) : !qs.quotes.length ? (
          <EmptyCard text="No cars are available for these dates. Try different dates or a nearby location." />
        ) : !shown.length ? (
          <EmptyCard text="No cars in this category for your dates. Try another category." />
        ) : (
          shown.map((q) => <RentalCard key={q.id} q={q} days={n} place={place} onSelect={() => qs.confirm(q)} />)
        )}
        {!qs.loading && <SupplierErrors errors={qs.errors} />}
      </Column>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <div style={{ ...panel('18px 16px'), fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{text}</div>;
}

function RentalCard({ q, days: n, place, onSelect }: { q: Quote; days: number; place: string; onSelect: () => void }) {
  const details = [classLabel(q.vehicle.class), `${q.vehicle.passengers} seats`, `${q.vehicle.bags} bags`, ...q.inclusions.slice(0, 1)].join(' · ');
  return (
    <div style={panel(14)}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 96, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={classThumb(q)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600 }}>{q.vehicle.name}</div>
          <div style={{ fontSize: 12.5, color: C.gold, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {q.supplierName}
            {place ? ` · ${place}` : ''}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.35 }}>{details}</div>
          {q.cancellation && <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.35 }}>{q.cancellation}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 21, fontWeight: 600 }}>{formatMoney(Math.round(q.price.customerPrice / n), q.price.currency)}</span>
          <span style={{ fontSize: 12.5, color: C.muted }}>
            /day · {price(q)} for {n} {n === 1 ? 'day' : 'days'}
          </span>
        </div>
        <button
          type="button"
          className="dz-btn-reset"
          onClick={onSelect}
          style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 14, fontWeight: 600, flexShrink: 0 }}
        >
          Select
        </button>
      </div>
    </div>
  );
}
