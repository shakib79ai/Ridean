'use client';

import type { ReactNode } from 'react';
import { SERVICES, VEHICLE_CLASSES, type CoreServiceKey, type QuoteSearchRequest, type ServiceKey, type Vehicle } from '@ridean/shared';
import { encodeSearch } from '@ridean/web-core';
import { C } from '@/components/site/ui';

/** Pieces shared by the PWA Review and Payment screens. */

export const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
export function fmtWhen(iso?: string) {
  if (!iso) return 'As soon as possible';
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const day = same(d, today) ? 'Today' : same(d, tomorrow) ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day}, ${fmtTime(d)}`;
}
export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : '');

/** Where "Search again" goes: the booking screen for the service, with the original search when we have it. */
export function searchAgainHref(service?: ServiceKey, search?: QuoteSearchRequest) {
  const def = service ? SERVICES[service as CoreServiceKey] : undefined;
  if (!def) return '/';
  return `/book/${def.slug}${search && search.service === service ? `?s=${encodeSearch(search)}` : ''}`;
}

const CLASS_IMG: Record<string, string> = {
  sedan: '/img/design/cls-sedan.jpg',
  xl: '/img/design/cls-xl.jpg',
  extra_comfort: '/img/design/cls-comfort.jpg',
  business: '/img/design/business.png',
  black: '/img/design/cls-black.jpg',
};
export const vehicleImage = (v: Vehicle) => v.imageUrl || CLASS_IMG[v.class] || '/img/design/business.png';
export const vehicleTitle = (v: Vehicle) => VEHICLE_CLASSES.find((c) => c.key === v.class)?.label ?? v.name;

export function PriceLine({ label, value, strong, color }: { label: ReactNode; value: ReactNode; strong?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: strong ? 15 : 14, color: color ?? (strong ? C.cream : C.muted), fontWeight: strong ? 600 : 400 }}>
      <span>{label}</span>
      <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

export const Divider = () => <div style={{ height: 1, background: C.line, margin: '6px 0' }} />;

export const svgProps = { fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const, style: { flexShrink: 0 } };

export const IconUser = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" stroke={C.cream} {...svgProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </svg>
);
export const IconPhone = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" stroke={C.cream} {...svgProps}>
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
export const IconMail = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" stroke={C.cream} {...svgProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6l8.5 7 8.5-7" />
  </svg>
);
export const IconTag = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}>
    <path d="M3 12V4h8l10 10-8 8z" />
    <circle cx="7.5" cy="8.5" r="1.5" />
  </svg>
);
export const IconLock = ({ size = 14, c = C.muted }: { size?: number; c?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={c} {...svgProps}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);
export const IconCard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h3" />
  </svg>
);
export const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}>
    <rect x="3" y="6" width="18" height="14" rx="2.5" />
    <path d="M3 10h18M16 15h2" />
    <path d="M6 6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
);
export const IconBriefcase = ({ c = C.gold }: { c?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={c} {...svgProps}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5h6v2M3 12h18" />
  </svg>
);
export const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke={C.gold} {...svgProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
