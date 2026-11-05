'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, type FormEvent } from 'react';
import { ApiError, formatMoney, serviceLabel, type PromoResult, type Quote, type QuoteSearchRequest } from '@ridean/shared';
import { useRidean } from '@ridean/web-core';
import { C, ErrorNote, Field, Skeleton, ctaStyle } from '@/components/site/ui';
import { ArrowIcon, FlightIcon, ShieldIcon } from '@/components/booking/icons';
import { Column, Cta, PageHeader, RouteMap, SectionTitle, panel, screenStyle } from '@/components/booking/parts';
import { loadDraft, saveDraft, type CheckoutDraft } from '@/components/checkout/draft';
import { Divider, IconMail, IconPhone, IconTag, IconUser, PriceLine, fmtDate, fmtTime, fmtWhen, searchAgainHref, vehicleImage, vehicleTitle } from '@/components/checkout/parts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FormKey = 'firstName' | 'lastName' | 'email' | 'phone' | 'notes' | 'flightNumber';

export default function BookingReviewPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = use(params);
  const { api, user, ready } = useRidean();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadError, setLoadError] = useState<{ gone: boolean; message: string } | null>(null);
  const [expired, setExpired] = useState(false);
  const [search, setSearch] = useState<QuoteSearchRequest | undefined>(undefined);

  const [form, setForm] = useState<Record<FormKey, string>>({ firstName: '', lastName: '', email: '', phone: '', notes: '', flightNumber: '' });
  const [formError, setFormError] = useState('');
  const [invalid, setInvalid] = useState<Partial<Record<FormKey, boolean>>>({});

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
        setLoadError({ gone: status === 410 || status === 404, message: status === 404 ? 'We couldn’t find this price.' : (e as Error).message });
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

  // Restore the draft: trip + notes from the booking screen, passenger/promo when coming back from Pay or sign-in
  useEffect(() => {
    const d = loadDraft(quoteId);
    if (!d) return;
    setSearch(d.search);
    setForm((f) => ({
      ...f,
      firstName: d.passenger?.firstName || f.firstName,
      lastName: d.passenger?.lastName || f.lastName,
      email: d.passenger?.email || f.email,
      phone: d.passenger?.phone || f.phone,
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

  const set = (k: FormKey) => (e: { target: { value: string } }) => {
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

  function draft(): CheckoutDraft {
    return {
      passenger: { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim() },
      notes: form.notes.trim() || undefined,
      flightNumber: form.flightNumber.trim() || undefined,
      promoCode: promo?.code,
      search,
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
    const bad: Partial<Record<FormKey, boolean>> = {
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
      <div style={screenStyle}>
        <PageHeader title={loadError.gone ? 'Price expired' : 'Review booking'} fallback="/" />
        <Column>
          <div style={panel(16)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: C.muted }}>
                {loadError.gone ? 'This price is no longer available. Prices are held for a short time — search again to get a fresh, upfront price.' : loadError.message}
              </p>
              <Link href={searchAgainHref(search?.service, search)} className="dz-cta" style={ctaStyle}>
                <span>Search again</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </Column>
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={screenStyle}>
        <PageHeader title="Review booking" fallback="/" />
        <Column>
          <Skeleton h={150} />
          <Skeleton h={110} />
          <Skeleton h={80} />
          <Skeleton h={200} />
        </Column>
      </div>
    );
  }

  const currency = quote.price.currency;
  const supplierCollects = quote.price.collectedBy === 'supplier';
  const total = promo ? promo.customerPrice : quote.price.customerPrice;
  const isAirport = quote.service === 'airport_transfer';
  const v = quote.vehicle;
  const title = vehicleTitle(v);
  const vehicleSub = [v.name !== title ? `${v.name}` : '', `${v.passengers} seats`, quote.supplierName].filter(Boolean).join(' · ');

  return (
    <div style={screenStyle}>
      <PageHeader title="Review booking" fallback={searchAgainHref(quote.service, search)} />
      <form onSubmit={onContinue} noValidate>
        <Column>
          {/* Decorative street-map illustration */}
          <RouteMap compact />

          <TripCard quote={quote} search={search} />

          <div style={panel(14)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 72, height: 50, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img src={vehicleImage(v)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{vehicleSub}</div>
              </div>
              <button type="button" className="dz-btn-reset" onClick={() => router.back()} style={{ fontSize: 13, color: C.gold }}>
                Change
              </button>
            </div>
          </div>

          <SectionTitle>Passenger</SectionTitle>
          <div style={panel(16)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field icon={<IconUser />} label="First name" style={invalid.firstName ? { borderColor: C.bad } : undefined}>
                    <input className="dz-input" name="firstName" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} aria-invalid={invalid.firstName || undefined} />
                  </Field>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label="Last name" style={invalid.lastName ? { borderColor: C.bad } : undefined}>
                    <input className="dz-input" name="lastName" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} aria-invalid={invalid.lastName || undefined} />
                  </Field>
                </div>
              </div>
              <Field icon={<IconMail />} label="Email" style={invalid.email ? { borderColor: C.bad } : undefined}>
                <input className="dz-input" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={invalid.email || undefined} />
              </Field>
              <Field icon={<IconPhone />} label="Mobile" style={invalid.phone ? { borderColor: C.bad } : undefined}>
                <input className="dz-input" name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} aria-invalid={invalid.phone || undefined} />
              </Field>
              {isAirport && (
                <Field icon={<FlightIcon />} label="Flight number (optional)">
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
            </div>
          </div>

          {!supplierCollects && (
            <div style={panel(14)}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconTag />
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
                  style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: 14.5, color: C.cream, textTransform: promoInput || promo ? 'uppercase' : 'none' }}
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
              {promoError && (
                <div role="alert" style={{ fontSize: 13, color: '#FFB3AC', marginTop: 10 }}>
                  {promoError}
                </div>
              )}
              {promo && (
                <div role="status" style={{ fontSize: 13, color: C.ok, marginTop: 10 }}>
                  Promo applied: {promo.percentOff}% off
                </div>
              )}
            </div>
          )}

          <div style={panel(16)}>
            <PriceLine label="Fare (taxes and fees included)" value={formatMoney(quote.price.customerPrice, currency)} />
            {!supplierCollects && <PriceLine label={promo ? `Promo · ${promo.code}` : 'Promo'} value={promo && promo.discount > 0 ? `−${formatMoney(promo.discount, currency)}` : '—'} color={C.ok} />}
            <Divider />
            <PriceLine label="Total" value={formatMoney(total, currency)} strong />
            {supplierCollects && <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginTop: 6 }}>You’ll pay {quote.supplierName} directly when you confirm.</div>}
          </div>

          {quote.cancellation && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, color: C.muted }}>
              <ShieldIcon size={16} />
              {quote.cancellation}
            </div>
          )}
          {expired && (
            <ErrorNote>
              This price has expired.{' '}
              <Link href={searchAgainHref(quote.service, search)} style={{ color: C.gold, fontWeight: 600 }}>
                Search again
              </Link>
            </ErrorNote>
          )}
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <Cta type="submit" disabled={expired || !ready}>
            {ready && !user ? 'Sign in to continue' : 'Continue to payment'}
          </Cta>
        </Column>
      </form>
    </div>
  );
}

/** Pickup → drop-off card built from the search the user ran (a quote carries no route). */
function TripCard({ quote, search }: { quote: Quote; search?: QuoteSearchRequest }) {
  if (!search) {
    const facts = [quote.etaMinutes != null ? `Pickup in about ${quote.etaMinutes} min` : '', quote.durationMinutes != null ? `About ${quote.durationMinutes} min trip` : ''].filter(Boolean);
    return (
      <div style={panel(16)}>
        <div style={{ fontSize: 12, color: C.muted }}>{serviceLabel(quote.service)} · provided by</div>
        <div style={{ fontSize: 15, marginTop: 2 }}>{quote.supplierName}</div>
        {facts.length > 0 && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>{facts.join(' · ')}</div>}
      </div>
    );
  }

  const rent = search.service === 'rent';
  let first: { label: string; address: string };
  let second: { label: string; address: string } | null = null;
  if (rent) {
    first = { label: `Pick-up · ${fmtDate(search.rentalPickupAt)}`, address: search.pickup.address };
    second = { label: `Return · ${fmtDate(search.rentalReturnAt)}`, address: (search.returnLocation ?? search.pickup).address };
  } else {
    const startMs = search.pickupAt ? Date.parse(search.pickupAt) : quote.etaMinutes != null ? Date.now() + quote.etaMinutes * 60_000 : undefined;
    const when = search.pickupAt ? fmtWhen(search.pickupAt) : quote.etaMinutes != null ? `in about ${quote.etaMinutes} min` : 'As soon as possible';
    const hours = search.service === 'hourly' && search.hours ? ` · ${search.hours} hours` : '';
    first = { label: `Pickup · ${when}${hours}`, address: search.pickup.address };
    if (search.dropoff?.address) {
      const est = startMs != null && quote.durationMinutes != null ? ` · est. ${fmtTime(new Date(startMs + quote.durationMinutes * 60_000))}` : '';
      second = { label: `Drop-off${est}`, address: search.dropoff.address };
    }
  }

  return (
    <div style={panel(16)}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, border: `2.5px solid ${C.gold}`, boxSizing: 'border-box' }} />
          {second && (
            <>
              <div style={{ width: 2, flex: 1, background: C.line, margin: '4px 0' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: C.yellow }} />
            </>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted }}>{first.label}</div>
            <div style={{ fontSize: 15, marginTop: 2, overflowWrap: 'anywhere' }}>{first.address}</div>
          </div>
          {second && (
            <div>
              <div style={{ fontSize: 12, color: C.muted }}>{second.label}</div>
              <div style={{ fontSize: 15, marginTop: 2, overflowWrap: 'anywhere' }}>{second.address}</div>
            </div>
          )}
          {search.tripType === 'return' && search.returnAt && <div style={{ fontSize: 12, color: C.muted }}>Return journey · {fmtWhen(search.returnAt)}</div>}
        </div>
      </div>
    </div>
  );
}
