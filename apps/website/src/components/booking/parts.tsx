'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { Quote } from '@ridean/shared';
import { C, ctaStyle, ErrorNote, Field } from '@/components/site/ui';
import { ArrowIcon, CalendarIcon, CardIcon, ClockIcon, LocateIcon, MinusIcon, PinIcon, PlusIcon, SwapIcon } from './icons';
import { classLabel, classThumb, price, useDefaultCard, type Place, type QuoteSearchState } from './useQuoteSearch';
import s from './booking.module.css';

export { s as bookingStyles };

const heroText: CSSProperties = { margin: 0, fontSize: 18, lineHeight: 1.6, color: '#D7DED6' };

/** The hero band at the top of each service page. `half` = image on the right half with a fade (Airport, Hourly, Luxury, Rent). */
export function ServiceHero({ title, text, img, objectPosition, half }: { title: string; text: string; img: string; objectPosition: string; half?: boolean }) {
  const imgStyle: CSSProperties = half
    ? {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 40%)',
        maskImage: 'linear-gradient(90deg,transparent 0%,#000 40%)',
        height: '100%',
        objectFit: 'cover',
        objectPosition,
      }
    : { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition };
  return (
    <section style={{ position: 'relative', height: 330, overflow: 'hidden' }}>
      <img src={img} alt="" style={imgStyle} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg,rgba(7,26,20,.95) 0%,rgba(7,26,20,.7) 38%,rgba(7,26,20,.15) 75%),linear-gradient(180deg,rgba(7,26,20,0) 55%,#071A14 100%)',
        }}
      />
      <div style={{ position: 'relative', height: '100%' }}>
        <div className="dz-container" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 330, maxWidth: 620, paddingBottom: 30, boxSizing: 'border-box' }}>
            <h1 className={s.heroTitle} style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, lineHeight: 1.06, color: C.cream }}>
              {title}
            </h1>
            <div style={{ marginTop: 14 }}>
              <p style={heroText}>{text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Container + the 470px form column / results column grid. */
export function ServiceLayout({ form, results }: { form: ReactNode; results: ReactNode }) {
  return (
    <div className="dz-container" style={{ paddingTop: 0 }}>
      <div className={s.layout}>
        <div className={s.formCol}>{form}</div>
        <div className={s.resultsCol}>{results}</div>
      </div>
    </div>
  );
}

export function FormCard({ children, onSubmit, tabs }: { children: ReactNode; onSubmit: () => void; tabs?: ReactNode }) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 22, boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)' }}
    >
      {tabs}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>{children}</div>
    </form>
  );
}

// ---------------------------------------------------------------- tabs

const CAR_PATH =
  'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z';
const TABS = [
  { key: 'ride', href: '/ride', label: 'Ride', icon: (fill: string) => <path fill={fill} d={CAR_PATH} /> },
  {
    key: 'airport',
    href: '/airport-transfer',
    label: 'Airport transfer',
    icon: (fill: string) => (
      <path fill={fill} transform="rotate(45 12 12)" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    ),
  },
  { key: 'rent', href: '/rent', label: 'Rent a car', icon: (fill: string) => <path fill={fill} fillRule="evenodd" d={`${CAR_PATH}M9.25 14.6h5.5v1.1h-5.5zM9.25 16.6h5.5v1h-5.5z`} /> },
] as const;

/** Ride / Airport transfer / Rent a car tabs at the top of the search card (links to the other service pages). */
export function ServiceTabs({ active }: { active: 'ride' | 'airport' | 'rent' }) {
  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${C.line}`, margin: '0 -22px 16px', padding: '0 12px', overflowX: 'auto' }}>
      {TABS.map((t) => {
        const on = t.key === active;
        const color = on ? C.yellow : C.cream;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={on ? 'page' : undefined}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '15px 4px 13px', borderBottom: `2.5px solid ${on ? C.yellow : 'transparent'}` }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
              {t.icon(color)}
            </svg>
            <span style={{ fontSize: 15.5, color, whiteSpace: 'nowrap' }}>{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- fields

const trailingBtn: CSSProperties = { all: 'unset', cursor: 'pointer', display: 'flex' };

export function PlaceField({
  label,
  value,
  onChange,
  placeholder,
  onLocate,
  locating,
  onSwap,
  swapLabel = 'Swap pickup and destination',
  name,
}: {
  label: string;
  value: Place;
  onChange: (p: Place) => void;
  placeholder?: string;
  onLocate?: () => void;
  locating?: boolean;
  onSwap?: () => void;
  swapLabel?: string;
  name?: string;
}) {
  const trailing = onLocate ? (
    <button type="button" onClick={onLocate} disabled={locating} aria-label="Use current location" style={{ ...trailingBtn, opacity: locating ? 0.5 : 1 }}>
      <LocateIcon />
    </button>
  ) : onSwap ? (
    <button type="button" onClick={onSwap} aria-label={swapLabel} style={trailingBtn}>
      <SwapIcon />
    </button>
  ) : undefined;
  return (
    <Field icon={<PinIcon />} label={label} trailing={trailing}>
      <input
        name={name}
        type="text"
        className="dz-input"
        value={value.address}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange({ address: e.target.value })}
      />
    </Field>
  );
}

export function DateTimeRow({
  date,
  time,
  onDate,
  onTime,
  dateLabel = 'Date',
  timeLabel = 'Time',
}: {
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  dateLabel?: string;
  timeLabel?: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Field icon={<CalendarIcon />} label={dateLabel}>
          <input type="date" className="dz-input" value={date} onChange={(e) => onDate(e.target.value)} />
        </Field>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Field icon={<ClockIcon />} label={timeLabel}>
          <input type="time" className="dz-input" value={time} onChange={(e) => onTime(e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

/** The design's counter row: label + hint, −, value, +. */
export function StepperRow({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.line}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: C.cream }}>{label}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{hint}</div>
      </div>
      <button type="button" className="dz-step" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <MinusIcon />
      </button>
      <output aria-live="polite" style={{ minWidth: 26, textAlign: 'center', fontSize: 16, fontWeight: 600, color: C.cream }}>
        {value}
      </output>
      <button type="button" className="dz-step" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <PlusIcon />
      </button>
    </div>
  );
}

export function CtaButton({ children, disabled, type = 'button', onClick }: { children: ReactNode; disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void }) {
  return (
    <button type={type} className="dz-cta" disabled={disabled} onClick={onClick} style={ctaStyle}>
      <span>{children}</span>
      <ArrowIcon />
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  return message ? <ErrorNote>{message}</ErrorNote> : null;
}

// ---------------------------------------------------------------- results

export const sectionTitle = (size = 24): CSSProperties => ({ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: size, color: C.cream });

export function SectionHead({ children, size = 24, right }: { children: ReactNode; size?: number; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
      <h2 style={sectionTitle(size)}>{children}</h2>
      {right}
    </div>
  );
}

export function SupplierErrors({ errors }: { errors: { supplier: string; message: string }[] }) {
  if (!errors.length) return null;
  return (
    <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
      {errors.map((e) => `${e.supplier} didn’t respond: ${e.message}`).join(' · ')}
    </div>
  );
}

const optStyle: CSSProperties = {
  all: 'unset',
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '10px 12px',
  borderRadius: 14,
};

/** Default right-hand detail under the price: ETA, trip time or capacity. */
export function quoteMeta(q: Quote): string {
  if (q.etaMinutes != null) return `${q.etaMinutes} min away`;
  if (q.durationMinutes != null) return `~${q.durationMinutes} min trip`;
  return `Up to ${q.vehicle.passengers}`;
}
export const quoteSub = (q: Quote) => `${classLabel(q.vehicle.class)} · ${q.vehicle.passengers} seats · ${q.vehicle.bags} bags · ${q.supplierName}`;

/** The "Choose your ride" list: skeletons, errors, empty state and the selectable dz-opt rows. */
export function QuoteOptions({
  state,
  idleText,
  meta = quoteMeta,
  sub = quoteSub,
}: {
  state: QuoteSearchState;
  idleText: string;
  meta?: (q: Quote) => string;
  sub?: (q: Quote) => string;
}) {
  const { quotes, loading, error, selected, select } = state;
  let body: ReactNode;
  if (loading) {
    body = [0, 1, 2].map((i) => <div key={i} className="dz-skel" style={{ height: 72 }} />);
  } else if (error) {
    body = (
      <div style={{ padding: 8 }}>
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  } else if (!quotes) {
    body = <p style={{ margin: 0, padding: '18px 14px', fontSize: 14.5, color: C.muted, lineHeight: 1.5 }}>{idleText}</p>;
  } else if (!quotes.length) {
    body = (
      <p style={{ margin: 0, padding: '18px 14px', fontSize: 14.5, color: C.muted, lineHeight: 1.5 }}>
        No cars are available for this trip right now. Try a different time or location.
      </p>
    );
  } else {
    body = quotes.map((q) => {
      const on = selected?.id === q.id;
      return (
        <button key={q.id} type="button" className={`dz-opt ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => select(q.id)} style={optStyle}>
          <div style={{ width: 78, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
            <img src={classThumb(q)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: C.cream }}>{q.vehicle.name}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{sub(q)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.cream }}>{price(q)}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{meta(q)}</div>
          </div>
        </button>
      );
    });
  }
  return (
    <>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 8 }} aria-busy={loading}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>{body}</div>
      </div>
      {!loading && <SupplierErrors errors={state.errors} />}
    </>
  );
}

/** "Visa •••• 4242 · Change" — the signed-in visitor's default card, otherwise a neutral hint. */
export function PaymentHint() {
  const { card, loading, signedIn } = useDefaultCard();
  const label = loading
    ? '…'
    : card
      ? `${card.brand.charAt(0).toUpperCase()}${card.brand.slice(1)} •••• ${card.last4}`
      : 'Choose payment at checkout';
  return (
    <Link href="/account/payment-methods" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 220px', minWidth: 0 }}>
      <CardIcon />
      <span style={{ fontSize: 15 }}>{label}</span>
      {signedIn && <span style={{ fontSize: 13.5, color: C.gold }}>Change</span>}
    </Link>
  );
}

/** Payment hint + big confirm button row (Ride, Airport transfer). */
export function ConfirmRow({ state, verb = 'Confirm', showPayment = true }: { state: QuoteSearchState; verb?: string; showPayment?: boolean }) {
  const q = state.selected;
  return (
    <div className={s.confirmRow} style={showPayment ? undefined : { justifyContent: 'flex-end' }}>
      {showPayment && <PaymentHint />}
      <div className={s.confirmBox}>
        <CtaButton disabled={!q || state.loading} onClick={() => state.confirm()}>
          {q ? `${verb} ${classLabel(q.vehicle.class)} · ${price(q)}` : verb}
        </CtaButton>
      </div>
    </div>
  );
}

/** Decorative street-grid illustration with a route line (never live tracking). */
export function RouteMap() {
  return (
    <div style={{ position: 'relative', height: 300, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}`, background: '#0A2019' }}>
      <svg width="100%" height="100%" viewBox="0 0 830 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="830" height="300" fill="#0A2019" />
        <g stroke="#143A2E" strokeWidth="12" fill="none">
          <path d="M-10 90 L840 66" />
          <path d="M-10 225 L840 255" />
          <path d="M213 -10 L285 310" />
          <path d="M593 -10 L545 310" />
        </g>
        <g stroke="#10302A" strokeWidth="6" fill="none">
          <path d="M-10 156 L840 150" />
          <path d="M403 -10 L427 310" />
          <path d="M735 -10 L711 310" />
          <path d="M71 -10 L119 310" />
          <path d="M498 -10 L486 310" />
        </g>
        <rect x="320" y="174" width="70" height="34" rx="5" fill="#123A2A" />
        <rect x="451" y="30" width="60" height="40" rx="5" fill="#123A2A" />
        <rect x="95" y="24" width="54" height="36" rx="5" fill="#123A2A" />
        <path d="M166 216 C 332 204, 356 126, 474 108 S 640 72, 676 60" stroke="#D9A94F" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="166" cy="216" r="9" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
        <circle cx="676" cy="60" r="10" fill="#F6C428" />
        <circle cx="676" cy="60" r="4" fill="#071A14" />
      </svg>
    </div>
  );
}

/** Feature tile used on Airport transfer / Hourly (icon box + title + text). */
export function FeatureTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{text}</div>
        </div>
      </div>
    </div>
  );
}

/** Validation shared by the forms: the API needs at least 2 characters per address. */
export const validAddress = (p: Place) => p.address.trim().length >= 2;
