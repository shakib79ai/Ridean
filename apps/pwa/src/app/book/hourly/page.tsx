'use client';

import { Suspense, useEffect, useState } from 'react';
import { HOURLY_INCLUDED_MILES, chauffeurClass, formatMoney, minHoursFor, type QuoteSearchRequest } from '@ridean/shared';
import { ClassPicker, HoursStepper, bestQuoteByClass, billedHours, chauffeurChoices } from '@ridean/web-core';
import { C, Field } from '@/components/site/ui';
import { PinIcon } from '@/components/booking/icons';
import { Column, Cta, DateTimeRow, FormError, HeroHeader, SectionTitle, panel, screenStyle } from '@/components/booking/parts';
import { dateTimeToIso, defaultDateTime, isoToDateTime, placeFrom, price, toGeo, useQuoteSearch, validAddress, type Place } from '@/components/booking/useQuoteSearch';

export default function HourlyChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <HourlyChauffeur />
    </Suspense>
  );
}

function HourlyChauffeur() {
  const qs = useQuoteSearch('hourly');
  const init = qs.initial;
  const start = isoToDateTime(init?.pickupAt) ?? defaultDateTime(24);
  const [cls, setCls] = useState<string>(init?.vehicleClass ?? 'business');
  const [hours, setHours] = useState(Math.max(init?.hours ?? 3, minHoursFor(init?.vehicleClass ?? 'business')));
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

  const classQuote = bestQuoteByClass(qs.quotes).get(cls) ?? null;
  const { selected, select } = qs;
  useEffect(() => {
    if (classQuote && selected?.id !== classQuote.id) select(classQuote.id);
  }, [classQuote, selected, select]);

  function pickClass(key: string) {
    setCls(key);
    const min = minHoursFor(key);
    if (hours < min) pickHours(min);
  }

  const q = classQuote;
  const c = chauffeurClass(cls);
  const minH = minHoursFor(cls);
  const shownHours = qs.last?.hours ?? hours;
  const billed = billedHours(cls, shownHours);
  const perHour = q ? Math.round(q.price.customerPrice / billed) : (c?.hourlyRate ?? 0);
  const currency = q?.price.currency ?? 'USD';
  const canConfirm = !!q && !dirty && !qs.loading && qs.last?.hours === hours;
  const row = (k: string, v: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, color: C.muted, padding: '5px 0' }}>
      <span>{k}</span>
      <b style={{ color: C.cream, fontWeight: 600, textAlign: 'right' }}>{v}</b>
    </div>
  );

  return (
    <div style={screenStyle}>
      <HeroHeader img="/img/design/card-sm.png" objectPosition="center 40%" height={200} title="Hourly chauffeur" text="Your time. Our chauffeur." />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Column>
          <SectionTitle>How long?</SectionTitle>
          <HoursStepper value={hours} min={minH} onChange={pickHours} disabled={qs.loading} big={30} />
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
              <Cta type="submit" disabled={qs.loading}>
                {qs.loading ? 'Searching…' : qs.quotes && !dirty && qs.last?.hours === hours ? 'Search again' : 'Search'}
              </Cta>
            </div>
          </div>
          {(qs.quotes || qs.loading) && (
            <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <SectionTitle>Choose your car</SectionTitle>
            <span style={{ fontSize: 12.5, color: C.muted }}>Prices per hour</span>
          </div>
          {qs.error && <FormError message={qs.error} />}
          {qs.loading ? (
            [0, 1, 2].map((i) => <div key={i} className="dz-skel" style={{ height: 80, borderRadius: 16 }} />)
          ) : (
            <ClassPicker layout="list" choices={chauffeurChoices('hourly', qs.quotes, shownHours)} value={cls} onPick={pickClass} />
          )}
          {q && !qs.loading && (
          <div style={panel(16)}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 6 }}>Your booking</div>
            {row('Vehicle', c?.label ?? cls)}
            {row('Hourly rate', `${formatMoney(perHour, currency).replace(/\.00$/, '')} × ${billed} h`)}
            {row('Miles included', `${billed * HOURLY_INCLUDED_MILES} miles`)}
            <div style={{ height: 1, background: C.line, margin: '10px 0 12px' }} />
            <div style={{ fontSize: 12.5, color: C.muted }}>
              {canConfirm ? 'Total' : 'Estimated total'} · {billed} hours
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 600, color: C.cream, marginTop: 2 }}>{qs.loading ? '…' : q ? price(q) : formatMoney(perHour * billed, currency)}</div>
            <div style={{ marginTop: 14 }}>
              <Cta onClick={() => canConfirm && qs.confirm(q, { notes })} disabled={!canConfirm}>
                {canConfirm ? 'Continue' : 'Search again to update the price'}
              </Cta>
            </div>
            <div style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>Free cancellation until 24 h before pickup.</div>
          </div>
          )}
            </>
          )}
        </Column>
      </form>
    </div>
  );
}
