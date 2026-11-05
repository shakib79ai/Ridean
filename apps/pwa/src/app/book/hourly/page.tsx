'use client';

import { Suspense, useState } from 'react';
import { formatMoney, type QuoteSearchRequest } from '@ridean/shared';
import { C, Field } from '@/components/site/ui';
import { PinIcon } from '@/components/booking/icons';
import { Column, Cta, DateTimeRow, FormError, HeroHeader, QuoteOptions, SectionTitle, panel, screenStyle } from '@/components/booking/parts';
import { classLabel, dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useQuoteSearch, validAddress, type Place } from '@/components/booking/useQuoteSearch';

export default function HourlyChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <HourlyChauffeur />
    </Suspense>
  );
}

const HOURS = [2, 3, 4, 6, 8, 10];

function HourlyChauffeur() {
  const qs = useQuoteSearch('hourly');
  const init = qs.initial;
  const start = isoToDateTime(init?.pickupAt) ?? defaultDateTime(24);
  const [hours, setHours] = useState(init?.hours ?? 3);
  const [pickup, setPickup] = useState<Place>(placeFrom(init?.pickup));
  const [date, setDate] = useState(start.date);
  const [time, setTime] = useState(start.time);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  function submit(h = hours) {
    setError('');
    if (!validAddress(pickup)) return setError('Enter a start location');
    const pickupAt = dateTimeToIso(date, time);
    if (!pickupAt) return setError('Choose a date and start time');
    if (Date.parse(pickupAt) < Date.now()) return setError('Start time is in the past');
    const req: QuoteSearchRequest = { service: 'hourly', pickup: toGeo(pickup), pickupAt, hours: h };
    // Keep a final drop-off that came in through a shared ?s= link (this screen has no field for it).
    if (init?.dropoff?.address) req.dropoff = init.dropoff;
    setDirty(false);
    qs.search(req);
  }

  function pickHours(h: number) {
    setHours(h);
    // Prices depend on the hours, so refresh them when prices are already showing.
    if (qs.last) submit(h);
  }

  const q = qs.selected;
  const shownHours = qs.last?.hours ?? hours;
  const canConfirm = !!q && !dirty && !qs.loading;
  const perHour = (x: NonNullable<typeof q>) => `${formatMoney(Math.round(x.price.customerPrice / shownHours), x.price.currency)}/h`;

  return (
    <div style={screenStyle}>
      <HeroHeader img="/img/design/card-sm.png" objectPosition="center 40%" height={200} title="Hourly chauffeur" text="Your time. Our chauffeur." />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (canConfirm) qs.confirm(null, { notes });
          else submit();
        }}
      >
        <Column>
          <SectionTitle>
            <span id="hours-label">How many hours?</span>
          </SectionTitle>
          <div role="group" aria-labelledby="hours-label" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {HOURS.map((h) => (
              <button key={h} type="button" className={`dz-chip ${hours === h ? 'on' : ''}`} aria-pressed={hours === h} disabled={qs.loading} onClick={() => pickHours(h)}>
                {h} h
              </button>
            ))}
          </div>
          <div style={panel(16)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field icon={<PinIcon />} label="Start location">
                <input
                  name="pickup"
                  type="text"
                  className="dz-input"
                  autoComplete="off"
                  value={pickup.address}
                  placeholder="Hotel, office or address"
                  onChange={(e) => {
                    setPickup({ address: e.target.value });
                    setDirty(true);
                  }}
                />
              </Field>
              <DateTimeRow
                date={date}
                time={time}
                onDate={(v) => (setDate(v), setDirty(true))}
                onTime={(v) => (setTime(v), setDirty(true))}
                timeLabel="Start time"
              />
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 12, color: C.muted }}>Notes for your chauffeur</span>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Stops, meeting points, preferences"
                  style={{ all: 'unset', boxSizing: 'border-box', display: 'block', width: '100%', marginTop: 6, padding: 12, border: `1px solid ${C.line}`, borderRadius: 12, background: C.bg, fontSize: 14, color: C.cream, whiteSpace: 'pre-wrap' }}
                />
              </label>
              <FormError message={error} />
            </div>
          </div>
          <SectionTitle>Vehicle class</SectionTitle>
          <QuoteOptions
            state={qs}
            idleText="Choose how many hours, your start location and time to see prices for a dedicated chauffeur."
            sub={(x) => `${x.vehicle.name} · ${x.supplierName}`}
            amount={perHour}
            meta={(x) => `Up to ${x.vehicle.passengers}`}
          />
          <div style={panel(16)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: C.muted }}>
                  {q ? `${classLabel(q.vehicle.class)} · ` : ''}Estimated total · {shownHours} hours
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 600, color: C.cream, marginTop: 2 }}>{qs.loading ? '…' : q ? price(q) : '—'}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 999, background: 'rgba(217,169,79,.14)', color: C.gold, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                Free waiting
              </span>
            </div>
          </div>
          <Cta type="submit" disabled={qs.loading}>
            {qs.loading ? 'Finding chauffeurs…' : canConfirm ? 'Continue' : 'See prices'}
          </Cta>
        </Column>
      </form>
    </div>
  );
}
