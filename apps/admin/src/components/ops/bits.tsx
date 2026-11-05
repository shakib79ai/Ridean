'use client';

// Small helpers shared by the Operations pages (dashboard, bookings, new booking, inbox).
import Link from 'next/link';
import type { ReactNode } from 'react';
import { VEHICLE_CLASSES, type Booking, type BookingStatus } from '@ridean/shared';
import { Icon, serviceIcon } from '@/components/ui';
import { svc } from '@/lib/format';

/** Service label with its line icon, as in the design tables. */
export function ServiceCell({ service }: { service: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Icon name={serviceIcon(service)} size={16} style={{ color: 'var(--muted)' }} />
      {svc(service)}
    </span>
  );
}

export function RefLink({ b }: { b: Pick<Booking, 'id' | 'reference'> }) {
  return <Link href={`/bookings/${b.id}`} className="az-ref">{b.reference}</Link>;
}

export const passengerName = (b: Pick<Booking, 'passenger'>) => `${b.passenger.firstName} ${b.passenger.lastName}`.trim() || b.passenger.email;

/** "business_sedan" → "Business Sedan" (catalogue label when known). */
export function vehicleClassLabel(key: string): string {
  const known = VEHICLE_CLASSES.find((v) => v.key === key);
  if (known) return known.label;
  return key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Statuses operations may set (PATCH /admin/bookings/:id/status), with the labels StatusPill uses. */
export const SETTABLE_STATUS: readonly (readonly [BookingStatus, string])[] = [
  ['confirmed', 'Scheduled'],
  ['driver_assigned', 'En route'],
  ['in_progress', 'In progress'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
  ['failed', 'Failed'],
];

/** "Tuesday, 20 October 2026" */
export function longDate(d = new Date()) {
  const wd = d.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${wd}, ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

/** Time of day, plus the date when it isn't today. */
export function whenShort(iso?: string) {
  if (!iso) return 'ASAP';
  const x = new Date(iso);
  const now = new Date();
  const time = x.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (x.toDateString() === now.toDateString()) return time;
  return `${x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
}

/** Label / value row used in summary and detail cards. */
export function KvRow({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="az-between" style={{ padding: '6px 0', fontSize: 14, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
      <span className="az-muted" style={{ flexShrink: 0 }}>{label}</span>
      <span style={{ textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere', fontWeight: strong ? 600 : 400, color: strong ? 'var(--cream)' : 'var(--soft)' }}>{children}</span>
    </div>
  );
}

export const Divider = () => <div style={{ height: 1, background: 'var(--line)', margin: '6px 0' }} />;

/** Quote a CSV cell. */
export const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
