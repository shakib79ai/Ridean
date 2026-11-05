'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quote, QuoteSearchRequest } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Card, Chips, ErrorText, Icon, IconField, PageHead, Seg, Stepper, useToast } from '@/components/ui';
import { Divider, KvRow, vehicleClassLabel } from '@/components/ops/bits';
import { m, svc } from '@/lib/format';

const SERVICES = ['ride_now', 'airport_transfer', 'hourly', 'luxury', 'rent'] as const;
type Svc = (typeof SERVICES)[number];
const HOURS = [2, 3, 4, 6, 8, 12] as const;

const pad = (n: number) => String(n).padStart(2, '0');
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
/** Next full hour, at least 60 minutes ahead. */
function defaultStart() {
  const d = new Date(Date.now() + 60 * 60_000);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}
const toIso = (date: string, time: string) => (date && time ? new Date(`${date}T${time}`).toISOString() : undefined);

function emptyForm() {
  const s = defaultStart();
  const r = new Date(s.getTime() + 3 * 864e5);
  return {
    firstName: '', lastName: '', email: '', phone: '',
    pickup: '', dropoff: '',
    date: localDate(s), time: localTime(s),
    returnDate: localDate(r), returnTime: localTime(s),
    hours: 3, flightNumber: '', passengers: 1, luggage: 0,
  };
}
type Form = ReturnType<typeof emptyForm>;

export default function NewBookingPage() {
  const { api } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const [service, setService] = useState<Svc>('ride_now');
  const [f, setF] = useState<Form>(emptyForm);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((o) => ({ ...o, [k]: v }));

  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [supplierErrors, setSupplierErrors] = useState<{ supplier: string; message: string }[]>([]);
  const [searchedKey, setSearchedKey] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [payment, setPayment] = useState<'card' | 'invoice'>('card');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const needsDropoff = service !== 'hourly' && service !== 'rent';
  const hasParty = service !== 'rent';

  /** The quote request for the current form, or a reason it can't be built yet. */
  const request = useMemo((): { req?: QuoteSearchRequest; problem?: string } => {
    if (!f.pickup.trim()) return { problem: 'Enter a pickup address' };
    if (needsDropoff && !f.dropoff.trim()) return { problem: 'Enter a destination' };
    const at = toIso(f.date, f.time);
    if (service !== 'ride_now' && !at) return { problem: 'Choose a date and time' };
    if (at && new Date(at).getTime() < Date.now() - 5 * 60_000) return { problem: 'The pickup time is in the past' };
    const pickup = { address: f.pickup.trim() };
    if (service === 'rent') {
      const back = toIso(f.returnDate, f.returnTime);
      if (!back) return { problem: 'Choose a return date and time' };
      if (at && new Date(back) <= new Date(at)) return { problem: 'Return must be after pickup' };
      return { req: { service, pickup, returnLocation: pickup, rentalPickupAt: at, rentalReturnAt: back } };
    }
    const base: QuoteSearchRequest = { service, pickup, pickupAt: at, passengers: f.passengers };
    if (needsDropoff) base.dropoff = { address: f.dropoff.trim() };
    if (service === 'hourly') base.hours = f.hours;
    if (service === 'airport_transfer') {
      base.tripType = 'one_way';
      base.luggage = f.luggage;
      if (f.flightNumber.trim()) base.flightNumber = f.flightNumber.trim().toUpperCase();
    }
    return { req: base };
  }, [f, service, needsDropoff]);
  const reqKey = request.req ? JSON.stringify(request.req) : '';
  const stale = quotes != null && reqKey !== searchedKey;
  const quote = !stale ? quotes?.find((q) => q.id === selected) : undefined;

  const customerProblem = !f.firstName.trim() || !f.lastName.trim()
    ? 'Enter the customer’s first and last name'
    : !/^\S+@\S+\.\S+$/.test(f.email.trim())
      ? 'Enter the customer’s email — their booking is linked to it'
      : f.phone.trim().length < 5
        ? 'Enter the customer’s phone number'
        : null;

  async function findVehicles() {
    if (!request.req) return setErr(request.problem ?? 'Complete the route');
    setErr(null);
    setSearching(true);
    try {
      const r = await api.searchQuotes(request.req);
      const sorted = [...r.quotes].sort((a, b) => a.price.customerPrice - b.price.customerPrice);
      setQuotes(sorted);
      setSupplierErrors(r.errors ?? []);
      setSearchedKey(reqKey);
      setSelected(sorted[0]?.id ?? null);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function create() {
    if (!quote) return;
    if (customerProblem) return setErr(customerProblem);
    setErr(null);
    setSaving(true);
    try {
      const b = await api.admin.createBooking({
        quoteId: quote.id,
        customer: { firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim(), phone: f.phone.trim() },
        flightNumber: service === 'airport_transfer' && f.flightNumber.trim() ? f.flightNumber.trim().toUpperCase() : undefined,
        payment: quote.price.collectedBy === 'supplier' ? 'invoice' : payment,
      });
      toast(`Booking ${b.reference} created for ${f.firstName.trim()} ${f.lastName.trim()}`);
      router.push(`/bookings/${b.id}`);
    } catch (e) {
      setErr((e as Error).message);
      setSaving(false);
    }
  }

  function reset() {
    setF(emptyForm());
    setQuotes(null);
    setSupplierErrors([]);
    setSelected(null);
    setSearchedKey('');
    setPayment('card');
    setErr(null);
  }

  const name = `${f.firstName} ${f.lastName}`.trim();
  const route = service === 'hourly'
    ? `${f.pickup.trim() || '—'} · ${f.hours} h`
    : service === 'rent'
      ? f.pickup.trim() || '—'
      : `${f.pickup.trim() || '—'} → ${f.dropoff.trim() || '—'}`;

  return (
    <>
      <PageHead title="New booking" sub="Create a booking on behalf of a customer" searchPlaceholder="Search bookings, customers…" />

      <div className="az-grid az-g-side" style={{ alignItems: 'start' }}>
        {/* ---------------- left: service + form */}
        <div className="az-stack">
          <Card title="Service">
            <div style={{ marginTop: 16 }}>
              <Chips label="Service" options={SERVICES.map((k) => [k, svc(k)] as const)} value={service} onChange={(v) => { setService(v); setQuotes(null); setSelected(null); }} />
            </div>
          </Card>

          <Card title="Customer & route">
            <form className="az-form" style={{ marginTop: 16 }} onSubmit={(e) => { e.preventDefault(); void findVehicles(); }}>
              <IconField icon="user" label="First name" value={f.firstName} onChange={(e) => set('firstName', e.target.value)} autoComplete="off" required />
              <IconField icon="user" label="Last name" value={f.lastName} onChange={(e) => set('lastName', e.target.value)} autoComplete="off" required />
              <IconField icon="mail" label="Customer email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="off" required />
              <IconField icon="phone" label="Customer phone" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="off" required />

              <div className="full">
                <IconField icon="pin" label={service === 'rent' ? 'Pickup & return location' : 'Pickup'} value={f.pickup} onChange={(e) => set('pickup', e.target.value)} placeholder={service === 'airport_transfer' ? 'e.g. JFK Airport, Terminal 4' : 'Street address or place'} />
              </div>
              {needsDropoff && (
                <div className="full">
                  <IconField icon="pin" label="Destination" value={f.dropoff} onChange={(e) => set('dropoff', e.target.value)} placeholder="Street address or place" />
                </div>
              )}

              <IconField icon="calendar" label={service === 'rent' ? 'Pickup date' : 'Date'} type="date" value={f.date} min={localDate(new Date())} onChange={(e) => set('date', e.target.value)} />
              <IconField icon="clock" label={service === 'rent' ? 'Pickup time' : 'Time'} type="time" value={f.time} onChange={(e) => set('time', e.target.value)} />
              {service === 'rent' && (
                <>
                  <IconField icon="calendar" label="Return date" type="date" value={f.returnDate} min={f.date} onChange={(e) => set('returnDate', e.target.value)} />
                  <IconField icon="clock" label="Return time" type="time" value={f.returnTime} onChange={(e) => set('returnTime', e.target.value)} />
                </>
              )}

              {service === 'airport_transfer' && (
                <div className="full">
                  <IconField icon="plane" label="Flight number (optional)" value={f.flightNumber} maxLength={12} onChange={(e) => set('flightNumber', e.target.value)} placeholder="e.g. BA117" />
                </div>
              )}

              {service === 'hourly' && (
                <div className="full az-stack" style={{ gap: 8 }}>
                  <span className="az-muted" style={{ fontSize: 13 }}>Hours</span>
                  <Chips label="Hours" options={HOURS.map((h) => [String(h), `${h} hours`] as const)} value={String(f.hours)} onChange={(v) => set('hours', Number(v))} />
                </div>
              )}

              {hasParty && (
                <div className="full" style={{ marginTop: 4 }}>
                  <div style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                    <Stepper label="Passengers" value={f.passengers} onChange={(n) => set('passengers', n)} min={1} max={20} />
                  </div>
                  {service === 'airport_transfer' && (
                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                      <Stepper label="Checked bags" value={f.luggage} onChange={(n) => set('luggage', n)} min={0} max={20} />
                    </div>
                  )}
                </div>
              )}

              <div className="full az-between" style={{ marginTop: 6 }}>
                <span className="az-muted" style={{ fontSize: 13 }}>{request.problem ?? (stale ? 'Route changed — search again for current prices.' : quotes ? `${quotes.length} ${quotes.length === 1 ? 'vehicle' : 'vehicles'} found` : 'Search live prices from every supplier.')}</span>
                <Btn kind="y" type="submit" icon="search" disabled={searching}>{searching ? 'Searching…' : quotes && !stale ? 'Search again' : 'Find vehicles'}</Btn>
              </div>
            </form>
          </Card>
        </div>

        {/* ---------------- right: vehicle + summary */}
        <div className="az-stack" style={{ gap: 14, position: 'sticky', top: 110 }}>
          <div className="az-section-title"><h2>Vehicle</h2></div>
          <div className="az-card" style={{ padding: 8 }}>
            {!quotes || stale ? (
              <div className="az-row az-muted" style={{ padding: '18px 14px', fontSize: 14, flexWrap: 'nowrap' }}>
                <Icon name="car" size={20} />
                <span>{stale ? 'The route changed. Find vehicles again to see current prices.' : 'Fill in the route and press “Find vehicles” to compare live prices.'}</span>
              </div>
            ) : quotes.length === 0 ? (
              <div className="az-muted" style={{ padding: '18px 14px', fontSize: 14 }}>
                No vehicles available for this trip. Try another time or service.
              </div>
            ) : (
              <div role="group" aria-label="Vehicle" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {quotes.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    aria-pressed={q.id === selected}
                    className="az-opt"
                    style={{ padding: '10px 12px', gap: 12, borderColor: q.id === selected ? undefined : 'transparent', background: q.id === selected ? undefined : 'transparent' }}
                    onClick={() => setSelected(q.id)}
                  >
                    <div className="az-ic" style={{ width: 52, height: 52, borderRadius: 12 }}>
                      <Icon name={q.vehicle.passengers >= 5 ? 'users' : 'car'} size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 600 }}>{q.vehicle.name}</div>
                      <div className="az-muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                        {q.vehicle.passengers} seats · {vehicleClassLabel(q.vehicle.class)} · {q.supplierName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{m(q.price.customerPrice, q.price.currency)}</div>
                      <div className="az-muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {q.etaMinutes != null ? `${q.etaMinutes} min` : q.durationMinutes != null ? `${q.durationMinutes} min trip` : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {supplierErrors.length > 0 && !stale && (
              <div className="az-muted" style={{ fontSize: 12.5, padding: '8px 14px 10px' }}>
                Not available from {supplierErrors.map((e) => e.supplier).join(', ')}.
              </div>
            )}
          </div>

          <Card>
            <div className="az-stack" style={{ gap: 14 }}>
              <h2 className="az-h2">Summary</h2>
              <div>
                <KvRow label="Customer">{name || '—'}</KvRow>
                <KvRow label="Route">{route}</KvRow>
                {quote && <KvRow label="Vehicle">{quote.vehicle.name} · {quote.supplierName}</KvRow>}
              </div>
              <Divider />
              <div className="az-between" style={{ alignItems: 'baseline', flexWrap: 'nowrap' }}>
                <span style={{ fontSize: 15 }}>Price</span>
                <span className="az-serif" style={{ fontSize: 30, fontWeight: 600 }}>{quote ? m(quote.price.customerPrice, quote.price.currency) : '—'}</span>
              </div>
              {quote && (quote.price.collectedBy === 'supplier' ? (
                <div className="az-note">Paid to {quote.supplierName} directly — the customer pays the supplier at booking.</div>
              ) : (
                <div className="az-stack" style={{ gap: 8 }}>
                  <span className="az-muted" style={{ fontSize: 13 }}>Payment</span>
                  <Seg label="Payment" options={[['card', 'Customer’s saved card'], ['invoice', 'Invoice the customer']] as const} value={payment} onChange={setPayment} />
                </div>
              ))}
              <ErrorText>{err}</ErrorText>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn kind="o" style={{ flex: 1 }} onClick={reset} disabled={saving}>Cancel</Btn>
                <Btn kind="y" icon="check" style={{ flex: 2 }} onClick={() => void create()} disabled={!quote || saving}>{saving ? 'Creating…' : 'Create booking'}</Btn>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
