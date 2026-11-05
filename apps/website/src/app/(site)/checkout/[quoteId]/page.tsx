'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, type FormEvent } from 'react';
import { ApiError, SERVICES, formatMoney, serviceLabel, type CoreServiceKey, type PromoResult, type Quote, type ServiceKey } from '@ridean/shared';
import { useRidean } from '@ridean/web-core';
import { Arrow, C, ErrorNote, Field, Skeleton } from '@/components/site/ui';
import { loadDraft, saveDraft } from '@/components/checkout/draft';
import { CheckoutSteps, H1, H2, IconCheck, IconFlight, IconMail, IconPhone, IconShield, IconUser, Panel, PriceLine, Divider, VehicleCard } from '@/components/checkout/parts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function searchAgainHref(service?: ServiceKey) {
  const def = service ? SERVICES[service as CoreServiceKey] : undefined;
  return def ? `/${def.slug}` : '/services';
}

export default function BookingReviewPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = use(params);
  const { api, user, ready } = useRidean();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadError, setLoadError] = useState<{ gone: boolean; message: string } | null>(null);
  const [expired, setExpired] = useState(false);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '', flightNumber: '' });
  const [formError, setFormError] = useState('');
  const [invalid, setInvalid] = useState<Partial<Record<keyof typeof form, boolean>>>({});

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Quote
  useEffect(() => {
    let alive = true;
    api
      .getQuote(quoteId)
      .then((q) => alive && setQuote(q))
      .catch((e: unknown) => {
        if (!alive) return;
        const status = e instanceof ApiError ? e.status : 0;
        const gone = status === 410 || status === 404;
        setLoadError({ gone, message: status === 404 ? 'We couldn’t find this price.' : (e as Error).message });
      });
    return () => {
      alive = false;
    };
  }, [api, quoteId]);

  // Watch the price hold
  useEffect(() => {
    if (!quote) return;
    const check = () => setExpired(Date.parse(quote.expiresAt) < Date.now());
    check();
    const t = setInterval(check, 15_000);
    return () => clearInterval(t);
  }, [quote]);

  // Restore a draft (e.g. coming back from Pay or from sign-in)
  useEffect(() => {
    const d = loadDraft(quoteId);
    if (!d) return;
    setForm((f) => ({
      ...f,
      firstName: d.passenger.firstName || f.firstName,
      lastName: d.passenger.lastName || f.lastName,
      email: d.passenger.email || f.email,
      phone: d.passenger.phone || f.phone,
      notes: d.notes ?? f.notes,
      flightNumber: d.flightNumber ?? f.flightNumber,
    }));
    if (d.promoCode) setPromoInput(d.promoCode);
  }, [quoteId]);

  // Re-apply a restored promo code once the quote is known
  useEffect(() => {
    if (!quote || promo || !promoInput || quote.price.collectedBy === 'supplier') return;
    const d = loadDraft(quoteId);
    if (d?.promoCode && d.promoCode === promoInput) {
      api.applyPromo(quoteId, d.promoCode).then(setPromo).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);

  // Prefill from the signed-in user
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      firstName: f.firstName || user.firstName || '',
      lastName: f.lastName || user.lastName || '',
      email: f.email || user.email || '',
      phone: f.phone || user.phone || '',
    }));
  }, [user]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setInvalid((v) => ({ ...v, [k]: false }));
  };

  async function applyPromo() {
    const code = promoInput.trim();
    setPromoError('');
    if (!code) return setPromoError('Enter a promo code');
    setPromoBusy(true);
    try {
      setPromo(await api.applyPromo(quoteId, code));
    } catch (e) {
      setPromo(null);
      setPromoError((e as Error).message);
    } finally {
      setPromoBusy(false);
    }
  }

  function removePromo() {
    setPromo(null);
    setPromoInput('');
    setPromoError('');
  }

  function draft() {
    return {
      passenger: { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim() },
      notes: form.notes.trim() || undefined,
      flightNumber: form.flightNumber.trim() || undefined,
      promoCode: promo?.code,
    };
  }

  function onContinue(e?: FormEvent) {
    e?.preventDefault();
    if (!quote || !ready) return;
    setFormError('');
    if (!user) {
      saveDraft(quoteId, draft());
      router.push(`/signin?next=${encodeURIComponent(`/checkout/${quoteId}`)}`);
      return;
    }
    const bad: Partial<Record<keyof typeof form, boolean>> = {
      firstName: !form.firstName.trim(),
      lastName: !form.lastName.trim(),
      email: !EMAIL_RE.test(form.email.trim()),
      phone: form.phone.replace(/\D/g, '').length < 6,
    };
    setInvalid(bad);
    if (bad.firstName || bad.lastName) return setFormError('Please enter the passenger’s first and last name.');
    if (bad.email) return setFormError('Please enter a valid email address.');
    if (bad.phone) return setFormError('Please enter a mobile number so your chauffeur can reach you.');
    saveDraft(quoteId, draft());
    router.push(`/checkout/${quoteId}/pay`);
  }

  // ---------------------------------------------------------------- states
  if (loadError) {
    return (
      <div className="dz-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640 }}>
          <CheckoutSteps step={2} />
          <H1>{loadError.gone ? 'This price is no longer available' : 'Review your booking'}</H1>
          <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.muted }}>
                {loadError.gone ? 'Prices are held for a short time. Search again to get a fresh, upfront price.' : loadError.message}
              </p>
              <Link href={searchAgainHref()} className="dz-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 17, fontWeight: 600 }}>
                <span>Search again</span>
                <Arrow />
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="dz-container">
        <div className="dz-main-aside">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <CheckoutSteps step={2} />
            <H1>Review your booking</H1>
            <Skeleton h={220} />
            <Skeleton h={100} />
            <Skeleton h={240} />
          </div>
          <Skeleton h={340} />
        </div>
      </div>
    );
  }

  const currency = quote.price.currency;
  const supplierCollects = quote.price.collectedBy === 'supplier';
  const total = promo ? promo.customerPrice : quote.price.customerPrice;
  const isAirport = quote.service === 'airport_transfer';
  const facts = [
    quote.etaMinutes != null ? `Pickup in about ${quote.etaMinutes} min` : '',
    quote.durationMinutes != null ? `About ${quote.durationMinutes} min trip` : '',
    quote.distanceKm != null ? `${Math.round(quote.distanceKm * 10) / 10} km` : '',
  ].filter(Boolean);

  return (
    <div className="dz-container">
      <form className="dz-main-aside" onSubmit={onContinue} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <CheckoutSteps step={2} />
          <H1>Review your booking</H1>

          {/* Decorative street-map illustration */}
          <div style={{ position: 'relative', height: 220, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}`, background: '#0A2019' }}>
            <svg width="100%" height="100%" viewBox="0 0 790 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <rect width="790" height="220" fill="#0A2019" />
              <g stroke="#143A2E" strokeWidth="12" fill="none">
                <path d="M-10 66 L800 48" />
                <path d="M-10 165 L800 187" />
                <path d="M203 -10 L271 230" />
                <path d="M564 -10 L519 230" />
              </g>
              <g stroke="#10302A" strokeWidth="6" fill="none">
                <path d="M-10 114 L800 110" />
                <path d="M384 -10 L406 230" />
                <path d="M700 -10 L677 230" />
                <path d="M68 -10 L113 230" />
                <path d="M474 -10 L463 230" />
              </g>
              <rect x="305" y="128" width="70" height="34" rx="5" fill="#123A2A" />
              <rect x="429" y="22" width="60" height="40" rx="5" fill="#123A2A" />
              <rect x="90" y="18" width="54" height="36" rx="5" fill="#123A2A" />
              <path d="M158 158 C 316 150, 339 92, 451 79 S 609 53, 643 44" stroke="#D9A94F" strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle cx="158" cy="158" r="9" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
              <circle cx="643" cy="44" r="10" fill="#F6C428" />
              <circle cx="643" cy="44" r="4" fill="#071A14" />
            </svg>
          </div>

          {/* What you're booking (the quote carries no route, so show what it does carry) */}
          <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{serviceLabel(quote.service)} · provided by</div>
                <div style={{ fontSize: 16, marginTop: 3 }}>{quote.supplierName}</div>
              </div>
              {facts.length > 0 && <div style={{ fontSize: 13.5, color: C.muted }}>{facts.join(' · ')}</div>}
              {quote.inclusions.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {quote.inclusions.map((inc) => (
                    <li key={inc} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <IconCheck />
                      {inc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <VehicleCard
            vehicle={quote.vehicle}
            action={
              <button type="button" className="dz-btn-reset" onClick={() => router.back()} style={{ fontSize: 14, color: C.gold }}>
                Change
              </button>
            }
          />

          <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
              <H2>Passenger</H2>
              <div className="dz-split" style={{ gap: 12 }}>
                <Field icon={<IconUser />} label="First name" style={invalid.firstName ? { borderColor: C.bad } : undefined}>
                  <input className="dz-input" name="firstName" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} aria-invalid={invalid.firstName || undefined} />
                </Field>
                <Field icon={<IconUser />} label="Last name" style={invalid.lastName ? { borderColor: C.bad } : undefined}>
                  <input className="dz-input" name="lastName" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} aria-invalid={invalid.lastName || undefined} />
                </Field>
                <Field icon={<IconMail />} label="Email" style={invalid.email ? { borderColor: C.bad } : undefined}>
                  <input className="dz-input" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={invalid.email || undefined} />
                </Field>
                <Field icon={<IconPhone />} label="Mobile" style={invalid.phone ? { borderColor: C.bad } : undefined}>
                  <input className="dz-input" name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} aria-invalid={invalid.phone || undefined} />
                </Field>
              </div>
              {isAirport && (
                <Field icon={<IconFlight />} label="Flight number (optional)">
                  <input className="dz-input" name="flightNumber" placeholder="e.g. BA 117" maxLength={12} value={form.flightNumber} onChange={set('flightNumber')} />
                </Field>
              )}
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 12, color: C.muted }}>Note for your chauffeur (optional)</span>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="e.g. I'll wait by the main entrance"
                  style={{ all: 'unset', boxSizing: 'border-box', display: 'block', width: '100%', marginTop: 6, padding: 12, border: `1px solid ${C.line}`, borderRadius: 12, background: C.bg, fontSize: 14, color: C.cream, whiteSpace: 'pre-wrap' }}
                />
              </label>
              {formError && <ErrorNote>{formError}</ErrorNote>}
            </div>
          </Panel>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0, position: 'sticky', top: 20, alignSelf: 'start' }}>
          <Panel padding={22}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
              <H2>Price details</H2>
              {!supplierCollects && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: `1px solid ${C.line}`, borderRadius: 12, background: C.bg }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M3 12V4h8l10 10-8 8z" />
                      <circle cx="7.5" cy="8.5" r="1.5" />
                    </svg>
                    <input
                      name="promo"
                      aria-label="Promo code"
                      placeholder="Promo code"
                      value={promo ? promo.code : promoInput}
                      readOnly={!!promo}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!promo) applyPromo();
                        }
                      }}
                      style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: 14, color: C.cream, textTransform: promoInput || promo ? 'uppercase' : 'none' }}
                    />
                    {promo ? (
                      <button type="button" onClick={removePromo} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: C.gold }}>
                        Remove
                      </button>
                    ) : (
                      <button type="button" onClick={applyPromo} disabled={promoBusy} style={{ all: 'unset', cursor: promoBusy ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600, color: C.gold, opacity: promoBusy ? 0.6 : 1 }}>
                        {promoBusy ? 'Checking…' : 'Apply'}
                      </button>
                    )}
                  </label>
                  {promoError && <div role="alert" style={{ fontSize: 13, color: '#FFB3AC' }}>{promoError}</div>}
                  {promo && <div role="status" style={{ fontSize: 13, color: C.ok }}>Promo applied: {promo.percentOff}% off</div>}
                </div>
              )}
              <div>
                <PriceLine label="Fare (taxes and fees included)" value={formatMoney(quote.price.customerPrice, currency)} />
                {promo && promo.discount > 0 && <PriceLine label={`Promo · ${promo.code}`} value={`−${formatMoney(promo.discount, currency)}`} color={C.ok} />}
                <Divider />
                <PriceLine label="Total" value={formatMoney(total, currency)} strong />
              </div>
              {supplierCollects && (
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>You’ll pay {quote.supplierName} directly when you confirm.</div>
              )}
              {expired && (
                <ErrorNote>
                  This price has expired.{' '}
                  <Link href={searchAgainHref(quote.service)} style={{ color: C.gold, fontWeight: 600 }}>
                    Search again
                  </Link>
                </ErrorNote>
              )}
              <button type="submit" className="dz-cta" disabled={expired || !ready} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 17, fontWeight: 600, width: '100%' }}>
                <span>{ready && !user ? 'Sign in to continue' : 'Continue to payment'}</span>
                <Arrow />
              </button>
              {quote.cancellation && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: C.muted }}>
                  <IconShield />
                  {quote.cancellation}
                </div>
              )}
            </div>
          </Panel>
        </div>
      </form>
    </div>
  );
}
