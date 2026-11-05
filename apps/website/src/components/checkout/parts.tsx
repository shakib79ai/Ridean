'use client';

import type { CSSProperties, ReactNode } from 'react';
import { VEHICLE_CLASSES, type Booking, type BookingStatus, type ServiceKey, type Vehicle } from '@ridean/shared';
import { C } from '@/components/site/ui';

/** Pieces shared by the checkout and trip pages, lifted from the design markup. */

// ---------------------------------------------------------------- formatting
export const fmtTime = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '');
export const fmtDay = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : '');
export function fmtWhen(iso?: string) {
  if (!iso) return 'As soon as possible';
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const day = same(d, today) ? 'Today' : same(d, tomorrow) ? 'Tomorrow' : fmtDay(iso);
  return `${day}, ${fmtTime(iso)}`;
}

// ---------------------------------------------------------------- booking status
export const PAID_STATUSES: BookingStatus[] = ['payment_authorised', 'confirmed', 'driver_assigned', 'in_progress', 'completed'];
export const LIVE_STATUSES: BookingStatus[] = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress'];
export const CANCELLABLE_STATUSES: BookingStatus[] = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned'];
export const EDITABLE_STATUSES: BookingStatus[] = ['confirmed', 'driver_assigned'];

const STATUS: Record<BookingStatus, { label: string; tone: 'ok' | 'warn' | 'bad' | 'info' }> = {
  pending_payment: { label: 'Awaiting payment', tone: 'warn' },
  payment_authorised: { label: 'Confirming', tone: 'warn' },
  confirmed: { label: 'Confirmed', tone: 'ok' },
  driver_assigned: { label: 'Chauffeur assigned', tone: 'ok' },
  in_progress: { label: 'On trip', tone: 'ok' },
  completed: { label: 'Completed', tone: 'info' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
  failed: { label: 'Not confirmed', tone: 'bad' },
};
const TONE = {
  ok: { bg: 'rgba(76,195,138,.14)', fg: C.ok },
  warn: { bg: 'rgba(246,196,40,.14)', fg: C.yellow },
  bad: { bg: 'rgba(229,100,90,.14)', fg: C.bad },
  info: { bg: 'rgba(159,178,166,.14)', fg: C.soft },
};
export const statusLabel = (s: BookingStatus) => STATUS[s]?.label ?? s;
export const statusColor = (s: BookingStatus) => TONE[STATUS[s]?.tone ?? 'info'].fg;

export function StatusPill({ status }: { status: BookingStatus }) {
  const info = STATUS[status] ?? { label: status, tone: 'info' as const };
  const t = TONE[info.tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 999, background: t.bg, color: t.fg, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {info.tone === 'ok' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.fg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
      {info.label}
    </span>
  );
}

export function paidWith(b: Booking): string | undefined {
  switch (b.paymentMethod) {
    case 'card':
      return 'paid by card';
    case 'wallet':
      return 'paid with Ridean Wallet';
    case 'business':
      return 'billed to your business account';
    case 'supplier':
      return `paid to ${b.supplierName}`;
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------- images
export function serviceImage(service: ServiceKey) {
  if (service === 'airport_transfer') return '/img/design/airport.png';
  if (service === 'rent') return '/img/svc-rent.jpg';
  return '/img/design/business.png';
}

const CLASS_IMG: Record<string, string> = {
  sedan: '/img/cls-sedan.jpg',
  xl: '/img/cls-xl.jpg',
  extra_comfort: '/img/cls-comfort.jpg',
  business: '/img/design/business.png',
  black: '/img/cls-black.jpg',
};
export const vehicleImage = (v: Vehicle) => v.imageUrl || CLASS_IMG[v.class] || '/img/design/business.png';

export function vehicleTitle(v: Vehicle) {
  return VEHICLE_CLASSES.find((c) => c.key === v.class)?.label ?? v.name;
}
export function vehicleSubtitle(v: Vehicle) {
  const title = vehicleTitle(v);
  return [v.name !== title ? v.name : '', `${v.passengers} seats`, `${v.bags} bags`].filter(Boolean).join(' · ');
}

// ---------------------------------------------------------------- design blocks
const panel = (padding: number): CSSProperties => ({ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding });

export function Panel({ children, padding = 20, style }: { children: ReactNode; padding?: number; style?: CSSProperties }) {
  return <div style={{ ...panel(padding), ...style }}>{children}</div>;
}

export function H1({ children }: { children: ReactNode }) {
  return <h1 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 40, lineHeight: 1.06, color: C.cream }}>{children}</h1>;
}

export function H2({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
      <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: size, color: C.cream }}>{children}</h2>
    </div>
  );
}

export function PriceLine({ label, value, strong, color }: { label: ReactNode; value: ReactNode; strong?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: strong ? 15 : 14, color: color ?? (strong ? C.cream : C.muted), fontWeight: strong ? 600 : 400 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export const Divider = () => <div style={{ height: 1, background: C.line, margin: '6px 0' }} />;

export function VehicleCard({ vehicle, action }: { vehicle: Vehicle; action?: ReactNode }) {
  return (
    <Panel padding={18}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 96, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vehicleImage(vehicle)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{vehicleTitle(vehicle)}</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 3 }}>{vehicleSubtitle(vehicle)}</div>
        </div>
        {action}
      </div>
    </Panel>
  );
}

/** Pickup → drop-off card with the dot-and-line rail. */
export function RouteCard({ booking }: { booking: Booking }) {
  const rent = booking.service === 'rent';
  return (
    <Panel>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5 }}>
          <div style={{ width: 11, height: 11, borderRadius: 6, border: `2.5px solid ${C.gold}`, boxSizing: 'border-box' }} />
          {booking.dropoff && (
            <>
              <div style={{ width: 2, flex: 1, background: C.line, margin: '4px 0' }} />
              <div style={{ width: 11, height: 11, borderRadius: 2, background: C.yellow }} />
            </>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontSize: 12.5, color: C.muted }}>{rent ? 'Pick-up' : 'Pickup'} · {fmtWhen(booking.pickupAt)}</div>
            <div style={{ fontSize: 16, marginTop: 3, overflowWrap: 'anywhere' }}>{booking.pickup.address}</div>
          </div>
          {booking.dropoff && (
            <div>
              <div style={{ fontSize: 12.5, color: C.muted }}>
                {rent ? 'Return' : 'Drop-off'}
                {booking.returnAt ? ` · ${fmtWhen(booking.returnAt)}` : ''}
              </div>
              <div style={{ fontSize: 16, marginTop: 3, overflowWrap: 'anywhere' }}>{booking.dropoff.address}</div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function Avatar({ name, size = 52 }: { name?: string; size?: number }) {
  const ini = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: 'linear-gradient(135deg,#E2B04A,#9C6F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: Math.round(size * 0.38), color: '#0A1F18', flexShrink: 0 }}>
      {ini || (
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="#0A1F18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- checkout stepper
const STEPS = ['Choose', 'Review', 'Pay', 'Confirmed'];

export function CheckoutSteps({ step }: { step: 2 | 3 }) {
  return (
    <ol aria-label="Booking steps" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, padding: 0, listStyle: 'none', flexWrap: 'wrap', marginTop: 0 }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }} aria-current={current ? 'step' : undefined}>
            {i > 0 && <span style={{ color: C.line }} aria-hidden="true">—</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: done || current ? C.cream : C.muted }}>
              <span style={{ width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: done ? C.yellow : current ? '#1E5442' : C.panel2, color: done ? '#0A1F18' : C.cream }}>
                {done ? '✓' : n}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------- icons used across these pages
export const svgProps = { fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const, style: { flexShrink: 0 } };

export const IconUser = ({ c = C.cream }: { c?: string }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" stroke={c} {...svgProps}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
);
export const IconPhone = ({ c = C.cream, size = 19 }: { c?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={c} {...svgProps}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
);
export const IconMail = ({ c = C.cream }: { c?: string }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" stroke={c} {...svgProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6l8.5 7 8.5-7" /></svg>
);
export const IconLock = ({ c = C.cream, size = 19 }: { c?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={c} {...svgProps}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
);
export const IconFlight = ({ c = C.cream }: { c?: string }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" stroke={c} {...svgProps}><path d="M3 17h18M6 13l-2-5h2.5l2 3h5L11 4h3l4.5 7H21a1.5 1.5 0 0 1 0 3H8z" /></svg>
);
export const IconPlane = ({ c = C.cream, size = 19 }: { c?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={c} {...svgProps}><path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" /></svg>
);
export const IconPin = ({ c = C.cream, size = 19 }: { c?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={c} {...svgProps}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></svg>
);
export const IconCheck = ({ c = C.ok, size = 16 }: { c?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={c} {...svgProps} strokeWidth={2.6}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}><path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const IconCard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></svg>
);
export const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18M16 15h2" /><path d="M6 6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>
);
export const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></svg>
);
export const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconEye = ({ off }: { off?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke={C.muted} {...svgProps}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);
