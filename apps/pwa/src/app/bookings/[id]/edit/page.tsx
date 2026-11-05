'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { serviceLabel, type Booking, type UpdateBookingRequest } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { ErrorNote, Field, Skeleton, useToast } from '@/components/site/ui';
import { EDITABLE_STATUSES, Icon, ScreenHeader, errMsg } from '@/components/trips/kit';

interface FormState {
  date: string;
  time: string;
  flightNumber: string;
  passengers: number;
  luggage: number;
  notes: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
function fromBooking(b: Booking): FormState {
  const d = b.pickupAt ? new Date(b.pickupAt) : null;
  return {
    date: d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '',
    time: d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : '',
    flightNumber: b.flightNumber ?? '',
    passengers: b.passengers ?? 1,
    luggage: b.luggage ?? 0,
    notes: b.notes ?? '',
  };
}

const svg = (children: ReactNode) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F3EEDF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth>
      <Edit id={id} />
    </RequireAuth>
  );
}

function Edit({ id }: { id: string }) {
  const { api } = useRidean();
  const router = useRouter();
  const toast = useToast();

  const [b, setB] = useState<Booking | null>(null);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getBooking(id)
      .then((bk) => {
        setB(bk);
        const f = fromBooking(bk);
        setInitial(f);
        setForm(f);
      })
      .catch((e) => setLoadError(errMsg(e, 'We couldn’t load this booking.')));
  }, [api, id]);

  const fallback = `/bookings/${id}`;

  if (loadError)
    return (
      <div style={{ paddingBottom: '24px' }}>
        <ScreenHeader title="Edit booking" fallback={fallback} />
        <div style={{ padding: '0 20px' }}>
          <ErrorNote>{loadError}</ErrorNote>
        </div>
      </div>
    );

  if (!b || !form || !initial)
    return (
      <div style={{ paddingBottom: '24px' }}>
        <ScreenHeader title="Edit booking" fallback={fallback} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
          <Skeleton h={290} />
          <Skeleton h={130} />
        </div>
      </div>
    );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setError('');
  };

  const changes: UpdateBookingRequest = {};
  if ((form.date !== initial.date || form.time !== initial.time) && form.date && form.time) {
    changes.pickupAt = new Date(`${form.date}T${form.time}`).toISOString();
  }
  if (form.flightNumber.trim() !== initial.flightNumber.trim()) changes.flightNumber = form.flightNumber.trim();
  if (form.passengers !== initial.passengers) changes.passengers = form.passengers;
  if (form.luggage !== initial.luggage) changes.luggage = form.luggage;
  if (form.notes.trim() !== initial.notes.trim()) changes.notes = form.notes.trim();
  const dirty = Object.keys(changes).length > 0;

  const pickupMs = b.pickupAt ? Date.parse(b.pickupAt) : NaN;
  const statusOk = EDITABLE_STATUSES.includes(b.status);
  const timeOk = Number.isNaN(pickupMs) || pickupMs - Date.now() > 60 * 60_000;
  const locked = !statusOk || !timeOk;
  const lockReason = !statusOk ? 'This booking can’t be changed any more.' : !timeOk ? 'Changes close 1 hour before pickup — please contact support.' : '';

  const rent = b.service === 'rent';
  const showFlight = b.service === 'airport_transfer' || !!b.flightNumber;
  const showCounts = !rent;
  const showWhen = !!b.pickupAt;
  const airportDrop = !!b.dropoff?.iata || (b.service === 'airport_transfer' && !b.pickup.iata);

  async function save(e?: FormEvent) {
    e?.preventDefault();
    if (!dirty || busy || locked || !b || !form) return;
    if ((form.date || form.time) && (!form.date || !form.time)) return setError('Please choose both a date and a time.');
    setBusy(true);
    setError('');
    try {
      await api.updateBooking(b.id, changes);
      toast('Booking updated');
      router.push(`/bookings/${b.id}`);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  const readOnly = { fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px', overflowWrap: 'anywhere' } as const;

  return (
    <form onSubmit={save} noValidate style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
      <ScreenHeader title="Edit booking" sub={`${serviceLabel(b.service)} · ${b.reference}`} fallback={fallback} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        {locked && <ErrorNote>{lockReason}</ErrorNote>}

        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
          <fieldset disabled={locked || busy} style={{ border: 0, margin: 0, padding: 0, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Field icon={<Icon name={b.pickup.iata ? 'plane' : 'pin'} size={19} color="#F3EEDF" />} label={rent ? 'Pick-up location' : 'Pickup'} style={{ opacity: 0.8 }}>
              <div style={readOnly}>{b.pickup.address}</div>
            </Field>
            {b.dropoff && (
              <Field icon={<Icon name={airportDrop ? 'plane' : 'pin'} size={19} color="#F3EEDF" />} label={rent ? 'Return location' : airportDrop ? 'Airport' : 'Drop-off'} style={{ opacity: 0.8 }}>
                <div style={readOnly}>{b.dropoff.address}</div>
              </Field>
            )}
            <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '-4px' }}>To change the route, cancel and book again.</div>
            {showFlight && (
              <Field icon={svg(<path d="M3 17h18M6 13l-2-5h2.5l2 3h5L11 4h3l4.5 7H21a1.5 1.5 0 0 1 0 3H8z" />)} label="Flight number">
                <input className="dz-input" name="flight" value={form.flightNumber} onChange={(e) => set('flightNumber', e.target.value.toUpperCase())} maxLength={12} placeholder="e.g. BA 117" />
              </Field>
            )}
            {showWhen && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: '0' }}>
                  <Field icon={svg(<><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>)} label="Date">
                    <input className="dz-input" name="date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                  </Field>
                </div>
                <div style={{ flex: 1, minWidth: '0' }}>
                  <Field icon={svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)} label="Time">
                    <input className="dz-input" name="time" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
                  </Field>
                </div>
              </div>
            )}
          </fieldset>
        </div>

        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px' }}>
          <fieldset disabled={locked || busy} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
            {showCounts && <StepRow label="Passengers" value={form.passengers} min={1} max={Math.max(b.vehicle.passengers, form.passengers)} onChange={(v) => set('passengers', v)} />}
            {showCounts && <StepRow label="Luggage" value={form.luggage} min={0} max={Math.max(b.vehicle.bags, form.luggage)} onChange={(v) => set('luggage', v)} />}
            <label style={{ display: 'block', paddingTop: showCounts ? '12px' : 0 }}>
              <span style={{ fontSize: '12px', color: '#9FB2A6' }}>Note for your chauffeur</span>
              <textarea
                rows={2}
                maxLength={500}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. I'll wait by the main entrance"
                style={{ all: 'unset', boxSizing: 'border-box', display: 'block', width: '100%', marginTop: '6px', padding: '12px', border: '1px solid #1F4537', borderRadius: '12px', background: '#071A14', fontSize: '14px', color: '#F3EEDF', whiteSpace: 'pre-wrap' }}
              />
            </label>
          </fieldset>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12.5px', color: '#9FB2A6' }}>
          <Icon name="shield" size={16} />
          Changes are free up to 1 hour before pickup. The price stays the same.
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <button type="submit" className="dz-cta" disabled={!dirty || busy || locked} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '54px', borderRadius: '12px', background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: '17px', fontWeight: 600, width: '100%' }}>
          <span>{busy ? 'Saving…' : 'Save changes'}</span>
        </button>
        {dirty && !busy && (
          <button type="button" className="dz-btn-reset" onClick={() => { setForm(initial); setError(''); }} style={{ textAlign: 'center', fontSize: '14px', color: '#9FB2A6' }}>
            Discard changes
          </button>
        )}
      </div>
    </form>
  );
}

function StepRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const icon = (d: ReactNode) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F3EEDF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {d}
    </svg>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1F4537' }}>
      <div style={{ flex: 1, minWidth: '0' }}>
        <div style={{ fontSize: '15px', color: '#F3EEDF' }}>{label}</div>
      </div>
      <button type="button" className="dz-step" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        {icon(<path d="M5 12h14" />)}
      </button>
      <output aria-live="polite" style={{ minWidth: '26px', textAlign: 'center', fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>{value}</output>
      <button type="button" className="dz-step" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        {icon(<path d="M12 5v14M5 12h14" />)}
      </button>
    </div>
  );
}
