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
  if (!ready) return <div className="rd-skeleton" style={{ height: 240 }} />;
  if (!user)
    return (
      <div className="rd-card rd-stack" style={{ textAlign: 'center', padding: 40, alignItems: 'center' }}>
        <h2 className="rd-display" style={{ fontSize: 28 }}>Please sign in</h2>
        <p className="rd-muted" style={{ margin: 0 }}>Sign in to see your trips, wallet and saved details.</p>
        <Link className="rd-btn" href={`${signInPath}?next=${typeof window !== 'undefined' ? encodeURIComponent(location.pathname + location.search) : ''}`}>Sign in</Link>
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
