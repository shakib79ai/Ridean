'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import type { Quote } from '@ridean/shared';
import { C, ctaStyle, ErrorNote, Field } from '@/components/site/ui';
import { ArrowIcon, BackIcon, CalendarIcon, CarIcon, CardIcon, ClockIcon, LocateIcon, MinusIcon, PinIcon, PlaneIcon, PlusIcon, RentIcon, SwapIcon } from './icons';
import { classLabel, classThumb, price, useDefaultCard, type Place, type QuoteSearchState } from './useQuoteSearch';

// ---------------------------------------------------------------- layout

export const panel = (padding: number | string = 16): CSSProperties => ({ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding });

/** Page column under a header: 20px gutters, 14px rhythm, bottom padding clear of the home indicator. */
export function Column({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 20px', minWidth: 0, ...style }}>{children}</div>;
}

export const screenStyle: CSSProperties = { paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' };

/** history.back() when there is somewhere to go back to, otherwise a sensible parent route. */
export function useBack(fallback: string) {
  const router = useRouter();
  return () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback);
  };
}

export function BackButton({ fallback = '/', overlay }: { fallback?: string; overlay?: boolean }) {
  const back = useBack(fallback);
  const style: CSSProperties = overlay
    ? { position: 'absolute', top: 12, left: 16, width: 40, height: 40, borderRadius: 20, background: 'rgba(6,20,15,.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }
    : { width: 40, height: 40, borderRadius: 20, border: `1px solid ${C.line}`, background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' };
  return (
    <button type="button" className="dz-btn-reset" aria-label="Back" onClick={back} style={style}>
      <BackIcon />
    </button>
  );
}

/** Plain screen header: back button · title · optional subtitle. */
export function PageHeader({ title, subtitle, fallback }: { title: string; subtitle?: string; fallback?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 20px 14px' }}>
      <BackButton fallback={fallback} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 24, lineHeight: 1.15, color: C.cream }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

/** Photo header used by Airport transfer, Hourly, Luxury and Rent. */
export function HeroHeader({ img, objectPosition, height, title, text, fallback = '/' }: { img: string; objectPosition: string; height: number; title: string; text: string; fallback?: string }) {
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(7,26,20,.25) 0%,rgba(7,26,20,.15) 40%,#071A14 100%)' }} />
      <BackButton fallback={fallback} overlay />
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
        <h1 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 30, lineHeight: 1.08, color: C.cream }}>{title}</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#D7DED6' }}>{text}</p>
      </div>
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, margin: '4px 0 -2px' }}>
      <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600, color: C.cream }}>{children}</h2>
      {right}
    </div>
  );
}

// ---------------------------------------------------------------- tabs

export type TabKey = 'ride' | 'airport' | 'rent';
export const SERVICE_TABS: { key: TabKey; href: string; label: string; icon: (c: string) => ReactNode }[] = [
  { key: 'ride', href: '/book/ride', label: 'Ride', icon: (c) => <CarIcon color={c} /> },
  { key: 'airport', href: '/book/airport-transfer', label: 'Airport transfer', icon: (c) => <PlaneIcon color={c} /> },
  { key: 'rent', href: '/book/rent', label: 'Rent a car', icon: (c) => <RentIcon color={c} /> },
];

const tabStyle = (on: boolean): CSSProperties => ({ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '14px 4px 12px', borderBottom: `2.5px solid ${on ? C.yellow : 'transparent'}` });

/** Ride / Airport transfer / Rent a car tabs at the top of a search card (links to the other booking screens). */
export function ServiceTabs({ active }: { active: TabKey }) {
  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${C.line}`, margin: '0 -16px 14px', padding: '0 10px' }}>
      {SERVICE_TABS.map((t) => {
        const on = t.key === active;
        const color = on ? C.yellow : C.cream;
        return (
          <Link key={t.key} href={t.href} aria-current={on ? 'page' : undefined} style={tabStyle(on)}>
            {t.icon(color)}
            <span style={{ fontSize: 13.5, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
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
      <input name={name} type="text" className="dz-input" value={value.address} placeholder={placeholder} autoComplete="off" onChange={(e) => onChange({ address: e.target.value })} />
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
export function StepperRow({ label, hint, value, min, max, onChange, last }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: last ? undefined : `1px solid ${C.line}` }}>
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

export function Cta({ children, disabled, type = 'button', onClick, style }: { children: ReactNode; disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button type={type} className="dz-cta" disabled={disabled} onClick={onClick} style={{ ...ctaStyle, ...style }}>
      <span>{children}</span>
      <ArrowIcon />
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  return message ? <ErrorNote>{message}</ErrorNote> : null;
}

// ---------------------------------------------------------------- results

export function SupplierErrors({ errors }: { errors: { supplier: string; message: string }[] }) {
  if (!errors.length) return null;
  return <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{errors.map((e) => `${e.supplier} didn’t respond: ${e.message}`).join(' · ')}</div>;
}

const optStyle: CSSProperties = { all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 14 };

/** ETA, trip time or capacity — shown under the price. */
export function quoteMeta(q: Quote): string {
  if (q.etaMinutes != null) return `${q.etaMinutes} min`;
  if (q.durationMinutes != null) return `~${q.durationMinutes} min trip`;
  return `Up to ${q.vehicle.passengers}`;
}

const mutedText: CSSProperties = { margin: 0, padding: '16px 12px', fontSize: 14, color: C.muted, lineHeight: 1.5 };

/** The design's option list: skeletons, errors, idle / empty text and the selectable dz-opt rows. */
export function QuoteOptions({
  state,
  idleText,
  title = (q) => classLabel(q.vehicle.class),
  sub = (q) => `${q.vehicle.passengers} seats · ${q.vehicle.name} · ${q.supplierName}`,
  amount = price,
  meta = quoteMeta,
}: {
  state: QuoteSearchState;
  idleText: string;
  title?: (q: Quote) => string;
  sub?: (q: Quote) => string;
  amount?: (q: Quote) => string;
  meta?: (q: Quote) => string;
}) {
  const { quotes, loading, error, selected, select } = state;
  let body: ReactNode;
  if (loading) body = [0, 1, 2].map((i) => <div key={i} className="dz-skel" style={{ height: 72 }} />);
  else if (error)
    body = (
      <div style={{ padding: 6 }}>
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  else if (!quotes) body = <p style={mutedText}>{idleText}</p>;
  else if (!quotes.length) body = <p style={mutedText}>No cars are available for this trip right now. Try a different time or location.</p>;
  else
    body = quotes.map((q) => {
      const on = selected?.id === q.id;
      return (
        <button key={q.id} type="button" className={`dz-opt ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => select(q.id)} style={optStyle}>
          <div style={{ width: 78, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
            <img src={classThumb(q)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: C.cream }}>{title(q)}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{sub(q)}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.cream }}>{amount(q)}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{meta(q)}</div>
          </div>
        </button>
      );
    });
  return (
    <>
      <div style={panel(8)} aria-busy={loading}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{body}</div>
      </div>
      {!loading && <SupplierErrors errors={state.errors} />}
    </>
  );
}

/** "Visa •••• 4242 · Change" — the signed-in user's default card, otherwise a neutral hint. */
export function PaymentHint() {
  const { card, loading, signedIn } = useDefaultCard();
  const label = loading ? '…' : card ? `${card.brand.charAt(0).toUpperCase()}${card.brand.slice(1)} •••• ${card.last4}` : signedIn ? 'Add a card or pay at checkout' : 'Choose payment at checkout';
  return (
    <Link href="/account/payment-methods" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 2px' }}>
      <CardIcon />
      <span style={{ flex: 1, fontSize: 14.5 }}>{label}</span>
      {signedIn && <span style={{ fontSize: 13, color: C.gold }}>Change</span>}
    </Link>
  );
}

/** Decorative street-grid illustration with a route line (never live tracking). */
export function RouteMap({ compact }: { compact?: boolean }) {
  if (compact)
    return (
      <div style={{ position: 'relative', height: 150, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}`, background: '#0A2019' }}>
        <svg width="100%" height="100%" viewBox="0 0 350 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="350" height="150" fill="#0A2019" />
          <g stroke="#143A2E" strokeWidth="10" fill="none">
            <path d="M-10 45 L360 33" />
            <path d="M-10 112 L360 128" />
            <path d="M90 -10 L120 160" />
            <path d="M250 -10 L230 160" />
          </g>
          <g stroke="#10302A" strokeWidth="5" fill="none">
            <path d="M-10 78 L360 75" />
            <path d="M170 -10 L180 160" />
            <path d="M310 -10 L300 160" />
            <path d="M30 -10 L50 160" />
          </g>
          <rect x="135" y="87" width="40" height="28" rx="4" fill="#123A2A" />
          <rect x="190" y="15" width="36" height="34" rx="4" fill="#123A2A" />
          <path d="M70 108 C 140 102, 150 63, 200 54 S 270 36, 285 30" stroke="#D9A94F" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="70" cy="108" r="8" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
          <circle cx="285" cy="30" r="9" fill="#F6C428" />
          <circle cx="285" cy="30" r="3.5" fill="#071A14" />
        </svg>
      </div>
    );
  return (
    <div style={{ position: 'relative', height: 190, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}`, background: '#0A2019' }}>
      <svg width="100%" height="100%" viewBox="0 0 350 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="350" height="190" fill="#0A2019" />
        <g stroke="#143A2E" strokeWidth="10" fill="none">
          <path d="M-10 57 L360 42" />
          <path d="M-10 142 L360 162" />
          <path d="M90 -10 L120 200" />
          <path d="M250 -10 L230 200" />
        </g>
        <g stroke="#10302A" strokeWidth="5" fill="none">
          <path d="M-10 99 L360 95" />
          <path d="M170 -10 L180 200" />
          <path d="M310 -10 L300 200" />
          <path d="M30 -10 L50 200" />
        </g>
        <rect x="135" y="110" width="40" height="28" rx="4" fill="#123A2A" />
        <rect x="190" y="19" width="36" height="34" rx="4" fill="#123A2A" />
        <path d="M70 137 C 140 129, 150 80, 200 68 S 270 46, 285 38" stroke="#D9A94F" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="70" cy="137" r="8" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
        <circle cx="285" cy="38" r="9" fill="#F6C428" />
        <circle cx="285" cy="38" r="3.5" fill="#071A14" />
      </svg>
    </div>
  );
}
