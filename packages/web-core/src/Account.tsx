'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { serviceLabel, type Booking, type SavedAddress, type WalletSummary } from '@ridean/shared';
import { useRidean } from './api-context';
import { Field } from './BookingSearch';
import { IconPin, IconUser } from './icons';
import { BookingRow, Empty, formatWhen, money, StatusPill } from './ui';

// ---------------------------------------------------------------- auth
export function SignInForm({ registerPath = '/signup', defaultNext = '/' }: { registerPath?: string; defaultNext?: string }) {
  const { login } = useRidean();
  const router = useRouter();
  const next = useSearchParams().get('next') || defaultNext;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="rd-stack">
      <h1 className="rd-display" style={{ fontSize: 38 }}>Welcome back</h1>
      <p className="rd-muted" style={{ margin: 0 }}>Sign in to manage your trips.</p>
      <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></Field>
      <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></Field>
      {error && <div className="rd-alert">{error}</div>}
      <button className="rd-btn rd-btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <span className="rd-muted" style={{ textAlign: 'center', fontSize: 14 }}>New to Ridean? <Link className="rd-link" href={`${registerPath}?next=${encodeURIComponent(next)}`}>Create an account</Link></span>
    </form>
  );
}

export function SignUpForm({ signInPath = '/signin', defaultNext = '/' }: { signInPath?: string; defaultNext?: string }) {
  const { register } = useRidean();
  const router = useRouter();
  const next = useSearchParams().get('next') || defaultNext;
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((v) => ({ ...v, [k]: e.target.value }));
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (f.password.length < 8) return setError('Password must be at least 8 characters');
    setBusy(true);
    setError('');
    try {
      await register({ ...f, phone: f.phone || undefined });
      router.push(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="rd-stack">
      <h1 className="rd-display" style={{ fontSize: 38 }}>Create your account</h1>
      <p className="rd-muted" style={{ margin: 0 }}>Upfront prices and premium chauffeurs.</p>
      <div className="rd-grid-2">
        <Field icon={<IconUser />} label="First name"><input value={f.firstName} onChange={set('firstName')} autoComplete="given-name" required /></Field>
        <Field icon={<IconUser />} label="Last name"><input value={f.lastName} onChange={set('lastName')} autoComplete="family-name" required /></Field>
      </div>
      <Field label="Email"><input type="email" value={f.email} onChange={set('email')} autoComplete="email" required /></Field>
      <Field label="Mobile"><input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
      <Field label="Password"><input type="password" value={f.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 8 characters" required /></Field>
      {error && <div className="rd-alert">{error}</div>}
      <button className="rd-btn rd-btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      <span className="rd-muted" style={{ textAlign: 'center', fontSize: 14 }}>Already have an account? <Link className="rd-link" href={`${signInPath}?next=${encodeURIComponent(next)}`}>Sign in</Link></span>
    </form>
  );
}

// ---------------------------------------------------------------- trips
export function TripsList({ bookingPath = '/bookings', bookPath = '/' }: { bookingPath?: string; bookPath?: string }) {
  const { api } = useRidean();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [items, setItems] = useState<Booking[] | null>(null);
  useEffect(() => {
    api.myBookings().then((r) => setItems(r.items)).catch(() => setItems([]));
  }, [api]);
  const filtered = (items ?? []).filter((b) =>
    tab === 'cancelled' ? b.status === 'cancelled' || b.status === 'failed' : tab === 'past' ? b.status === 'completed' : !['completed', 'cancelled', 'failed'].includes(b.status),
  );
  return (
    <div className="rd-stack">
      <div className="rd-row" style={{ ['--gap' as string]: '8px' }}>
        {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
          <button key={t} className="rd-chip" aria-pressed={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {!items && <div className="rd-skeleton" style={{ height: 160 }} />}
      {items && filtered.length === 0 && <Empty title="No trips here yet" text="When you book a ride, transfer or rental it will show up here." action={<Link className="rd-btn" href={bookPath}>Book a trip</Link>} />}
      {filtered.map((b) => <BookingRow key={b.id} b={b} href={`${bookingPath}/${b.id}`} />)}
    </div>
  );
}

export function BookingDetail({ id }: { id: string }) {
  const { api } = useRidean();
  const isNew = useSearchParams().get('new') === '1';
  const [b, setB] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api.getBooking(id).then(setB).catch((e: Error) => setError(e.message)), [api, id]);
  useEffect(() => {
    load();
    // Payment confirmation arrives by webhook — poll briefly while the booking is being confirmed
    const t = setInterval(() => b && ['pending_payment', 'payment_authorised'].includes(b.status) && load(), 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, b?.status]);

  async function cancel() {
    if (!b || !confirm('Cancel this booking?')) return;
    setBusy(true);
    try {
      setB(await api.cancelBooking(b.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !b) return <div className="rd-alert">{error}</div>;
  if (!b) return <div className="rd-skeleton" style={{ height: 380 }} />;
  const row = (k: string, v?: string) => v && (
    <div className="rd-row" style={{ justifyContent: 'space-between', fontSize: 14.5, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span className="rd-muted">{k}</span>
      <span style={{ textAlign: 'right' }}>{v}</span>
    </div>
  );
  return (
    <div className="rd-stack">
      {isNew && b.status !== 'failed' && <div className="rd-note" style={{ background: 'rgba(76,195,138,.12)', color: '#9fe3c0' }}>Thank you — your booking {b.reference} is {b.status === 'confirmed' ? 'confirmed' : 'being confirmed'}. A confirmation email is on its way.</div>}
      {b.status === 'failed' && <div className="rd-alert">The supplier could not confirm this booking. You have not been charged.</div>}
      <div className="rd-card rd-stack">
        <div className="rd-row" style={{ justifyContent: 'space-between' }}>
          <div className="rd-stack" style={{ ['--gap' as string]: '4px' }}>
            <span className="rd-eyebrow">{serviceLabel(b.service)}</span>
            <h1 className="rd-display" style={{ fontSize: 30 }}>{b.reference}</h1>
          </div>
          <StatusPill status={b.status} />
        </div>
        <div>
          {row('Pickup', b.pickup.address)}
          {row(b.service === 'rent' ? 'Return location' : 'Drop-off', b.dropoff?.address)}
          {row(b.service === 'rent' ? 'Pick-up' : 'Pickup time', formatWhen(b.pickupAt))}
          {row('Return', b.returnAt ? formatWhen(b.returnAt) : undefined)}
          {row('Flight', b.flightNumber)}
          {row('Vehicle', `${b.vehicle.name} · ${b.vehicle.passengers} passengers · ${b.vehicle.bags} bags`)}
          {row('Supplier', `${b.supplierName}${b.supplierReference ? ` · ${b.supplierReference}` : ''}`)}
          {row('Passenger', `${b.passenger.firstName} ${b.passenger.lastName} · ${b.passenger.phone}`)}
          {row('Total paid', money(b.price.customerPrice, b.price.currency))}
        </div>
        {error && <div className="rd-alert">{error}</div>}
        {['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned'].includes(b.status) && (
          <button className="rd-btn rd-btn-ghost" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel booking'}</button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- wallet
export function WalletView() {
  const { api, stripeKey } = useRidean();
  const [w, setW] = useState<WalletSummary | null>(null);
  const [topUp, setTopUp] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api.wallet().then(setW), [api]);
  useEffect(() => {
    load();
  }, [load]);
  async function add(amount: number) {
    setMsg('');
    const r = await api.topUpWallet(amount);
    if (r.clientSecret && stripeKey) setTopUp(r.clientSecret);
    else {
      setMsg(`Added ${money(amount)} to your wallet`);
      load();
    }
  }
  if (!w) return <div className="rd-skeleton" style={{ height: 240 }} />;
  return (
    <div className="rd-stack">
      <div className="rd-card rd-stack" style={{ background: 'linear-gradient(135deg,#1E5442,#0E2A22)' }}>
        <span className="rd-muted">Ridean Wallet balance</span>
        <span className="rd-display" style={{ fontSize: 44 }}>{money(w.balance, w.currency)}</span>
        <div className="rd-row" style={{ flexWrap: 'wrap', ['--gap' as string]: '8px' }}>
          {[2500, 5000, 10000].map((a) => <button key={a} className="rd-chip" onClick={() => add(a)}>+ {money(a, w.currency)}</button>)}
        </div>
        {msg && <span style={{ color: 'var(--ok)', fontSize: 14 }}>{msg}</span>}
      </div>
      {topUp && stripeKey && (
        <div className="rd-card">
          <Elements stripe={loadStripe(stripeKey)} options={{ clientSecret: topUp, appearance: { theme: 'night' } }}>
            <SetupOrPay mode="pay" onDone={() => { setTopUp(null); setMsg('Top-up received — it will appear in a moment'); setTimeout(load, 2500); }} />
          </Elements>
        </div>
      )}
      <div className="rd-card rd-stack">
        <h3 className="rd-display" style={{ fontSize: 20 }}>Activity</h3>
        {w.transactions.length === 0 && <span className="rd-muted">No wallet activity yet.</span>}
        {w.transactions.map((t) => (
          <div key={t.id} className="rd-row" style={{ justifyContent: 'space-between', fontSize: 14.5, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{t.description}<br /><span className="rd-muted" style={{ fontSize: 12.5 }}>{new Date(t.createdAt).toLocaleDateString()}</span></span>
            <strong style={{ color: t.amount > 0 ? 'var(--ok)' : 'var(--cream)' }}>{t.amount > 0 ? '+' : ''}{money(t.amount, w.currency)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupOrPay({ mode, onDone }: { mode: 'pay' | 'setup'; onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function go(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const opts = { elements, redirect: 'if_required' as const, confirmParams: { return_url: location.href } };
    const r = mode === 'pay' ? await stripe.confirmPayment(opts) : await stripe.confirmSetup(opts);
    setBusy(false);
    if (r.error) setError(r.error.message ?? 'Something went wrong');
    else onDone();
  }
  return (
    <form onSubmit={go} className="rd-stack">
      <PaymentElement />
      {error && <div className="rd-alert">{error}</div>}
      <button className="rd-btn" disabled={busy || !stripe}>{busy ? 'Please wait…' : mode === 'pay' ? 'Add money' : 'Save card'}</button>
    </form>
  );
}

// ---------------------------------------------------------------- profile, cards, addresses
export function ProfileView({ onSignedOut }: { onSignedOut?: () => void }) {
  const { api, user, refresh, logout, stripeKey } = useRidean();
  const [f, setF] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' });
  const [saved, setSaved] = useState('');
  const [cards, setCards] = useState<{ id: string; brand: string; last4: string; expMonth: number; expYear: number }[]>([]);
  const [setup, setSetup] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addr, setAddr] = useState({ label: '', address: '' });

  const loadCards = useCallback(() => api.paymentMethods().then(setCards).catch(() => undefined), [api]);
  const loadAddresses = useCallback(() => api.addresses().then(setAddresses).catch(() => undefined), [api]);
  useEffect(() => {
    loadCards();
    loadAddresses();
  }, [loadCards, loadAddresses]);

  async function save(e: FormEvent) {
    e.preventDefault();
    await api.updateMe(f);
    await refresh();
    setSaved('Saved');
    setTimeout(() => setSaved(''), 2000);
  }
  async function addAddress(e: FormEvent) {
    e.preventDefault();
    if (!addr.label || !addr.address) return;
    await api.addAddress(addr);
    setAddr({ label: '', address: '' });
    loadAddresses();
  }

  return (
    <div className="rd-stack" style={{ ['--gap' as string]: '18px' }}>
      <form className="rd-card rd-stack" onSubmit={save}>
        <h3 className="rd-display" style={{ fontSize: 20 }}>Personal details</h3>
        <div className="rd-grid-2">
          <Field label="First name"><input value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
          <Field label="Last name"><input value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
        </div>
        <Field label="Mobile"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <span className="rd-muted" style={{ fontSize: 13 }}>{user?.email}</span>
        <div className="rd-row"><button className="rd-btn">Save changes</button>{saved && <span style={{ color: 'var(--ok)' }}>{saved}</span>}</div>
      </form>

      <div className="rd-card rd-stack">
        <h3 className="rd-display" style={{ fontSize: 20 }}>Payment methods</h3>
        {cards.length === 0 && <span className="rd-muted" style={{ fontSize: 14 }}>{stripeKey ? 'No saved cards yet.' : 'Saved cards are available once Stripe is configured.'}</span>}
        {cards.map((c) => (
          <div key={c.id} className="rd-row" style={{ justifyContent: 'space-between' }}>
            <span style={{ textTransform: 'capitalize' }}>{c.brand} •••• {c.last4} <span className="rd-muted">· {String(c.expMonth).padStart(2, '0')}/{String(c.expYear).slice(-2)}</span></span>
            <button className="rd-chip" onClick={() => api.removePaymentMethod(c.id).then(loadCards)}>Remove</button>
          </div>
        ))}
        {stripeKey && !setup && <button className="rd-btn rd-btn-dark" onClick={() => api.createSetupIntent().then((r) => setSetup(r.clientSecret))}>Add a card</button>}
        {stripeKey && setup && (
          <Elements stripe={loadStripe(stripeKey)} options={{ clientSecret: setup, appearance: { theme: 'night' } }}>
            <SetupOrPay mode="setup" onDone={() => { setSetup(null); loadCards(); }} />
          </Elements>
        )}
      </div>

      <div className="rd-card rd-stack">
        <h3 className="rd-display" style={{ fontSize: 20 }}>Saved places</h3>
        {addresses.map((a) => (
          <div key={a.id} className="rd-row" style={{ justifyContent: 'space-between' }}>
            <span className="rd-row" style={{ ['--gap' as string]: '10px' }}><IconPin size={18} /><span><strong>{a.label}</strong><br /><span className="rd-muted" style={{ fontSize: 13 }}>{a.address}</span></span></span>
            <button className="rd-chip" onClick={() => api.deleteAddress(a.id).then(loadAddresses)}>Remove</button>
          </div>
        ))}
        <form className="rd-grid-2" onSubmit={addAddress}>
          <Field label="Label"><input value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} placeholder="Home, Office…" /></Field>
          <Field label="Address"><input value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} /></Field>
          <button className="rd-btn rd-btn-dark">Add place</button>
        </form>
      </div>

      <button className="rd-btn rd-btn-ghost" onClick={() => { logout(); onSignedOut?.(); }}>Sign out</button>
    </div>
  );
}

