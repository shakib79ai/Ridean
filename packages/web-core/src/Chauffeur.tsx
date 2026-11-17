'use client';
import type { CSSProperties } from 'react';
import { CHAUFFEUR_CLASSES, LUXURY_CLASS_KEYS, HOURLY_INCLUDED_MILES, HOURLY_MAX_HOURS, chauffeurClass, formatMoney, type CarShape, type ChauffeurClass, type Quote } from '@ridean/shared';

/** Side-view car silhouettes in Ridean gold, one per body shape of the 8 chauffeur classes. */
const BODY: Record<CarShape, string> = {
  sedan: 'M4 38c0-5 1-8 6-9l14-2 14-9c3-2 6-3 10-3h22c4 0 7 1 10 3l12 9 16 2c5 1 8 3 8 7v2c0 1-1 2-2 2h-4a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M42 26l9-7c2-1 3-2 6-2h10v9z M71 26v-9h6c3 0 5 1 7 3l7 6z',
  suv: 'M4 37c0-6 2-9 7-10l12-2 9-11c2-2 4-3 7-3h44c3 0 5 1 7 3l9 10 10 2c4 1 6 4 6 8v4c0 1-1 2-2 2h-5a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M36 25l7-9c1-1 2-2 4-2h12v11z M63 25V14h14v11z M81 25V14h5c2 0 3 1 4 2l7 9z',
  minivan: 'M4 37c0-6 2-8 7-9l9-2 15-13c3-2 5-3 9-3h46c4 0 6 2 8 4l10 13 4 3c3 1 4 4 4 7v2c0 1-1 2-2 2h-5a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M40 25l10-9c1-1 3-2 5-2h12v11z M71 25V14h16v11z M91 25V14h4c2 0 3 1 4 3l5 8z',
  van: 'M4 37c0-5 2-7 6-8l8-2 9-15c2-3 4-5 8-5h72c4 0 6 3 6 6v24c0 2-1 3-2 3h-5a11 11 0 0 0-21 0H33a11 11 0 0 0-21 0H6c-1 0-2-1-2-2z M30 26l7-12c1-2 2-3 4-3h7v15z M52 26V11h15v15z M71 26V11h15v15z M90 26V11h15v15z',
};

export function CarSilhouette({ shape, width = 88, style }: { shape: CarShape; width?: number; style?: CSSProperties }) {
  const id = `rdcar-${shape}`;
  return (
    <svg width={width} height={Math.round((width * 50) / 120)} viewBox="0 0 120 50" aria-hidden="true" style={{ display: 'block', flexShrink: 0, ...style }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBE08C" />
          <stop offset=".55" stopColor="#E2B04A" />
          <stop offset="1" stopColor="#B98428" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} fillRule="evenodd" d={BODY[shape]} />
      {[22, 95].map((x) => (
        <g key={x}>
          <circle cx={x} cy={40} r={8.2} fill="#0E2A22" />
          <circle cx={x} cy={40} r={6.4} fill={`url(#${id})`} />
          <circle cx={x} cy={40} r={2.6} fill="#0E2A22" />
        </g>
      ))}
    </svg>
  );
}

/** Car picture for any vehicle class key; Ride Now classes fall back to a sedan or SUV. */
export function classShape(key: string): CarShape {
  const c = chauffeurClass(key);
  if (c) return c.shape;
  return key === 'xl' ? 'suv' : 'sedan';
}

/** − 3 hours + stepper used by the Hourly chauffeur screens on the website and PWA. */
export function HoursStepper({
  value,
  min,
  max = HOURLY_MAX_HOURS,
  onChange,
  disabled,
  big = 34,
}: {
  value: number;
  min: number;
  max?: number;
  onChange: (h: number) => void;
  disabled?: boolean;
  big?: number;
}) {
  const btn: CSSProperties = { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  return (
    <div>
      <div className="dz-hstep" role="group" aria-label="Hours">
        <button type="button" className="dz-hsb" style={btn} aria-label="Fewer hours" disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }} aria-live="polite">
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: big, fontWeight: 600, lineHeight: 1, color: '#F3EEDF' }}>{value}</span>
          <span style={{ fontSize: 15, color: '#C9D2CB', marginLeft: 8 }}>{value === 1 ? 'hour' : 'hours'}</span>
        </div>
        <button type="button" className="dz-hsb plus" style={btn} aria-label="More hours" disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>
      <div style={{ fontSize: 12.5, color: '#9FB2A6', textAlign: 'center', marginTop: 8 }}>
        Minimum {min} hours · {value * HOURLY_INCLUDED_MILES} miles included
      </div>
    </div>
  );
}

const PAX = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="7.5" r="4.5" /><path d="M3.5 21c0-4.7 3.8-8 8.5-8s8.5 3.3 8.5 8z" /></svg>
);
const BAG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2.5h6a1.5 1.5 0 0 1 1.5 1.5v2.5H19a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h2.5V4A1.5 1.5 0 0 1 9 2.5zm.5 2v2h5v-2z" /></svg>
);

export interface ClassChoice {
  key: string;
  label: string;
  example: string;
  passengers: number;
  bags: number;
  shape: CarShape;
  photo?: string;
  /** Big price text, e.g. "$100" */
  price: string;
  /** Small text after the price, e.g. "/h" */
  unit?: string;
  /** Line under the price, e.g. "min 3 h" or "from" */
  note?: string;
  /** Not offered for this search */
  unavailable?: boolean;
}

function CarPhoto({ c, w, h }: { c: ClassChoice; w: number; h: number }) {
  if (!c.photo) return <div className="dz-opt-tile" style={{ width: w, height: h }}><CarSilhouette shape={c.shape} width={w - 16} /></div>;
  return (
    <div style={{ width: w, height: h, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#12352B' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.photo} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  );
}

/**
 * The 8-class car picker: a 2-column card grid on the website, a list of rows in the PWA.
 * The selected class gets a gold border, a gold price and a check mark.
 */
export function ClassPicker({ choices, value, onPick, layout = 'grid', className }: { choices: ClassChoice[]; value: string | null; onPick: (key: string) => void; layout?: 'grid' | 'list'; className?: string }) {
  const grid = layout === 'grid';
  return (
    <div role="radiogroup" aria-label="Vehicle class" className={className} style={className ? undefined : { display: grid ? 'grid' : 'flex', gridTemplateColumns: grid ? '1fr 1fr' : undefined, flexDirection: grid ? undefined : 'column', gap: grid ? 14 : 8 }}>
      {choices.map((c) => {
        const on = c.key === value;
        const priceBox = (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="dz-opt-price" style={{ fontSize: grid ? 22 : 17, fontWeight: 700, lineHeight: 1.1 }}>
              {c.price}
              {c.unit && <span style={{ fontSize: grid ? 13 : 12, fontWeight: 500, color: '#9FB2A6' }}>{c.unit}</span>}
            </div>
            {c.note && <div style={{ fontSize: 12, color: '#9FB2A6', marginTop: 3 }}>{c.note}</div>}
          </div>
        );
        const cap = (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: '#9FB2A6' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} aria-label={`${c.passengers} passengers`}>{PAX}{c.passengers}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} aria-label={`${c.bags} bags`}>{BAG}{c.bags}</span>
          </div>
        );
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={c.unavailable}
            className={`dz-opt dz-opt-card ${on ? 'on' : ''}`}
            onClick={() => onPick(c.key)}
            style={grid ? { flexDirection: 'column', alignItems: 'stretch', gap: 12, padding: 16, opacity: c.unavailable ? 0.45 : 1 } : { padding: '10px 12px 10px 10px', opacity: c.unavailable ? 0.45 : 1 }}
          >
            {grid ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <CarPhoto c={c} w={150} h={84} />
                  {priceBox}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#F3EEDF' }}>{c.label}</div>
                  <div style={{ fontSize: 13, color: '#9FB2A6', marginTop: 3 }}>{c.unavailable ? 'Not available for this trip' : c.example}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {cap}
                  <span className="dz-opt-ck" aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <CarPhoto c={c} w={92} h={56} />
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F3EEDF' }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: '#9FB2A6', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.unavailable ? 'Not available for this trip' : c.example}</div>
                  <div style={{ marginTop: 4 }}>{cap}</div>
                </div>
                {priceBox}
                <span className="dz-opt-ck" aria-hidden="true" />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

const whole = (minor: number, currency: string) => formatMoney(minor, currency).replace(/\.00$/, '');

/** Cheapest quote per chauffeur class. */
export function bestQuoteByClass(quotes: Quote[] | null): Map<string, Quote> {
  const m = new Map<string, Quote>();
  for (const q of quotes ?? []) {
    const cur = m.get(q.vehicle.class);
    if (!cur || q.price.customerPrice < cur.price.customerPrice) m.set(q.vehicle.class, q);
  }
  return m;
}

/** Hours a class is billed for: never below its minimum (Executive Van: 4). */
export const billedHours = (key: string, hours: number) => Math.max(chauffeurClass(key)?.minHours ?? 0, hours);

/**
 * Cards for the 8 classes. Before a search they show the Ridean rate card ("$100/h", "from $130");
 * after a search they show live prices, and classes no supplier offered are marked unavailable.
 */
export function chauffeurChoices(mode: 'hourly' | 'transfer' | 'luxury', quotes: Quote[] | null, hours = 3, currency = 'USD'): ClassChoice[] {
  const best = bestQuoteByClass(quotes);
  const list = (CHAUFFEUR_CLASSES as readonly ChauffeurClass[]).filter((c) => mode !== 'luxury' || LUXURY_CLASS_KEYS.includes(c.key));
  return list.map((c) => {
    const q = best.get(c.key);
    const base = { key: c.key, label: c.label, example: q?.vehicle.name ?? c.example, passengers: c.passengers, bags: c.bags, shape: c.shape, photo: q?.vehicle.imageUrl || c.photo, unavailable: !!quotes && !q };
    if (mode === 'hourly') {
      const perHour = q ? Math.round(q.price.customerPrice / billedHours(c.key, hours)) : c.hourlyRate;
      return { ...base, price: whole(perHour, q?.price.currency ?? currency), unit: '/h', note: `min ${c.minHours} h` };
    }
    if (mode === 'luxury') return { ...base, price: q ? formatMoney(q.price.customerPrice, q.price.currency) : '—', note: q ? 'trip total' : undefined };
    return q ? { ...base, price: formatMoney(q.price.customerPrice, q.price.currency), note: q.supplierName } : { ...base, price: whole(c.airportFrom, currency), note: 'airport from' };
  });
}
