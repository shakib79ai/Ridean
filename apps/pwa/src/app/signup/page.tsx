'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRidean } from '@ridean/web-core';
import { Arrow, ErrorNote, Field } from '@/components/site/ui';
import { AuthHero, IconMail, IconPhone, IconUser, PasswordField, ctaButton, safeNext } from '@/components/auth/AuthKit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateAccountPage() {
  return (
    <div style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
      <AuthHero />
      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </div>
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
    if (bad.phone) return setError('Please check your phone number.');
    if (bad.password) return setError('Your password needs at least 8 characters.');
    if (bad.terms) return setError('Please agree to the Terms and Privacy policy to continue.');
    setBusy(true);
    try {
      await register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() || undefined });
      router.replace(next);
    } catch (err) {
      setError((err as Error).message || 'We couldn’t create your account. Please try again.');
      setBusy(false);
    }
  }

  const bad = (k: Key) => (invalid[k] ? { borderColor: '#E5645A' } : undefined);

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
      <h1 style={{ margin: '0', fontFamily: 'Playfair Display,serif', fontSize: '28px', fontWeight: 600 }}>Create your account</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, minWidth: '0' }}>
          <Field icon={<IconUser />} label="First name" style={bad('firstName')}>
            <input className="dz-input" name="firstName" autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName')(e.target.value)} placeholder="First name" aria-invalid={invalid.firstName || undefined} />
          </Field>
        </div>
        <div style={{ flex: 1, minWidth: '0' }}>
          <Field icon={<IconUser />} label="Last name" style={bad('lastName')}>
            <input className="dz-input" name="lastName" autoComplete="family-name" value={form.lastName} onChange={(e) => set('lastName')(e.target.value)} placeholder="Last name" aria-invalid={invalid.lastName || undefined} />
          </Field>
        </div>
      </div>
      <Field icon={<IconMail />} label="Email" style={bad('email')}>
        <input className="dz-input" name="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => set('email')(e.target.value)} placeholder="you@example.com" aria-invalid={invalid.email || undefined} />
      </Field>
      <Field icon={<IconPhone />} label="Phone" style={bad('phone')}>
        <input className="dz-input" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="+1 (555) 000-0000" aria-invalid={invalid.phone || undefined} />
      </Field>
      <PasswordField value={form.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" invalid={invalid.password} />
      <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', lineHeight: 1.45, color: invalid.terms ? '#FFB3AC' : '#9FB2A6' }}>
        <input
          type="checkbox"
          checked={terms}
          required
          onChange={(e) => {
            setTerms(e.target.checked);
            setInvalid((i) => ({ ...i, terms: false }));
          }}
          aria-invalid={invalid.terms || undefined}
          style={{ accentColor: '#F6C428', width: '18px', height: '18px', margin: '1px 0 0', flexShrink: 0 }}
        />
        <span>
          I agree to the{' '}
          <Link href="/legal" style={{ color: '#D9A94F' }}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/legal#privacy" style={{ color: '#D9A94F' }}>
            Privacy policy
          </Link>
        </span>
      </label>
      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className="dz-cta" disabled={busy} style={ctaButton}>
        <span>{busy ? 'Creating account…' : 'Create account'}</span>
        {!busy && <Arrow />}
      </button>
      <div style={{ textAlign: 'center', fontSize: '14px', color: '#9FB2A6' }}>
        Already have an account?{' '}
        <Link href={nextParam ? `/signin?next=${encodeURIComponent(next)}` : '/signin'} style={{ color: '#D9A94F', fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    </form>
  );
}
