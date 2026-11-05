/** Stroke icons from the PWA design canvas (booking screens). */
import type { ReactNode } from 'react';

export function Stroke({ size = 19, color = '#F3EEDF', width = 2, children }: { size?: number; color?: string; width?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

type P = { size?: number; color?: string };

export const PinIcon = ({ size = 19, color }: P) => (
  <Stroke size={size} color={color}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </Stroke>
);
export const LocateIcon = ({ size = 21, color }: P) => (
  <Stroke size={size} color={color}>
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="7.5" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
  </Stroke>
);
export const SwapIcon = ({ size = 21, color }: P) => (
  <Stroke size={size} color={color}>
    <path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" />
  </Stroke>
);
export const CalendarIcon = ({ size = 19, color }: P) => (
  <Stroke size={size} color={color}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Stroke>
);
export const ClockIcon = ({ size = 19, color }: P) => (
  <Stroke size={size} color={color}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Stroke>
);
export const FlightIcon = ({ size = 19, color }: P) => (
  <Stroke size={size} color={color}>
    <path d="M3 17h18M6 13l-2-5h2.5l2 3h5L11 4h3l4.5 7H21a1.5 1.5 0 0 1 0 3H8z" />
  </Stroke>
);
export const PlaneIcon = ({ size = 18, color }: P) => (
  <Stroke size={size} color={color}>
    <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" />
  </Stroke>
);
export const CarIcon = ({ size = 18, color }: P) => (
  <Stroke size={size} color={color}>
    <path d="M3 15l1.6-4.6A2 2 0 0 1 6.5 9h11a2 2 0 0 1 1.9 1.4L21 15v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M6.5 13.5h.01M17.5 13.5h.01" />
  </Stroke>
);
export const RentIcon = ({ size = 18, color }: P) => (
  <Stroke size={size} color={color}>
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
    <rect x="3" y="11" width="18" height="6" rx="2" />
    <path d="M6 17v2M18 17v2M7 14h.01M17 14h.01" />
  </Stroke>
);
export const CardIcon = ({ size = 20, color = '#D9A94F' }: P) => (
  <Stroke size={size} color={color}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h3" />
  </Stroke>
);
export const ShieldIcon = ({ size = 20, color = '#D9A94F' }: P) => (
  <Stroke size={size} color={color}>
    <path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Stroke>
);
export const GlobeIcon = ({ size = 17, color = '#D9A94F' }: P) => (
  <Stroke size={size} color={color}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" />
  </Stroke>
);
export const ArrowIcon = ({ size = 20, color = '#0A1F18' }: P) => (
  <Stroke size={size} color={color} width={2.2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Stroke>
);
export const BackIcon = ({ size = 18, color }: P) => (
  <Stroke size={size} color={color}>
    <path d="M15 18l-6-6 6-6" />
  </Stroke>
);
export const MinusIcon = () => (
  <Stroke size={16}>
    <path d="M5 12h14" />
  </Stroke>
);
export const PlusIcon = () => (
  <Stroke size={16}>
    <path d="M12 5v14M5 12h14" />
  </Stroke>
);
