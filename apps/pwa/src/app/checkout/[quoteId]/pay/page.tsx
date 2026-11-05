'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, formatMoney, type BusinessAccount, type CreateBookingRequest, type PromoResult, type Quote, type SavedCard, type WalletSummary } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { C, ErrorNote, Field, Skeleton, ctaStyle } from '@/components/site/ui';
import { ArrowIcon } from '@/components/booking/icons';
import { Column, Cta, PageHeader, SectionTitle, panel, screenStyle } from '@/components/booking/parts';
import { clearDraft, loadDraft, type CheckoutDraft } from '@/components/checkout/draft';
import { Divider, IconBriefcase, IconCard, IconLock, IconPlus, IconWallet, PriceLine, searchAgainHref } from '@/components/checkout/parts';
import { getStripe, stripeAppearance } from '@/components/checkout/stripe';

type Pm = { kind: 'card'; id: string } | { kind: 'wallet' } | { kind: 'business' } | { kind: 'new' };
const TIPS = [0, 10, 15, 20];
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function PaymentPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = use(params);
  return (
    <div style={screenStyle}>
      <PageHeader title="Payment" fallback={`/checkout/${quoteId}`} />
      <Column>
        <RequireAuth>
          <Pay quoteId={quoteId} />
        </RequireAuth>
      </Column>
    </div>
  );
}

function Pay({ quoteId }: { quoteId: string }) {
  const { api, stripeKey } = useRidean();
  const router = useRouter();

  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadError, setLoadError] = useState<{ gone: boolean; message: string } | null>(null);
  const [cards, setCards] = useState<SavedCard[] | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [extrasReady, setExtrasReady] = useState(false);

  const [pm, setPm] = useState<Pm | null>(null);
  const [tipPct, setTipPct] = useState(0);
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stripePay, setStripePay] = useState<{ clientSecret: string; bookingId: string } | null>(null);

  // Draft from the Review step — without a passenger we can't book
  useEffect(() => {
    const d = loadDraft(quoteId);
    if (!d?.passenger) {
      router.replace(`/checkout/${quoteId}`);
      return;
    }
    setDraft(d);
  }, [quoteId, router]);

  // Quote + payment options
  useEffect(() => {
    if (!draft) return;
    let alive = true;
    api
      .getQuote(quoteId)
      .then(async (q) => {
        if (!alive) return;
        setQuote(q);
        if (q.price.collectedBy === 'supplier') {
          setExtrasReady(true);
          return;
        }
        const [c, w, b, p] = await Promise.all([
          api.paymentMethods().catch(() => [] as SavedCard[]),
          api.wallet().catch(() => null),
          api.business().catch(() => null),
          draft.promoCode ? api.applyPromo(quoteId, draft.promoCode).catch(() => null) : Promise.resolve(null),
        ]);
        if (!alive) return;
        setCards(c);
        setWallet(w);
        setBusiness(b);
        setPromo(p);
        setExtrasReady(true);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        const status = e instanceof ApiError ? e.status : 0;
        setLoadError({ gone: status === 410 || status === 404, message: (e as Error).message });
      });
    return () => {
      alive = false;
    };
  }, [api, quoteId, draft]);

  const currency = quote?.price.currency ?? 'USD';
  const supplierCollects = quote?.price.collectedBy === 'supplier';
  const baseFare = quote?.price.customerPrice ?? 0;
  const discount = promo?.discount ?? 0;
  const fare = promo ? promo.customerPrice : baseFare;
  const tip = supplierCollects ? 0 : Math.round((fare * tipPct) / 100);
  const total = fare + tip;
  const walletOk = !!wallet && wallet.balance >= total;

  // Preselect a sensible option once the data is in
  useEffect(() => {
    if (!extrasReady || supplierCollects || pm) return;
    const def = cards?.find((c) => c.isDefault) ?? cards?.[0];
    if (def) setPm({ kind: 'card', id: def.id });
    else if (stripeKey) setPm({ kind: 'new' });
    else if (walletOk) setPm({ kind: 'wallet' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extrasReady]);

  // A tip can push the total over the wallet balance
  useEffect(() => {
    if (pm?.kind === 'wallet' && !walletOk) setPm(null);
  }, [pm, walletOk]);

  async function pay() {
    if (!quote || !draft?.passenger || busy) return;
    setError('');
    if (!supplierCollects) {
      if (!pm) return setError('Choose how you’d like to pay.');
      if (pm.kind === 'business' && business?.policy.requirePurpose && !purpose.trim()) return setError('Your company asks for a trip purpose on business bookings.');
    }
    const req: CreateBookingRequest = {
      quoteId,
      passenger: draft.passenger,
      notes: draft.notes,
      flightNumber: draft.flightNumber,
      promoCode: supplierCollects ? undefined : promo?.code,
    };
    if (!supplierCollects && pm) {
      if (tip > 0) req.tip = tip;
      if (pm.kind === 'card') req.paymentMethodId = pm.id;
      if (pm.kind === 'wallet') req.payWithWallet = true;
      if (pm.kind === 'business') {
        req.payWithBusiness = true;
        if (purpose.trim()) req.tripPurpose = purpose.trim();
      }
    }
    setBusy(true);
    try {
      const r = await api.createBooking(req);
      clearDraft(quoteId);
      const bookingUrl = `/bookings/${r.booking.id}/status`;
      if (r.supplierPaymentUrl) {
        window.location.href = r.supplierPaymentUrl;
        return;
      }
      if (r.clientSecret && stripeKey && r.booking.status === 'pending_payment') {
        if (pm?.kind === 'new') {
          setStripePay({ clientSecret: r.clientSecret, bookingId: r.booking.id });
          setBusy(false);
          return;
        }
        // Saved card that needs extra authentication (3-D Secure)
        const stripe = await getStripe(stripeKey);
        if (stripe) {
          const { error: err } = await stripe.confirmPayment({ clientSecret: r.clientSecret, confirmParams: { return_url: `${location.origin}${bookingUrl}` } });
          if (err) {
            router.push(bookingUrl);
            return;
          }
        }
      }
      router.push(bookingUrl);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // ---------------------------------------------------------------- states
  if (loadError) {
    return (
      <div style={panel(16)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: C.muted }}>
            {loadError.gone ? 'This price is no longer available. Search again to get a fresh, upfront price.' : loadError.message}
          </p>
          <Link href={loadError.gone ? searchAgainHref(draft?.search?.service, draft?.search) : `/checkout/${quoteId}`} className="dz-cta" style={ctaStyle}>
            <span>{loadError.gone ? 'Search again' : 'Back to review'}</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    );
  }

  if (!draft || !quote || !extrasReady) {
    return (
      <>
        <Skeleton h={66} />
        <Skeleton h={66} />
        <Skeleton h={40} />
        <Skeleton h={150} />
      </>
    );
  }

  const returnUrl = stripePay ? `${typeof window !== 'undefined' ? location.origin : ''}/bookings/${stripePay.bookingId}/status` : '';
  const pmOn = (p: Pm) => !!pm && pm.kind === p.kind && (p.kind !== 'card' || (pm.kind === 'card' && pm.id === p.id));
  const addHref = `/account/payment-methods/new?next=${encodeURIComponent(`/checkout/${quoteId}/pay`)}`;

  return (
    <>
      {stripePay ? (
        <>
          <SectionTitle>Card details</SectionTitle>
          <div style={panel(16)}>
            <Elements stripe={getStripe(stripeKey)} options={{ clientSecret: stripePay.clientSecret, appearance: stripeAppearance }}>
              <StripePayForm amount={formatMoney(total, currency)} returnUrl={returnUrl} />
            </Elements>
          </div>
        </>
      ) : supplierCollects ? (
        <>
          <SectionTitle>You’ll pay {quote.supplierName} directly</SectionTitle>
          <div style={panel(16)}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: C.muted }}>
              {quote.supplierName} takes the payment for this trip on its own payment page. Confirm your booking and we’ll take you there if a payment is needed now.
            </p>
          </div>
        </>
      ) : (
        <>
          <SectionTitle>Pay with</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label="Payment method">
            {(cards ?? []).map((c) => {
              const p: Pm = { kind: 'card', id: c.id };
              return (
                <button key={c.id} type="button" role="radio" aria-checked={pmOn(p)} className={`dz-pm ${pmOn(p) ? 'on' : ''}`} onClick={() => setPm(p)}>
                  <PmIcon>
                    <IconCard />
                  </PmIcon>
                  <PmText title={`${cap(c.brand)} •••• ${c.last4}`} sub={`Expires ${String(c.expMonth).padStart(2, '0')}/${String(c.expYear).slice(-2)}${c.isDefault ? ' · Default' : ''}`} />
                  <span className="dz-radio" />
                </button>
              );
            })}
            {stripeKey && (
              <button type="button" role="radio" aria-checked={pmOn({ kind: 'new' })} className={`dz-pm ${pmOn({ kind: 'new' }) ? 'on' : ''}`} onClick={() => setPm({ kind: 'new' })}>
                <PmIcon>
                  <IconCard />
                </PmIcon>
                <PmText title="New card" sub="Enter card details next" />
                <span className="dz-radio" />
              </button>
            )}
            {wallet && (
              <button type="button" role="radio" aria-checked={pmOn({ kind: 'wallet' })} disabled={!walletOk} className={`dz-pm ${pmOn({ kind: 'wallet' }) ? 'on' : ''}`} onClick={() => setPm({ kind: 'wallet' })}>
                <PmIcon>
                  <IconWallet />
                </PmIcon>
                <PmText title="Ridean Wallet" sub={`Balance ${formatMoney(wallet.balance, wallet.currency)}${walletOk ? '' : ' · Not enough balance'}`} />
                <span className="dz-radio" />
              </button>
            )}
            {business && (
              <button type="button" role="radio" aria-checked={pmOn({ kind: 'business' })} className={`dz-pm ${pmOn({ kind: 'business' }) ? 'on' : ''}`} onClick={() => setPm({ kind: 'business' })}>
                <PmIcon>
                  <IconBriefcase />
                </PmIcon>
                <PmText title="Business account" sub={`${business.name} · billed monthly`} />
                <span className="dz-radio" />
              </button>
            )}
          </div>
          {pm?.kind === 'business' && business?.policy.requirePurpose && (
            <Field icon={<IconBriefcase c={C.cream} />} label="Trip purpose (required by your company)">
              <input className="dz-input" value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={200} placeholder="e.g. Client meeting" required />
            </Field>
          )}
          {!cards?.length && !stripeKey && !wallet && !business && <p style={{ margin: 0, fontSize: 14, color: C.muted }}>You haven’t saved a card yet. Add one to pay by card.</p>}
          <Link href={addHref} style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.gold, fontSize: 14.5, fontWeight: 600, padding: 2, alignSelf: 'flex-start' }}>
            <IconPlus />
            Add payment method
          </Link>

          <SectionTitle>Add a tip</SectionTitle>
          <div role="radiogroup" aria-label="Tip" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TIPS.map((t) => (
              <button key={t} type="button" role="radio" aria-checked={tipPct === t} className={`dz-chip ${tipPct === t ? 'on' : ''}`} onClick={() => setTipPct(t)}>
                {t === 0 ? 'No tip' : `${t}%`}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={panel(16)}>
        <PriceLine label="Fare (taxes and fees included)" value={formatMoney(baseFare, currency)} />
        {discount > 0 && promo && <PriceLine label={`Promo · ${promo.code}`} value={`−${formatMoney(discount, currency)}`} color={C.ok} />}
        {!supplierCollects && <PriceLine label="Tip" value={formatMoney(tip, currency)} />}
        <Divider />
        <PriceLine label="Total" value={formatMoney(total, currency)} strong />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {!stripePay && (
        <Cta onClick={pay} disabled={busy || (!supplierCollects && !pm)}>
          {busy ? 'Processing…' : supplierCollects ? 'Confirm booking' : `Pay ${formatMoney(total, currency)}`}
        </Cta>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', fontSize: 12, color: C.muted }}>
        <IconLock />
        Payments are encrypted and secure
      </div>
    </>
  );
}

function PmIcon({ children }: { children: ReactNode }) {
  return <div style={{ width: 44, height: 30, borderRadius: 6, background: C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{children}</div>;
}

function PmText({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
      <div style={{ fontSize: 15, color: C.cream }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function StripePayForm({ amount, returnUrl }: { amount: string; returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
    <form onSubmit={onPay} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PaymentElement />
      {error && <ErrorNote>{error}</ErrorNote>}
      <Cta type="submit" disabled={!stripe || !elements || busy}>
        {busy ? 'Processing…' : `Pay ${amount}`}
      </Cta>
      <span style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>Your card is authorised now and charged once the partner confirms your trip.</span>
    </form>
  );
}
