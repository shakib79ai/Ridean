'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { SERVICES, VEHICLE_CLASSES, type CoreServiceKey, type QuoteSearchRequest } from '@ridean/shared';
import { IconArrow, IconBag, IconCalendar, IconClock, IconGlobe, IconLocate, IconPin, IconPlane, IconSwap, IconUser, SERVICE_ICON } from './icons';
import { defaultLocal, encodeSearch, localToIso } from './search-params';

export interface BookingSearchProps {
  /** Which service tabs to show (default: Ride Now, Airport transfer, Rent a car) */
  services?: CoreServiceKey[];
  initialService?: CoreServiceKey;
  /** Hide the tab row (service pages show one service only) */
  hideTabs?: boolean;
  /** Where results are shown, default /quotes */
  resultsPath?: string;
  className?: string;
  footer?: ReactNode;
}

const BUTTON_LABEL: Record<CoreServiceKey, string> = {
  ride_now: 'Find a ride',
  airport_transfer: 'Find a transfer',
  rent: 'Search rentals',
  hourly: 'Book by the hour',
  luxury: 'Find a luxury car',
};

export function BookingSearch({ services = ['ride_now', 'airport_transfer', 'rent'], initialService, hideTabs, resultsPath = '/quotes', className, footer }: BookingSearchProps) {
  const router = useRouter();
  const [service, setService] = useState<CoreServiceKey>(initialService ?? services[0]);
  const [now, setNow] = useState(true);
  const [tripType, setTripType] = useState<'one_way' | 'return'>('one_way');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [when, setWhen] = useState(defaultLocal(24));
  const [returnAt, setReturnAt] = useState(defaultLocal(24 * 4));
  const [flight, setFlight] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [hours, setHours] = useState(3);
  const [vehicleClass, setVehicleClass] = useState('');
  const [sameReturn, setSameReturn] = useState(true);
  const [returnLocation, setReturnLocation] = useState('');
  const [rentFrom, setRentFrom] = useState(defaultLocal(24));
  const [rentTo, setRentTo] = useState(defaultLocal(24 * 4));
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const def = SERVICES[service];
  const has = (f: string) => def.fields.includes(f as never);

  function locate() {
    if (!navigator.geolocation) return setPickup('Current location');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPickup(`Current location (${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)})`);
        setLocating(false);
      },
      () => {
        setError('We could not get your location. Please type your pickup address.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!pickup.trim()) return setError(service === 'rent' ? 'Enter a pick-up location' : 'Enter a pickup location');
    if (has('dropoff') && service !== 'hourly' && !dropoff.trim()) return setError('Enter a destination');
    const req: QuoteSearchRequest = { service, pickup: { address: pickup.trim(), ...airportCode(pickup) } };
    if (has('dropoff') && dropoff.trim()) req.dropoff = { address: dropoff.trim(), ...airportCode(dropoff) };
    if (has('when') && !(def.supportsNow && now)) req.pickupAt = localToIso(when);
    if (has('tripType')) {
      req.tripType = tripType;
      if (tripType === 'return') req.returnAt = localToIso(returnAt);
    }
    if (has('flightNumber') && flight.trim()) req.flightNumber = flight.trim().toUpperCase();
    if (has('passengers')) req.passengers = passengers;
    if (has('luggage')) req.luggage = luggage;
    if (has('hours')) req.hours = hours;
    if (has('vehicleClass') && vehicleClass) req.vehicleClass = vehicleClass;
    if (service === 'rent') {
      req.rentalPickupAt = localToIso(rentFrom);
      req.rentalReturnAt = localToIso(rentTo);
      if (!sameReturn && returnLocation.trim()) req.returnLocation = { address: returnLocation.trim(), ...airportCode(returnLocation) };
      if (req.rentalPickupAt && req.rentalReturnAt && req.rentalReturnAt <= req.rentalPickupAt) return setError('Return must be after pick-up');
    }
    if (req.returnAt && req.pickupAt && req.returnAt <= req.pickupAt) return setError('Return must be after the outbound pickup');
    router.push(`${resultsPath}?s=${encodeSearch(req)}`);
  }

  return (
    <form onSubmit={submit} className={`rd-card-glass ${className ?? ''}`} noValidate>
      {!hideTabs && services.length > 1 && (
        <div className="rd-tabs" role="tablist">
          {services.map((k) => {
            const Icon = SERVICE_ICON[k];
            return (
              <button key={k} type="button" role="tab" aria-selected={service === k} onClick={() => { setService(k); setError(''); }}>
                <Icon size={22} />
                {SERVICES[k].label}
              </button>
            );
          })}
        </div>
      )}

      <div className="rd-stack" style={{ padding: 18, ['--gap' as string]: '10px' }}>
        {def.supportsNow && (
          <div className="rd-row" style={{ flexWrap: 'wrap' }}>
            <div className="rd-seg" style={{ flex: '1 1 220px' }}>
              <button type="button" aria-pressed={now} onClick={() => setNow(true)}>Now</button>
              <button type="button" aria-pressed={!now} onClick={() => setNow(false)}>Schedule</button>
            </div>
            {!now && (
              <Field icon={<IconCalendar />} label="Pickup time" style={{ flex: '1 1 200px', minHeight: 44 }}>
                <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
              </Field>
            )}
          </div>
        )}

        {has('tripType') && (
          <>
            <div className="rd-seg">
              <button type="button" aria-pressed={tripType === 'one_way'} onClick={() => setTripType('one_way')}>One way</button>
              <button type="button" aria-pressed={tripType === 'return'} onClick={() => setTripType('return')}>Return</button>
            </div>
            <div className="rd-note"><IconGlobe style={{ color: 'var(--gold)', flexShrink: 0 }} />Transfer between any two places: airport to hotel, hotel to city, or city to city.</div>
          </>
        )}

        <Field
          icon={<IconPin />}
          label={service === 'rent' ? 'Pick-up location' : 'Pickup'}
          action={<button type="button" className="rd-field-action" onClick={locate} aria-label="Use current location" disabled={locating}><IconLocate /></button>}
        >
          <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder={service === 'rent' ? 'Airport, city or address' : 'Airport, hotel or address'} autoComplete="street-address" />
        </Field>

        {has('dropoff') && (
          <Field
            icon={<IconPin />}
            label={service === 'airport_transfer' ? 'Drop-off' : 'Where to?'}
            action={<button type="button" className="rd-field-action" aria-label="Swap pickup and drop-off" onClick={() => { setPickup(dropoff); setDropoff(pickup); }}><IconSwap /></button>}
          >
            <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder={service === 'airport_transfer' ? 'Airport, hotel, city or address' : 'Enter a destination'} />
          </Field>
        )}

        {service === 'rent' && (
          <>
            <label className="rd-row" style={{ fontSize: 14, color: '#c9d3cd', cursor: 'pointer' }}>
              <input type="checkbox" checked={sameReturn} onChange={(e) => setSameReturn(e.target.checked)} style={{ accentColor: '#F6C428', width: 18, height: 18 }} />
              Return to same location
            </label>
            {!sameReturn && (
              <Field icon={<IconPin />} label="Return location">
                <input value={returnLocation} onChange={(e) => setReturnLocation(e.target.value)} placeholder="Enter a different return address" />
              </Field>
            )}
            <div className="rd-grid-2">
              <Field icon={<IconCalendar />} label="Pick-up"><input type="datetime-local" value={rentFrom} onChange={(e) => setRentFrom(e.target.value)} /></Field>
              <Field icon={<IconCalendar />} label="Return"><input type="datetime-local" value={rentTo} onChange={(e) => setRentTo(e.target.value)} /></Field>
            </div>
          </>
        )}

        {has('flightNumber') && (
          <Field icon={<IconPlane size={20} />} label="Flight number (optional)">
            <input value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="e.g. BA 117 — for airport pickups" maxLength={12} />
          </Field>
        )}

        {has('when') && !def.supportsNow && (
          <Field icon={<IconCalendar />} label="Pickup date & time">
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </Field>
        )}

        {has('returnAt') && tripType === 'return' && (
          <Field icon={<IconCalendar />} label="Return date & time">
            <input type="datetime-local" value={returnAt} onChange={(e) => setReturnAt(e.target.value)} />
          </Field>
        )}

        {(has('hours') || has('vehicleClass')) && (
          <div className="rd-grid-2">
            {has('hours') && (
              <Field icon={<IconClock />} label="Hours">
                <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                  {[2, 3, 4, 5, 6, 8, 10, 12].map((h) => <option key={h} value={h}>{h} hours</option>)}
                </select>
              </Field>
            )}
            {has('vehicleClass') && (
              <Field icon={SERVICE_ICON.ride_now({ size: 20 })} label="Vehicle class">
                <select value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)}>
                  <option value="">Any class</option>
                  {VEHICLE_CLASSES.filter((v) => service !== 'luxury' || v.key === 'business' || v.key === 'black').map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
                </select>
              </Field>
            )}
          </div>
        )}

        {(has('passengers') || has('luggage')) && (
          <div className="rd-grid-2">
            {has('passengers') && <Stepper icon={<IconUser />} label="Passengers" value={passengers} min={1} max={14} onChange={setPassengers} />}
            {has('luggage') && <Stepper icon={<IconBag />} label="Bags" value={luggage} min={0} max={12} onChange={setLuggage} />}
          </div>
        )}

        {error && <div className="rd-alert" role="alert">{error}</div>}

        <button type="submit" className="rd-btn rd-btn-block" style={{ height: 54, fontSize: 19 }}>
          {BUTTON_LABEL[service]} <IconArrow size={22} />
        </button>
        {footer}
      </div>
    </form>
  );
}

export function Field({ icon, label, children, action, style }: { icon?: ReactNode; label: string; children: ReactNode; action?: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="rd-field" style={style}>
      {icon && <span className="rd-field-icon">{icon}</span>}
      <label className="rd-field-body">
        <span className="rd-field-label">{label}</span>
        {children}
      </label>
      {action}
    </div>
  );
}

function Stepper({ icon, label, value, min, max, onChange }: { icon: ReactNode; label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="rd-field" style={{ justifyContent: 'space-between' }}>
      <span className="rd-field-icon">{icon}</span>
      <span className="rd-field-body"><span className="rd-field-label">{label}</span><strong>{value}</strong></span>
      <div className="rd-row" style={{ ['--gap' as string]: '6px' }}>
        <button type="button" className="rd-btn rd-btn-dark" style={{ height: 34, width: 34, padding: 0 }} aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <button type="button" className="rd-btn rd-btn-dark" style={{ height: 34, width: 34, padding: 0 }} aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  );
}

/** Picks up a 3-letter airport code typed in brackets, e.g. "Heathrow (LHR)". */
function airportCode(s: string): { iata?: string } {
  const m = s.match(/\(([A-Z]{3})\)/) ?? s.match(/^([A-Z]{3})\b/);
  return m ? { iata: m[1] } : {};
}
