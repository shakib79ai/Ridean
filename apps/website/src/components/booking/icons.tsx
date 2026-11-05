/** Stroke icons used by the service-page search forms, copied from the design canvas. */
import type { ReactNode } from 'react';

function Stroke({ size = 19, color = '#F3EEDF', width = 2, children }: { size?: number; color?: string; width?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export const PinIcon = () => (
  <Stroke>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </Stroke>
);
export const LocateIcon = () => (
  <Stroke size={21}>
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="7.5" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
  </Stroke>
);
export const SwapIcon = () => (
  <Stroke size={21}>
    <path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" />
  </Stroke>
);
export const CalendarIcon = () => (
  <Stroke>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Stroke>
);
export const ClockIcon = ({ size = 19, color = '#F3EEDF' }: { size?: number; color?: string }) => (
  <Stroke size={size} color={color}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Stroke>
);
export const PlaneIcon = ({ size = 19, color = '#F3EEDF' }: { size?: number; color?: string }) => (
  <Stroke size={size} color={color}>
    <path d="M3 17h18M6 13l-2-5h2.5l2 3h5L11 4h3l4.5 7H21a1.5 1.5 0 0 1 0 3H8z" />
  </Stroke>
);
export const CardIcon = () => (
  <Stroke size={20} color="#D9A94F">
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h3" />
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
export const ArrowIcon = () => (
  <Stroke size={20} color="#0A1F18" width={2.2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Stroke>
);
export const GlobeIcon = () => (
  <Stroke size={17} color="#D9A94F">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" />
  </Stroke>
);
