'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatMoney, serviceLabel, type Booking, type BookingStatus } from '@ridean/shared';
import { useRidean } from './api-context';

const STATUS: Record<BookingStatus, [string, string]> = {
  pending_payment: ['Awaiting payment', 'rd-pill-warn'],
  payment_authorised: ['Confirming', 'rd-pill-warn'],
  confirmed: ['Confirmed', 'rd-pill-ok'],
  driver_assigned: ['Chauffeur assigned', 'rd-pill-ok'],
  in_progress: ['On trip', 'rd-pill-info'],
  completed: ['Completed', 'rd-pill-info'],
  cancelled: ['Cancelled', 'rd-pill-bad'],
  failed: ['Not confirmed', 'rd-pill-bad'],
};

export function StatusPill({ status }: { status: BookingStatus }) {
  const [label, cls] = STATUS[status] ?? [status, 'rd-pill-info'];
  return <span className={`rd-pill ${cls}`}>{label}</span>;
}

export const money = (minor: number, currency = 'USD') => formatMoney(minor, currency);

export function formatWhen(iso?: string) {
  if (!iso) return 'As soon as possible';
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function BookingRow({ b, href }: { b: Booking; href: string }) {
  return (
    <Link href={href} className="rd-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="rd-row" style={{ justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{b.reference}</span>
        <StatusPill status={b.status} />
      </div>
      <div style={{ fontSize: 15 }}>{serviceLabel(b.service)} · {b.supplierName}</div>
      <div className="rd-muted" style={{ fontSize: 13.5 }}>
        {b.pickup.address}
        {b.dropoff ? ` → ${b.dropoff.address}` : ''}
      </div>
      <div className="rd-row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
        <span className="rd-muted">{formatWhen(b.pickupAt)}</span>
        <strong>{money(b.price.customerPrice, b.price.currency)}</strong>
      </div>
    </Link>
  );
}

/** Wraps account pages: shows a sign-in prompt when nobody is logged in. */
export function RequireAuth({ children, signInPath = '/signin' }: { children: ReactNode; signInPath?: string }) {
  const { user, ready } = useRidean();
  // Inline styles so the prompt looks right in apps that don't load web-core's stylesheet.
  if (!ready) return <div aria-busy="true" style={{ height: 240, margin: 16, borderRadius: 16, background: '#0E2A22' }} />;
  if (!user)
    return (
      <div style={{ margin: 16, padding: 32, borderRadius: 16, background: '#0E2A22', border: '1px solid #1F4537', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', color: '#F3EEDF', fontFamily: "'Inter', sans-serif" }}>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 28 }}>Please sign in</h2>
        <p style={{ margin: 0, color: '#9FB2A6', fontSize: 15 }}>Sign in to see your trips, wallet and saved details.</p>
        <Link href={`${signInPath}?next=${typeof window !== 'undefined' ? encodeURIComponent(location.pathname + location.search) : ''}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 50, padding: '0 28px', borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
          Sign in
        </Link>
      </div>
    );
  return <>{children}</>;
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rd-card rd-stack" style={{ textAlign: 'center', padding: 36, alignItems: 'center' }}>
      <h3 className="rd-display" style={{ fontSize: 22 }}>{title}</h3>
      <p className="rd-muted" style={{ margin: 0 }}>{text}</p>
      {action}
    </div>
  );
}
