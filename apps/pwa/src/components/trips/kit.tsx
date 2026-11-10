'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { VEHICLE_CLASSES, formatMoney, serviceLabel, type Booking, type BookingStatus, type RideanApi, type ServiceKey, type Vehicle } from '@ridean/shared';
import { C } from '@/components/site/ui';

/** Helpers shared by the PWA trip, wallet, help and legal screens (ported from the website's checkout/account kits). */

// ---------------------------------------------------------------- formatting
export const money = (minor: number, currency = 'USD') => formatMoney(minor, currency || 'USD');
export const signedMoney = (minor: number, currency = 'USD') => `${minor < 0 ? '−' : '+'}${money(Math.abs(minor), currency)}`;
export const errMsg = (e: unknown, fallback = 'Something went wrong. Please try again.') => (e instanceof Error && e.message ? e.message : fallback);

export const fmtTime = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
export const fmtDay = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '');
export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
/** "Fri, 14 Nov · 6:30 AM" */
export function fmtWhen(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day.replace(/^(\w+)\s/, '$1, ')} · ${fmtTime(iso)}`;
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

// ---------------------------------------------------------------- booking status
export const PAID_STATUSES: BookingStatus[] = ['payment_authorised', 'confirmed', 'driver_assigned', 'in_progress', 'completed'];
export const LIVE_STATUSES: BookingStatus[] = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress'];
export const CANCELLABLE_STATUSES: BookingStatus[] = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned'];
export const EDITABLE_STATUSES: BookingStatus[] = ['confirmed', 'driver_assigned'];

const PILL: Record<BookingStatus, { label: string; tone: 'ok' | 'warn' | 'bad' | 'info' }> = {
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
export const statusLabel = (s: BookingStatus) => PILL[s]?.label ?? s;
export const statusColor = (s: BookingStatus) => TONE[PILL[s]?.tone ?? 'info'].fg;

export function StatusPill({ status }: { status: BookingStatus }) {
  const info = PILL[status] ?? { label: status, tone: 'info' as const };
  const t = TONE[info.tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', background: t.bg, color: t.fg, fontSize: '11.5px', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {info.tone === 'ok' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.fg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
      {info.label}
    </span>
  );
}

/** Short label of how the booking was paid, for the "Total paid · …" line. */
export function paidVia(b: Booking): string | undefined {
  switch (b.paymentMethod) {
    case 'card':
      return 'Card';
    case 'wallet':
      return 'Ridean Wallet';
    case 'business':
      return 'Business account';
    default:
      return undefined;
  }
}

// Trip-card status colours (the Trips board shows Completed in green)
const CARD_STATUS: Record<BookingStatus, { label: string; color: string }> = {
  pending_payment: { label: 'Awaiting payment', color: C.gold },
  payment_authorised: { label: 'Booked', color: C.ok },
  confirmed: { label: 'Confirmed', color: C.ok },
  driver_assigned: { label: 'Chauffeur assigned', color: C.ok },
  in_progress: { label: 'In progress', color: C.yellow },
  completed: { label: 'Completed', color: C.ok },
  cancelled: { label: 'Cancelled', color: C.bad },
  failed: { label: 'Failed', color: C.bad },
};
export const cardStatus = (s: BookingStatus) => CARD_STATUS[s] ?? { label: s, color: C.muted };

const ACTIVE: BookingStatus[] = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress'];
export const isUpcoming = (b: Booking, now = Date.now()) =>
  ACTIVE.includes(b.status) && (b.status === 'in_progress' || !b.pickupAt || new Date(b.pickupAt).getTime() >= now);
export const tripTime = (b: Booking) => new Date(b.pickupAt ?? b.createdAt).getTime();

// ---------------------------------------------------------------- services, vehicles, images
export type IconName = 'car' | 'rental' | 'plane' | 'clock' | 'star' | 'plus' | 'refund' | 'card' | 'doc' | 'pin' | 'route' | 'shield' | 'download' | 'mail' | 'trips' | 'phone' | 'message';

const PATHS: Record<IconName, ReactNode> = {
  car: <><path d="M3 15l1.6-4.6A2 2 0 0 1 6.5 9h11a2 2 0 0 1 1.9 1.4L21 15v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M6.5 13.5h.01M17.5 13.5h.01" /></>,
  rental: <><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><rect x="3" y="11" width="18" height="6" rx="2" /><path d="M6 17v2M18 17v2M7 14h.01M17 14h.01" /></>,
  plane: <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  refund: <path d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></>,
  route: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" /></>,
  shield: <><path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6l8.5 7 8.5-7" /></>,
  trips: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3.5" /></>,
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  message: <path d="M4 5h16v11H9l-5 4z" />,
};

export function Icon({ name, size = 18, color = C.gold, style }: { name: IconName; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, ...style }}>
      {PATHS[name]}
    </svg>
  );
}

const SERVICE_META: Record<string, { icon: IconName; img: string }> = {
  ride_now: { icon: 'car', img: '/img/design/night-car.jpg' },
  airport_transfer: { icon: 'plane', img: '/img/design/airport.png' },
  rent: { icon: 'rental', img: '/img/design/business.png' },
  hourly: { icon: 'clock', img: '/img/design/card-sm.png' },
  luxury: { icon: 'star', img: '/img/design/seat.png' },
};
export const serviceMeta = (key: string) => ({ label: key === 'ride_now' ? 'Ride' : serviceLabel(key), ...(SERVICE_META[key] ?? SERVICE_META.ride_now) });
export const serviceImage = (service: ServiceKey) => serviceMeta(service).img;

export function vehicleTitle(v: Vehicle) {
  return VEHICLE_CLASSES.find((c) => c.key === v.class)?.label ?? v.name;
}

export function tripTitle(b: Booking) {
  if (b.dropoff?.address) return b.dropoff.address;
  return [b.vehicle?.name, b.supplierName].filter(Boolean).join(' · ') || serviceMeta(b.service).label;
}
export function tripWhen(b: Booking) {
  if (b.service === 'rent' && b.pickupAt && b.returnAt) {
    const days = Math.max(1, Math.round((new Date(b.returnAt).getTime() - new Date(b.pickupAt).getTime()) / 86_400_000));
    return `${fmtDay(b.pickupAt)} – ${fmtDay(b.returnAt)} · ${days} day${days === 1 ? '' : 's'}`;
  }
  return b.pickupAt ? fmtWhen(b.pickupAt) : `Booked ${fmtDate(b.createdAt)}`;
}

/** Loads every page of the signed-in user's bookings. */
export async function fetchAllBookings(api: RideanApi): Promise<Booking[]> {
  const first = await api.myBookings({ page: 1 });
  const all = [...first.items];
  const pages = Math.min(20, Math.ceil(first.total / Math.max(1, first.pageSize || first.items.length || 1)));
  for (let p = 2; p <= pages && all.length < first.total; p++) {
    const r = await api.myBookings({ page: p });
    if (!r.items.length) break;
    all.push(...r.items);
  }
  return all;
}

// ---------------------------------------------------------------- data hook
/** Small async loader with loading / error / reload. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const reload = useCallback(async () => {
    setError('');
    try {
      setData(await fnRef.current());
    } catch (e) {
      setError(errMsg(e, 'We couldn’t load this right now.'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    setLoading(true);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, setData, error, loading, reload };
}

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------- design pieces

/** The design's round back button: history back, or `fallback` when the screen was opened directly. */
export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      className="dz-btn-reset"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      style={{ width: '40px', height: '40px', borderRadius: '20px', border: '1px solid #1F4537', background: '#0E2A22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F3EEDF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

/** Header of the full-screen boards: back · title / subtitle · optional trailing control. */
export function ScreenHeader({ title, sub, fallback, trailing }: { title: ReactNode; sub?: ReactNode; fallback: string; trailing?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 20px 14px' }}>
      <BackButton fallback={fallback} />
      <div style={{ flex: 1, minWidth: '0' }}>
        <h1 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '24px', lineHeight: 1.15, color: '#F3EEDF', overflowWrap: 'anywhere' }}>{title}</h1>
        {sub ? <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px', overflowWrap: 'anywhere' }}>{sub}</div> : null}
      </div>
      {trailing}
    </div>
  );
}

/** Wordmark header of the tab screens. */
export function LogoHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', minHeight: '40px' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo.png" alt="Ridean" style={{ display: 'block', height: 38, width: 'auto' }} />
    </div>
  );
}

export const sectionH2: CSSProperties = { margin: '0', fontFamily: "'Playfair Display',serif", fontSize: '19px', fontWeight: 600, color: '#F3EEDF' };
export const panel: CSSProperties = { background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px' };
export const iconBox: CSSProperties = { width: '38px', height: '38px', borderRadius: '11px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
export const outlineBtn: CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px', borderRadius: '12px', border: '1px solid #D9A94F', color: '#D9A94F', fontSize: '14.5px', fontWeight: 600, minWidth: 0, padding: '0 10px', boxSizing: 'border-box' };

export const RowChevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9FB2A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

/** The design's list row: icon box · title / subtitle · trailing. */
export function ListRow({ icon, title, sub, right, href, onClick, last, disabled, expanded }: {
  icon?: IconName;
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  last?: boolean;
  disabled?: boolean;
  expanded?: boolean;
}) {
  const style: CSSProperties = { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: last ? undefined : '1px solid #1F4537', width: '100%', boxSizing: 'border-box' };
  const inner = (
    <>
      {icon && <div style={iconBox}><Icon name={icon} /></div>}
      <div style={{ flex: 1, minWidth: '0', textAlign: 'left' }}>
        <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF', overflowWrap: 'anywhere' }}>{title}</div>
        {sub !== undefined && sub !== null && sub !== '' && <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px', overflowWrap: 'anywhere' }}>{sub}</div>}
      </div>
      {right}
    </>
  );
  if (href) return <Link href={href} style={style}>{inner}</Link>;
  if (onClick)
    return (
      <button type="button" className="dz-btn-reset" onClick={onClick} disabled={disabled} aria-expanded={expanded} style={{ ...style, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {inner}
      </button>
    );
  return <div style={style}>{inner}</div>;
}

export function Avatar({ name, size = 44 }: { name?: string; size?: number }) {
  const ini = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: 'linear-gradient(135deg,#E2B04A,#9C6F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: Math.round(size * 0.38), color: '#0A1F18', flexShrink: 0 }}>
      {ini || <Icon name="trips" size={Math.round(size * 0.4)} color="#0A1F18" />}
    </div>
  );
}

/** The design's trip card (image · service label · status · route · date · price). */
export function TripCard({ b }: { b: Booking }) {
  const m = serviceMeta(b.service);
  const st = cardStatus(b.status);
  return (
    <Link href={`/bookings/${b.id}`} style={{ display: 'block' }}>
      <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#D9A94F', minWidth: 0 }}>
                <Icon name={m.icon} size={15} />
                {m.label}
              </span>
              <span style={{ fontSize: '12px', color: st.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{st.label}</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tripTitle(b)}</div>
            <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>From {b.pickup?.address}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1F4537', fontSize: '13px' }}>
          <span style={{ color: '#9FB2A6', minWidth: 0 }}>{tripWhen(b)}</span>
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{money(b.price.customerPrice, b.price.currency)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Inline "are you sure?" block used by the booking and trip-status screens. */
export function CancelConfirm({ title, busy, error, onKeep, onConfirm }: { title: string; busy: boolean; error?: string; onKeep: () => void; onConfirm: () => void }) {
  return (
    <div role="alertdialog" aria-label={title} style={{ border: '1px solid #E5645A', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '15px', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: '13.5px', color: '#9FB2A6', lineHeight: 1.5 }}>Refunds follow the cancellation policy you accepted when booking.</div>
      {error && <div className="dz-error" role="alert">{error}</div>}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={onKeep} disabled={busy} style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', height: '44px', lineHeight: '44px', borderRadius: '12px', border: '1px solid #1F4537', color: '#F3EEDF', fontSize: '14.5px', fontWeight: 600 }}>
          Keep booking
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} style={{ all: 'unset', cursor: busy ? 'wait' : 'pointer', flex: 1, textAlign: 'center', height: '44px', lineHeight: '44px', borderRadius: '12px', background: '#E5645A', color: '#0A1F18', fontSize: '14.5px', fontWeight: 600, opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Cancelling…' : 'Yes, cancel'}
        </button>
      </div>
    </div>
  );
}
