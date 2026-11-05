'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { serviceLabel, type Quote } from '@ridean/shared';
import { useRidean } from './api-context';
import { Field } from './BookingSearch';
import { IconCheck, IconPlane, IconUser } from './icons';
import { money } from './ui';

const stripeCache = new Map<string, Promise<Stripe | null>>();
const getStripe = (key: string) => {
  if (!stripeCache.has(key)) stripeCache.set(key, loadStripe(key));
  return stripeCache.get(key)!;
};

/**
 * Checkout: passenger details → create booking → pay.
 *  - Ridean collects: Stripe Payment Element confirms the PaymentIntent (authorise; the API captures after the supplier confirms)
 *  - Supplier collects: the supplier's own payment page (if any) opens
 *  - Simulated payments (local dev): the booking is confirmed straight away
 */
export function Checkout({ quoteId, bookingPath = '/bookings', signInPath = '/signin' }: { quoteId: string; bookingPath?: string; signInPath?: string }) {
  const { api, user, ready, stripeKey } = useRidean();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', flightNumber: '', notes: '' });
  const [payWithWallet, setPayWithWallet] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [pay, setPay] = useState<{ clientSecret: string; bookingId: string } | null>(null);

  useEffect(() => {
    api.getQuote(quoteId).then(setQuote).catch((e: Error) => setError(e.message));
  }, [api, quoteId]);
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, firstName: f.firstName || user.firstName, lastName: f.lastName || user.lastName, email: f.email || user.email, phone: f.phone || user.phone || '' }));
    api.wallet().then((w) => setWallet(w.balance)).catch(() => undefined);
  }, [user, api]);

  const expired = quote ? Date.parse(quote.expiresAt) < Date.now() : false;
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!quote) return;
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.phone) return setError('Please fill in the passenger details');
    setBusy(true);
    try {
      const r = await api.createBooking({
        quoteId: quote.id,
        passenger: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        flightNumber: form.flightNumber || undefined,
        notes: form.notes || undefined,
        payWithWallet: payWithWallet || undefined,
      });
      if (r.supplierPaymentUrl) {
        window.location.href = r.supplierPaymentUrl;
        return;
      }
      if (r.clientSecret && stripeKey) {
        setPay({ clientSecret: r.clientSecret, bookingId: r.booking.id });
        return;
      }
      router.push(`${bookingPath}/${r.booking.id}?new=1`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !quote) return <div className="rd-alert">{error}</div>;
  if (!quote || !ready) return <div className="rd-skeleton" style={{ height: 420 }} />;

  const summary = (
    <aside className="rd-card rd-stack" style={{ alignSelf: 'start' }}>
      <span className="rd-eyebrow">{serviceLabel(quote.service)}</span>
      <h2 className="rd-display" style={{ fontSize: 24 }}>{quote.vehicle.name}</h2>
      <span className="rd-muted" style={{ fontSize: 14 }}>{quote.supplierName} · {quote.vehicle.passengers} passengers · {quote.vehicle.bags} bags</span>
      <div className="rd-divider" />
      {quote.inclusions.map((i) => <span key={i} className="rd-row" style={{ fontSize: 14, ['--gap' as string]: '8px' }}><IconCheck size={15} style={{ color: 'var(--ok)' }} />{i}</span>)}
      <span className="rd-muted" style={{ fontSize: 13 }}>{quote.cancellation}</span>
      <div className="rd-divider" />
      <div className="rd-row" style={{ justifyContent: 'space-between' }}>
        <span>Total</span>
        <span className="rd-price">{money(quote.price.customerPrice, quote.price.currency)}</span>
      </div>
      <span className="rd-muted" style={{ fontSize: 12 }}>Taxes and fees included. No surge pricing.</span>
    </aside>
  );

  if (!user)
    return (
      <div className="rd-grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div className="rd-card rd-stack">
          <h2 className="rd-display" style={{ fontSize: 26 }}>Sign in to book</h2>
          <p className="rd-muted" style={{ margin: 0 }}>Your price is held until {new Date(quote.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</p>
          <Link className="rd-btn" href={`${signInPath}?next=${encodeURIComponent(`/checkout/${quote.id}`)}`}>Sign in or create an account</Link>
        </div>
        {summary}
      </div>
    );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20 }} className="rd-checkout">
      <div className="rd-stack">
        {expired && <div className="rd-alert">This price has expired. Please search again.</div>}
        {pay ? (
          <div className="rd-card rd-stack">
            <h2 className="rd-display" style={{ fontSize: 24 }}>Payment</h2>
            <Elements stripe={getStripe(stripeKey)} options={{ clientSecret: pay.clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#D9A94F', colorBackground: '#01201A', colorText: '#F3EEDF', borderRadius: '12px' } } }}>
              <PayForm amount={money(quote.price.customerPrice, quote.price.currency)} returnUrl={`${typeof window !== 'undefined' ? location.origin : ''}${bookingPath}/${pay.bookingId}?new=1`} />
            </Elements>
          </div>
        ) : (
          <form className="rd-card rd-stack" onSubmit={submit}>
            <h2 className="rd-display" style={{ fontSize: 24 }}>Passenger details</h2>
            <div className="rd-grid-2">
              <Field icon={<IconUser />} label="First name"><input value={form.firstName} onChange={set('firstName')} autoComplete="given-name" /></Field>
              <Field icon={<IconUser />} label="Last name"><input value={form.lastName} onChange={set('lastName')} autoComplete="family-name" /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
              <Field label="Mobile"><input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+1 555 000 0000" /></Field>
            </div>
            {(quote.service === 'airport_transfer' || quote.service === 'rent') && (
              <Field icon={<IconPlane size={20} />} label="Flight number (optional)"><input value={form.flightNumber} onChange={set('flightNumber')} placeholder="e.g. BA 117" maxLength={12} /></Field>
            )}
            <Field label="Notes for the chauffeur (optional)"><textarea rows={2} value={form.notes} onChange={set('notes')} maxLength={500} /></Field>
            {wallet >= quote.price.customerPrice && (
              <label className="rd-row" style={{ fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={payWithWallet} onChange={(e) => setPayWithWallet(e.target.checked)} style={{ accentColor: '#F6C428', width: 18, height: 18 }} />
                Pay with Ridean Wallet ({money(wallet, quote.price.currency)} available)
              </label>
            )}
            {error && <div className="rd-alert">{error}</div>}
            <button className="rd-btn rd-btn-block" disabled={busy || expired}>{busy ? 'Booking…' : payWithWallet ? `Pay ${money(quote.price.customerPrice, quote.price.currency)} from wallet` : 'Continue to payment'}</button>
            <span className="rd-muted" style={{ fontSize: 12.5, textAlign: 'center' }}>By booking you agree to the Terms and Privacy policy.</span>
          </form>
        )}
      </div>
      {summary}
      <style>{`@media (max-width: 860px){ .rd-checkout{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function PayForm({ amount, returnUrl }: { amount: string; returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const disabled = useMemo(() => !stripe || !elements || busy, [stripe, elements, busy]);

  async function onPay(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const { error: err } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
    if (err) setError(err.message ?? 'Payment failed');
    setBusy(false);
  }

  return (
    <form onSubmit={onPay} className="rd-stack">
      <PaymentElement />
      {error && <div className="rd-alert">{error}</div>}
      <button className="rd-btn rd-btn-block" disabled={disabled}>{busy ? 'Processing…' : `Pay ${amount}`}</button>
      <span className="rd-muted" style={{ fontSize: 12.5, textAlign: 'center' }}>Your card is authorised now and charged once the supplier confirms.</span>
    </form>
  );
}
