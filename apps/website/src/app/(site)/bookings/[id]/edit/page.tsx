'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { formatMoney, serviceLabel, type Booking, type UpdateBookingRequest } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { C, ErrorNote, Field, Skeleton, useToast } from '@/components/site/ui';
import { EDITABLE_STATUSES, H1, IconFlight, IconPin, IconPlane, Panel, PriceLine, VehicleCard, svgProps } from '@/components/checkout/parts';

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

export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="dz-container">
      <RequireAuth>
        <Edit id={id} />
      </RequireAuth>
    </div>
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
      .catch((e: Error) => setLoadError(e.message));
  }, [api, id]);

  if (loadError) return <ErrorNote>{loadError}</ErrorNote>;
  if (!b || !form || !initial) {
    return (
      <div className="dz-main-aside">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <H1>Edit booking</H1>
          <Skeleton h={300} />
          <Skeleton h={130} />
        </div>
        <Skeleton h={260} />
      </div>
    );
  }

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
  const showLuggage = !rent;
  const showPassengers = !rent;
  const showWhen = !!b.pickupAt;
  const airportDrop = !!b.dropoff?.iata || (b.service === 'airport_transfer' && !b.pickup.iata);

  async function save(e?: FormEvent) {
    e?.preventDefault();
    if (!dirty || busy || locked || !b) return;
    if ((form!.date || form!.time) && (!form!.date || !form!.time)) return setError('Please choose both a date and a time.');
    setBusy(true);
    setError('');
    try {
      await api.updateBooking(b.id, changes);
      toast('Booking updated');
      router.push(`/bookings/${b.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="dz-main-aside" onSubmit={save} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <H1>Edit booking</H1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.muted }}>
          {serviceLabel(b.service)} · Ref. {b.reference}
        </p>
        {locked && <ErrorNote>{lockReason}</ErrorNote>}

        <Panel padding={22}>
          <fieldset disabled={locked || busy} style={{ border: 0, margin: 0, padding: 0, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field icon={b.pickup.iata ? <IconPlane /> : <IconPin />} label={rent ? 'Pick-up location' : 'Pickup'} style={{ opacity: 0.8 }}>
              <div style={{ fontSize: 14.5, color: C.cream, marginTop: 2, overflowWrap: 'anywhere' }}>{b.pickup.address}</div>
            </Field>
            {b.dropoff && (
              <Field icon={airportDrop ? <IconPlane /> : <IconPin />} label={rent ? 'Return location' : airportDrop ? 'Airport' : 'Drop-off'} style={{ opacity: 0.8 }}>
                <div style={{ fontSize: 14.5, color: C.cream, marginTop: 2, overflowWrap: 'anywhere' }}>{b.dropoff.address}</div>
              </Field>
            )}
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: -4 }}>To change the route, cancel and book again.</div>
            {showFlight && (
              <Field icon={<IconFlight />} label="Flight number">
                <input className="dz-input" name="flight" value={form.flightNumber} onChange={(e) => set('flightNumber', e.target.value.toUpperCase())} maxLength={12} placeholder="e.g. BA 117" />
              </Field>
            )}
            {showWhen && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <Field
                    icon={
                      <svg width="19" height="19" viewBox="0 0 24 24" stroke={C.cream} {...svgProps}>
                        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                        <path d="M3.5 10h17M8 3v4M16 3v4" />
                      </svg>
                    }
                    label="Date"
                  >
                    <input className="dz-input" name="date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                  </Field>
                </div>
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <Field
                    icon={
                      <svg width="19" height="19" viewBox="0 0 24 24" stroke={C.cream} {...svgProps}>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    }
                    label="Time"
                  >
                    <input className="dz-input" name="time" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
                  </Field>
                </div>
              </div>
            )}
          </fieldset>
        </Panel>

        <Panel padding={18}>
          <fieldset disabled={locked || busy} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
            {showPassengers && <StepRow label="Passengers" value={form.passengers} min={1} max={Math.max(b.vehicle.passengers, form.passengers)} onChange={(v) => set('passengers', v)} />}
            {showLuggage && <StepRow label="Luggage" value={form.luggage} min={0} max={Math.max(b.vehicle.bags, form.luggage)} onChange={(v) => set('luggage', v)} />}
            <label style={{ display: 'block', paddingTop: showPassengers || showLuggage ? 14 : 0 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Note for your chauffeur</span>
              <textarea
                rows={2}
                maxLength={500}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. I'll wait by the main entrance"
                style={{ all: 'unset', boxSizing: 'border-box', display: 'block', width: '100%', marginTop: 6, padding: 12, border: `1px solid ${C.line}`, borderRadius: 12, background: C.bg, fontSize: 14, color: C.cream, whiteSpace: 'pre-wrap' }}
              />
            </label>
          </fieldset>
        </Panel>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0, position: 'sticky', top: 20, alignSelf: 'start' }}>
        <VehicleCard vehicle={b.vehicle} />
        <Panel padding={22}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <PriceLine label="Current total" value={formatMoney(b.price.customerPrice, b.price.currency)} strong />
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Changes are free up to 1 hour before pickup. The price stays the same.</div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <button type="submit" className="dz-cta" disabled={!dirty || busy || locked} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 17, fontWeight: 600, width: '100%' }}>
              <span>{busy ? 'Saving…' : 'Save changes'}</span>
            </button>
            {dirty ? (
              <button type="button" className="dz-btn-reset" onClick={() => { setForm(initial); setError(''); }} disabled={busy} style={{ textAlign: 'center', fontSize: 14, color: C.muted }}>
                Discard changes
              </button>
            ) : (
              <Link href={`/bookings/${b.id}`} style={{ textAlign: 'center', fontSize: 14, color: C.muted }}>
                Back to booking
              </Link>
            )}
          </div>
        </Panel>
      </div>
    </form>
  );
}

function StepRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const icon = (d: ReactNode) => (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke={C.cream} {...svgProps}>
      {d}
    </svg>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.line}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: C.cream }}>{label}</div>
      </div>
      <button type="button" className="dz-step" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        {icon(<path d="M5 12h14" />)}
      </button>
      <output aria-live="polite" style={{ minWidth: 26, textAlign: 'center', fontSize: 16, fontWeight: 600, color: C.cream }}>{value}</output>
      <button type="button" className="dz-step" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        {icon(<path d="M12 5v14M5 12h14" />)}
      </button>
    </div>
  );
}
