'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRidean } from '@ridean/web-core';
import { Arrow, C, ErrorNote, Field } from '@/components/site/ui';
import { AuthShell, PasswordField, authH1, authLead, safeNext } from '@/components/auth/AuthShell';
import { IconMail, IconPhone } from '@/components/checkout/parts';

export default function SignInPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}

function SignInForm() {
  const { login, loginWithPhone, user, ready } = useRidean();
  const router = useRouter();
  const nextParam = useSearchParams().get('next');
  const next = safeNext(nextParam);

  const [via, setVia] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in (or just signed in): continue
  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    const id = via === 'email' ? email.trim() : phone.trim();
    if (!id) return setError(via === 'email' ? 'Enter your email address.' : 'Enter your phone number.');
    if (!password) return setError('Enter your password.');
    setBusy(true);
    try {
      if (via === 'email') await login(id, password);
      else await loginWithPhone(id, password);
      router.replace(next);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
      <h1 style={authH1}>Welcome back</h1>
      <p style={authLead}>Sign in to book, track and manage your trips.</p>
      <div className="dz-segw" role="tablist" aria-label="Sign in with">
        {(['email', 'phone'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={via === v}
            className={`dz-seg ${via === v ? 'on' : ''}`}
            onClick={() => {
              setVia(v);
              setError('');
            }}
          >
            {v === 'email' ? 'Email' : 'Phone'}
          </button>
        ))}
      </div>
      {via === 'email' ? (
        <Field icon={<IconMail />} label="Email">
          <input className="dz-input" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
        </Field>
      ) : (
        <Field icon={<IconPhone />} label="Phone number">
          <input className="dz-input" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" autoFocus />
        </Field>
      )}
      <PasswordField value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 14 }}>
        <Link href="/help#account" style={{ color: C.gold }}>
          Forgot password?
        </Link>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className="dz-cta" disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 17, fontWeight: 600, width: '100%' }}>
        <span>{busy ? 'Signing in…' : 'Sign in'}</span>
        {!busy && <Arrow />}
      </button>
      <div style={{ textAlign: 'center', fontSize: 14.5, color: C.muted }}>
        New to Ridean?{' '}
        <Link href={nextParam ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} style={{ color: C.gold, fontWeight: 600 }}>
          Create an account
        </Link>
      </div>
    </form>
  );
}
