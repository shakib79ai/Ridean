'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRidean } from '@ridean/web-core';
import { Arrow, ErrorNote, Field } from '@/components/site/ui';
import { AuthHero, IconMail, IconPhone, PasswordField, ctaButton, safeNext } from '@/components/auth/AuthKit';

export default function SignInPage() {
  return (
    <div style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
      <AuthHero />
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </div>
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
      setError((err as Error).message || 'We couldn’t sign you in. Please try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
      <h1 style={{ margin: '0', fontFamily: 'Playfair Display,serif', fontSize: '28px', fontWeight: 600 }}>Welcome back</h1>
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
          <input className="dz-input" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
      ) : (
        <Field icon={<IconPhone />} label="Phone number">
          <input className="dz-input" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
        </Field>
      )}
      <PasswordField value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" />
      <Link href="/help#account" style={{ alignSelf: 'flex-end', fontSize: '13.5px', color: '#D9A94F' }}>
        Forgot password?
      </Link>
      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className="dz-cta" disabled={busy} style={ctaButton}>
        <span>{busy ? 'Signing in…' : 'Sign in'}</span>
        {!busy && <Arrow />}
      </button>
      <div style={{ textAlign: 'center', fontSize: '14px', color: '#9FB2A6' }}>
        New to Ridean?{' '}
        <Link href={nextParam ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} style={{ color: '#D9A94F', fontWeight: 600 }}>
          Create an account
        </Link>
      </div>
    </form>
  );
}
