'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { C, Field } from '@/components/site/ui';
import { IconEye, IconLock } from '@/components/checkout/parts';

/** Only same-site relative paths are allowed as a post-sign-in destination. */
export function safeNext(next: string | null | undefined, fallback = '/account'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}

const logoStyle = {
  fontFamily: "'Playfair Display',serif",
  fontWeight: 700,
  letterSpacing: '-.01em',
  background: 'linear-gradient(180deg,#F8DD8A 0%,#E2B04A 55%,#B9842A 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  fontSize: 40,
  textDecoration: 'none',
} as const;

/** Split-screen frame of the sign-in / sign-up boards: hero image left, form right. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="dz-auth">
      <style>{`
        .dz-auth-form { display: flex; align-items: center; justify-content: center; padding: 48px; }
        .dz-auth-logo-sm { display: none; }
        @media (max-width: 900px) {
          .dz-auth-form { align-items: flex-start; padding: 28px 16px 40px; }
          .dz-auth-logo-sm { display: inline-block; margin-bottom: 20px; font-size: 34px !important; }
        }
      `}</style>
      <div className="dz-auth-art" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/design/signin-hero.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '78% center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(7,26,20,.55) 0%,rgba(7,26,20,.1) 40%,rgba(7,26,20,.9) 100%)' }} />
        <Link href="/" style={{ ...logoStyle, position: 'absolute', top: 36, left: 48 }}>
          Ridean
        </Link>
        <div style={{ position: 'absolute', left: 48, right: 48, bottom: 56 }}>
          <div style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 56, lineHeight: 1.06, color: C.cream }}>Arrive exceptionally.</div>
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#D7DED6' }}>Premium mobility for wherever life takes you.</p>
          </div>
        </div>
      </div>
      <div className="dz-auth-form">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Link href="/" className="dz-auth-logo-sm" style={logoStyle}>
            Ridean
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

export const authH1 = { margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 40, lineHeight: 1.06, color: C.cream } as const;
export const authLead = { margin: 0, fontSize: 15, lineHeight: 1.6, color: C.muted } as const;

export function PasswordField({ value, onChange, placeholder, autoComplete, invalid }: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      icon={<IconLock />}
      label="Password"
      style={invalid ? { borderColor: C.bad } : undefined}
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
