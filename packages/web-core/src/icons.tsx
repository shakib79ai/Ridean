import type { JSX, SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest,
});

export const IconPin = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)} fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" /></svg>
);
export const IconLocate = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /><path d="M12 1.5v3.5M12 19v3.5M1.5 12H5M19 12h3.5" /></svg>
);
export const IconSwap = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><path d="M7 20V5M3.5 8.5 7 5l3.5 3.5M17 4v15M13.5 15.5 17 19l3.5-3.5" /></svg>
);
export const IconArrow = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const IconChevron = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}><path d="m9 5 7 7-7 7" /></svg>
);
export const IconCalendar = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const IconClock = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconUser = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
);
export const IconBag = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
);
/** Solid service glyphs (24x24, even-odd). Shared by the website, PWA and admin; the Flutter app has the same paths. */
export const SERVICE_PATHS = {
  ride: ['M1.6 15.4v-2.1c0-.6.3-1 .9-1.2l3.9-.6 2.5-2.4c.4-.4.9-.6 1.5-.6h3.9c.6 0 1.1.2 1.5.6l2.3 2.2 3.3.6c.7.1 1.2.7 1.2 1.4v2.1c0 .4-.3.7-.7.7h-1.6a2.6 2.6 0 0 0-5.1 0H9.2a2.6 2.6 0 0 0-5.1 0H2.3c-.4 0-.7-.3-.7-.7zM7.7 11.4h3.6V9.6h-1.4c-.3 0-.6.1-.8.3zm4.6 0h4.2l-1.7-1.5c-.2-.2-.5-.3-.8-.3h-1.7z', 'M6.65 14.3a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zm0 1.3a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6zM17.35 14.3a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zm0 1.3a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z'],
  airport: ['M21 15.6v-1.9l-7.6-4.7V3.9c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4V9L3 13.7v1.9l7.6-2.4v5.1l-1.9 1.4v1.4L12 20.2l3.3.9v-1.4l-1.9-1.4v-5.1z'],
  rent: ['M15.9 7.2 14.7 3.8c-.2-.5-.7-.9-1.3-.9H5.6c-.6 0-1.1.4-1.3.9L2.6 8.6v6.6c0 .5.4.9.9.9h.9c.5 0 .9-.4.9-.9v-.9h8.4v.9c0 .5.4.9.9.9h.9c.5 0 .9-.4.9-.9V9.2zM5.4 12.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm8.3 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zM4.3 8.1l1.1-3.3h8.3l1.1 3.3z', 'M17.8 11.2a3.4 3.4 0 0 0-3.2 4.5l-2.9 2.9v2.2h2.2v-1.3h1.3v-1.3h1.3l.6-.6a3.4 3.4 0 1 0 .7-6.4zm.9 2.1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'],
} as const;
/** The glyph's paths for use inside an existing <svg viewBox="0 0 24 24">. */
export function serviceGlyph(kind: keyof typeof SERVICE_PATHS, fill: string) {
  return SERVICE_PATHS[kind].map((d) => (
    <path key={d.slice(0, 12)} fill={fill} fillRule="evenodd" d={d} transform={kind === 'airport' ? 'rotate(45 12 12)' : undefined} />
  ));
}
export const IconPlane = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)} fill="currentColor" stroke="none">{serviceGlyph('airport', 'currentColor')}</svg>
);
export const IconCar = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)} fill="currentColor" stroke="none">{serviceGlyph('ride', 'currentColor')}</svg>
);
export const IconRent = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)} fill="currentColor" stroke="none">{serviceGlyph('rent', 'currentColor')}</svg>
);
export const IconStar = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>
);
export const IconCheck = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconGlobe = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
);
export const IconShield = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconTag = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z" /><circle cx="8" cy="8" r="1.5" /></svg>
);
export const IconChat = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><path d="M4 5h16v11H9l-5 4z" /></svg>
);
export const IconHome = ({ size = 24, ...r }: P) => (
  <svg {...base(size, r)}><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
);
export const IconTrips = ({ size = 24, ...r }: P) => (
  <svg {...base(size, r)}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>
);
export const IconWallet = ({ size = 24, ...r }: P) => (
  <svg {...base(size, r)}><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18M16 15h2" /></svg>
);

export const SERVICE_ICON: Record<string, (p: P) => JSX.Element> = {
  ride_now: IconCar,
  airport_transfer: IconPlane,
  rent: IconRent,
  hourly: IconClock,
  luxury: IconStar,
};
