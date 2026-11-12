'use client';

import { useState, type ReactNode } from 'react';
import { Field } from '@/components/site/ui';

/** Only same-site relative paths are allowed as a post-sign-in destination. */
export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}

/** Hero image + wordmark at the top of the SignIn / CreateAccount boards. */
export function AuthHero() {
  return (
    <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/design/night-car.jpg" alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
      <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(180deg,rgba(7,26,20,.35),#071A14)' }}></div>
      <div style={{ position: 'absolute', left: '24px', right: '24px', bottom: '20px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo-full.png" alt="Ridean" style={{ display: 'block', height: 66, width: 'auto' }} />
        <div style={{ fontSize: '14px', color: '#D7DED6', marginTop: '4px' }}>Arrive exceptionally.</div>
      </div>
    </div>
  );
}

const svg = (children: ReactNode, stroke = '#F3EEDF', size = 19) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

export const IconMail = () => svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6l8.5 7 8.5-7" /></>);
export const IconPhone = () => svg(<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />);
export const IconUser = () => svg(<><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>);
const IconLock = () => svg(<><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>);
const IconEye = ({ off }: { off?: boolean }) =>
  svg(
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </>,
    '#9FB2A6',
    20,
  );

export function PasswordField({ value, onChange, placeholder, autoComplete, invalid }: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      icon={<IconLock />}
      label="Password"
      style={invalid ? { borderColor: '#E5645A' } : undefined}
      trailing={
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} style={{ all: 'unset', cursor: 'pointer', display: 'flex' }}>
          <IconEye off={show} />
        </button>
      }
    >
      <input className="dz-input" name="password" type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={invalid || undefined} />
    </Field>
  );
}

export const ctaButton = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '54px', borderRadius: '12px', background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: '17px', fontWeight: 600, width: '100%' } as const;
