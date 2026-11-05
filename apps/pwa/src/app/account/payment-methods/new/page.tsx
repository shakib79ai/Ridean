'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { ErrorNote, Icon, InputField, S, Screen, ScreenHead, StripeSetup, ToggleRow, errMsg } from '@/components/account/kit';

function safeNext(v: string | null) {
  return v && v.startsWith('/') && !v.startsWith('//') ? v : '/account/payment-methods';
}

function CardPreview({ number, name, expiry }: { number: string; name: string; expiry: string }) {
  const digits = number.replace(/\D/g, '').slice(0, 16);
  const shown = (digits + '••••••••••••••••').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  return (
    <div style={{ borderRadius: '18px', padding: '20px', height: '150px', background: 'linear-gradient(135deg,#1E5442,#0A1F18 75%)', border: '1px solid rgba(217,169,79,.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={S.wordmark}>Ridean</span>
        <div style={{ width: '36px', height: '26px', borderRadius: '5px', background: 'linear-gradient(135deg,#F2D27A,#B9842A)' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '19px', letterSpacing: '.12em', color: '#F3EEDF', whiteSpace: 'nowrap', overflow: 'hidden' }}>{shown}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: '12px', color: '#9FB2A6', marginTop: '8px', textTransform: 'uppercase' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name.trim() || 'YOUR NAME'}</span>
          <span>{expiry || 'MM/YY'}</span>
        </div>
      </div>
    </div>
  );
}

const Note = ({ text }: { text: string }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#9FB2A6', textAlign: 'center' }}>
    <Icon name="lock" size={14} color={C.muted} />
    {text}
  </div>
);

function StripeAddCard({ stripeKey, next }: { stripeKey: string; next: string }) {
  const { api, user } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [makeDefault, setMakeDefault] = useState(true);

  useEffect(() => {
    api.createSetupIntent().then((r) => setSecret(r.clientSecret), (e) => setError(errMsg(e, 'We couldn’t start adding a card. Please try again.')));
  }, [api]);

  async function done({ paymentMethodId }: { paymentMethodId?: string }) {
    if (makeDefault && paymentMethodId) {
      try {
        await api.setDefaultPaymentMethod(paymentMethodId);
      } catch {
        toast('Card saved — set it as default from Payment methods');
        return router.push(next);
      }
    }
    toast('Card saved');
    router.push(next);
  }

  return (
    <div style={S.body}>
      <CardPreview number="" name={user ? `${user.firstName} ${user.lastName}` : ''} expiry="" />
      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : !secret ? (
        <Skeleton h={260} />
      ) : (
        <StripeSetup stripeKey={stripeKey} clientSecret={secret} submitLabel="Save card" onDone={done} footer={<Note text="Card details go straight to our payment processor, Stripe, and never touch our servers" />}>
          <div style={S.list}>
            <ToggleRow title="Set as default" sub="Use for rides, transfers and rentals" on={makeDefault} onChange={setMakeDefault} last />
          </div>
        </StripeSetup>
      )}
    </div>
  );
}

function SimulatedAddCard({ next }: { next: string }) {
  const { api } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [makeDefault, setMakeDefault] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onNumber = (v: string) => setNumber(v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim());
  const onExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    const digits = number.replace(/\D/g, '');
    const [mm, yy] = expiry.split('/');
    const expMonth = Number(mm);
    const expYear = 2000 + Number(yy);
    const now = new Date();
    if (digits.length < 12) return setError('Please enter a valid card number.');
    if (!name.trim()) return setError('Please enter the name on the card.');
    if (!mm || !yy || yy.length !== 2 || expMonth < 1 || expMonth > 12) return setError('Please enter the expiry as MM/YY.');
    if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) return setError('This card has expired.');
    if (!/^\d{3,4}$/.test(cvc)) return setError('Please enter the 3 or 4 digit security code.');
    setError('');
    setBusy(true);
    try {
      // The CVC is only checked here — it is never sent to our API.
      await api.addSimulatedCard({ number: digits, expMonth, expYear, makeDefault });
      toast('Card saved');
      router.push(next);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} style={S.body} noValidate>
      <CardPreview number={number} name={name} expiry={expiry} />
      <div style={{ ...S.panel, padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <InputField icon="card" label="Card number">
            <input inputMode="numeric" name="cnum" type="text" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={number} onChange={(e) => onNumber(e.target.value)} style={S.input} />
          </InputField>
          <InputField icon="user" label="Name on card">
            <input name="cname" type="text" autoComplete="cc-name" placeholder="As shown on card" value={name} onChange={(e) => setName(e.target.value)} style={S.input} />
          </InputField>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, minWidth: '0' }}>
              <InputField icon="calendar" label="Expiry">
                <input inputMode="numeric" name="cexp" type="text" autoComplete="cc-exp" placeholder="MM/YY" value={expiry} onChange={(e) => onExpiry(e.target.value)} style={S.input} />
              </InputField>
            </div>
            <div style={{ flex: 1, minWidth: '0' }}>
              <InputField icon="lock" label="CVC">
                <input inputMode="numeric" name="cvc" type="password" autoComplete="cc-csc" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} style={S.input} />
              </InputField>
            </div>
          </div>
        </div>
      </div>
      <div style={S.list}>
        <ToggleRow title="Set as default" sub="Use for rides, transfers and rentals" on={makeDefault} onChange={setMakeDefault} last />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className="dz-cta" disabled={busy} style={S.cta}><span>{busy ? 'Saving…' : 'Save card'}</span></button>
      <Note text="Test mode — card details aren’t charged. Only the last 4 digits and expiry are stored." />
    </form>
  );
}

function AddCard() {
  const { stripeKey } = useRidean();
  const next = safeNext(useSearchParams().get('next'));
  return (
    <Screen>
      <ScreenHead title="Add card" fallback={next} />
      {stripeKey ? <StripeAddCard stripeKey={stripeKey} next={next} /> : <SimulatedAddCard next={next} />}
    </Screen>
  );
}

export default function AddPaymentMethodPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<Skeleton h={260} />}>
        <AddCard />
      </Suspense>
    </RequireAuth>
  );
}
