'use client';

import { createContext, useCallback, useContext, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { User } from '@ridean/shared';

/** Shared building blocks for the design-faithful website pages. */

export const C = {
  bg: '#071A14',
  panel: '#0E2A22',
  panel2: '#12352B',
  line: '#1F4537',
  cream: '#F3EEDF',
  muted: '#9FB2A6',
  soft: '#C9D2CB',
  gold: '#D9A94F',
  yellow: '#F6C428',
  ok: '#4CC38A',
  bad: '#E5645A',
};

export const display: CSSProperties = { fontFamily: "'Playfair Display',serif", fontWeight: 600, color: C.cream, margin: 0 };
export const card: CSSProperties = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20 };
export const ctaStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 17, fontWeight: 600, textDecoration: 'none', width: '100%' };
export const ghostStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${C.gold}`, color: C.gold, background: 'transparent', fontSize: 14.5, fontWeight: 600, textDecoration: 'none', cursor: 'pointer' };

export const initials = (u?: Pick<User, 'firstName' | 'lastName'> | null) => `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase() || 'R';

export function Chevron({ size = 16, dir = 'down', color = C.muted }: { size?: number; dir?: 'down' | 'right' | 'left' | 'up'; color?: string }) {
  const rot = { down: 0, right: -90, left: 90, up: 180 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, transform: `rotate(${rot}deg)` }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Arrow({ size = 20, color = '#0A1F18' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** The design's labelled input row: icon · small label · input · optional trailing button. */
export function Field({ icon, label, children, trailing, style }: { icon?: ReactNode; label: string; children: ReactNode; trailing?: ReactNode; style?: CSSProperties }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, minHeight: 58, overflow: 'hidden', ...style }}>
      {icon ? <div style={{ width: 46, display: 'flex', justifyContent: 'center' }}>{icon}</div> : <div style={{ width: 16 }} />}
      <div style={{ flex: 1, minWidth: 0, padding: '8px 8px 8px 0' }}>
        <div style={{ fontSize: 11.5, color: C.muted }}>{label}</div>
        {children}
      </div>
      {trailing && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, alignSelf: 'stretch', borderLeft: `1px solid ${C.line}` }}>{trailing}</div>}
    </label>
  );
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={`dz-tg ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
      <span />
    </button>
  );
}

export function Stepper({ value, onChange, min = 0, max = 12, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button type="button" className="dz-step" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 600 }}>{value}</span>
      <button type="button" className="dz-step" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

export function Skeleton({ h = 120, style }: { h?: number; style?: CSSProperties }) {
  return <div className="dz-skel" style={{ height: h, ...style }} />;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <div className="dz-error" role="alert">{children}</div>;
}

// ---- Toast
const ToastCtx = createContext<(msg: string) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setShow(false), 2200);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={`dz-toast ${show ? 'show' : ''}`} role="status" aria-live="polite">{msg}</div>
    </ToastCtx.Provider>
  );
}
