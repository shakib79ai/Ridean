'use client';

import { useState, type FormEvent } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Appearance, type Stripe } from '@stripe/stripe-js';
import { ErrorNote } from '@/components/site/ui';

/** Stripe Payment Element confirm form (ported from the website's account kit) — used for wallet top-ups. */

const stripeCache = new Map<string, Promise<Stripe | null>>();
function getStripe(key: string) {
  let p = stripeCache.get(key);
  if (!p) {
    p = loadStripe(key);
    stripeCache.set(key, p);
  }
  return p;
}

const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#F6C428',
    colorBackground: '#071A14',
    colorText: '#F3EEDF',
    colorTextSecondary: '#9FB2A6',
    colorDanger: '#E5645A',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  rules: {
    '.Input': { border: '1px solid #1F4537', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid #D9A94F', boxShadow: 'none' },
    '.Label': { color: '#9FB2A6' },
  },
};

export function StripePayConfirm({ stripeKey, clientSecret, submitLabel, onDone, onCancel }: { stripeKey: string; clientSecret: string; submitLabel: string; onDone: () => void; onCancel?: () => void }) {
  return (
    <Elements stripe={getStripe(stripeKey)} options={{ clientSecret, appearance }}>
      <PayForm submitLabel={submitLabel} onDone={onDone} onCancel={onCancel} />
    </Elements>
  );
}

function PayForm({ submitLabel, onDone, onCancel }: { submitLabel: string; onDone: () => void; onCancel?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const r = await stripe.confirmPayment({ elements, redirect: 'if_required', confirmParams: { return_url: window.location.href } });
    setBusy(false);
    if (r.error) return setError(r.error.message ?? 'Your payment could not be confirmed.');
    onDone();
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
      <PaymentElement />
      {error && <ErrorNote>{error}</ErrorNote>}
      <div style={{ display: 'flex', gap: '10px' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 18px', height: '54px', borderRadius: '12px', border: '1px solid #1F4537', fontSize: '15px', color: '#F3EEDF' }}>
            Cancel
          </button>
        )}
        <button type="submit" className="dz-cta" disabled={busy || !stripe} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '54px', borderRadius: '12px', background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: '17px', fontWeight: 600 }}>
          {busy ? 'Please wait…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
