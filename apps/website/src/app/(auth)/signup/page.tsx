'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRidean } from '@ridean/web-core';
import { Arrow, C, ErrorNote, Field } from '@/components/site/ui';
import { AuthShell, PasswordField, authH1, authLead, safeNext } from '@/components/auth/AuthShell';
import { IconMail, IconPhone, IconUser } from '@/components/checkout/parts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateAccountPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}

type Key = 'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'terms';

function SignUpForm() {
  const { register, user, ready } = useRidean();
  const router = useRouter();
  const nextParam = useSearchParams().get('next');
  const next = safeNext(nextParam);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [terms, setTerms] = useState(false);
  const [invalid, setInvalid] = useState<Partial<Record<Key, boolean>>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setInvalid((i) => ({ ...i, [k]: false }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    const bad: Partial<Record<Key, boolean>> = {
      firstName: !form.firstName.trim(),
      lastName: !form.lastName.trim(),
      email: !EMAIL_RE.test(form.email.trim()),
      phone: !!form.phone.trim() && form.phone.replace(/\D/g, '').length < 6,
      password: form.password.length < 8,
      terms: !terms,
    };
    setInvalid(bad);
    if (bad.firstName || bad.lastName) return setError('Please enter your first and last name.');
    if (bad.email) return setError('Please enter a valid email address.');
    if (bad.phone) return setError('Please check your mobile number.');
    if (bad.password) return setError('Your password needs at least 8 characters.');
    if (bad.terms) return setError('Please agree to the Terms and Privacy policy to continue.');
    setBusy(true);
    try {
      await register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() || undefined });
      router.replace(next);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const bad = (k: Key) => (invalid[k] ? { borderColor: C.bad } : undefined);

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
      <h1 style={authH1}>Create your account</h1>
      <p style={authLead}>Join Ridean for upfront prices and premium chauffeurs.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <Field icon={<IconUser />} label="First name" style={bad('firstName')}>
          <input className="dz-input" name="firstName" autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName')(e.target.value)} placeholder="First name" aria-invalid={invalid.firstName || undefined} />
        </Field>
        <Field icon={<IconUser />} label="Last name" style={bad('lastName')}>
          <input className="dz-input" name="lastName" autoComplete="family-name" value={form.lastName} onChange={(e) => set('lastName')(e.target.value)} placeholder="Last name" aria-invalid={invalid.lastName || undefined} />
        </Field>
      </div>
      <Field icon={<IconMail />} label="Email" style={bad('email')}>
        <input className="dz-input" name="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => set('email')(e.target.value)} placeholder="you@example.com" aria-invalid={invalid.email || undefined} />
      </Field>
      <Field icon={<IconPhone />} label="Mobile" style={bad('phone')}>
        <input className="dz-input" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="+1 (555) 000-0000" aria-invalid={invalid.phone || undefined} />
      </Field>
      <PasswordField value={form.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" invalid={invalid.password} />
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.45, color: invalid.terms ? '#FFB3AC' : C.muted }}>
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => {
            setTerms(e.target.checked);
            setInvalid((i) => ({ ...i, terms: false }));
          }}
          style={{ accentColor: '#F6C428', width: 18, height: 18, margin: '1px 0 0', flexShrink: 0 }}
        />
        <span>
          I agree to the{' '}
          <Link href="/legal" style={{ color: C.gold }}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/legal" style={{ color: C.gold }}>
            Privacy policy
          </Link>
        </span>
      </label>
      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className="dz-cta" disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 17, fontWeight: 600, width: '100%' }}>
        <span>{busy ? 'Creating account…' : 'Create account'}</span>
        {!busy && <Arrow />}
      </button>
      <div style={{ textAlign: 'center', fontSize: 14.5, color: C.muted }}>
        Already have an account?{' '}
        <Link href={nextParam ? `/signin?next=${encodeURIComponent(next)}` : '/signin'} style={{ color: C.gold, fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    </form>
  );
}
