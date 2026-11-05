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
export const IconPlane = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)} fill="currentColor" stroke="none"><path transform="rotate(45 12 12)" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
);
const CAR = 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z';
export const IconCar = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)} fill="currentColor" stroke="none"><path d={CAR} /></svg>
);
export const IconRent = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)} fill="currentColor" stroke="none"><path fillRule="evenodd" d={`${CAR}M9.25 14.6h5.5v1.1h-5.5zM9.25 16.6h5.5v1h-5.5z`} /></svg>
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
