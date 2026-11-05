'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRidean } from '@ridean/web-core/src/api-context';

function LoginForm() {
  const { login, logout } = useRidean();
  const router = useRouter();
  const next = useSearchParams().get('next') || '/';
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
    <form onSubmit={submit} className="rd-card rd-stack" style={{ width: 380, padding: 28 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--gold)' }}>Ridean <span style={{ fontSize: 14, color: '#8aa59a', letterSpacing: '.18em' }}>ADMIN</span></div>
      <label className="rd-stack" style={{ ['--gap' as string]: '5px', fontSize: 13 }}>Email<input className="inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
      <label className="rd-stack" style={{ ['--gap' as string]: '5px', fontSize: 13 }}>Password<input className="inp" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
      {error && <div className="rd-alert">{error}</div>}
      <button className="rd-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <Suspense><LoginForm /></Suspense>
    </div>
  );
}
