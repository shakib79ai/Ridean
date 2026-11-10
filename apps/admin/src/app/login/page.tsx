'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Field, Icon } from '@/components/ui';

function LoginForm() {
  const { login, logout } = useRidean();
  const router = useRouter();
  const raw = useSearchParams().get('next') || '/';
  // Only follow local paths, never another site.
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await login(email, password);
      if (u.role === 'customer') {
        logout();
        throw new Error('This account does not have admin access.');
      }
      router.replace(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="az-card az-stack" style={{ width: 'min(420px, 100%)', padding: 32, gap: 18 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo-full.png" alt="Ridean" style={{ display: 'block', height: 92, width: 'auto', margin: '0 auto' }} />
        <div className="az-gold" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.28em', marginTop: 2 }}>ADMIN</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 className="az-serif" style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Sign in</h1>
        <p className="az-muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>Use your Ridean staff account</p>
      </div>
      <Field label="Email">
        <input className="az-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
      </Field>
      <Field label="Password">
        <input className="az-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </Field>
      {error && <div className="az-alert" role="alert">{error}</div>}
      <Btn kind="y" type="submit" block disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Btn>
      <div className="az-row az-muted" style={{ justifyContent: 'center', gap: 8, fontSize: 12.5 }}>
        <Icon name="lock" size={14} />
        Access is limited to Operations, Finance and Administrators
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'radial-gradient(ellipse at top, #0E2A22 0%, var(--bg) 60%)' }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
