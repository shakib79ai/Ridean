import { loadStripe, type Stripe } from '@stripe/stripe-js';

const cache = new Map<string, Promise<Stripe | null>>();

/** Loads Stripe.js once per publishable key. */
export function getStripe(key: string): Promise<Stripe | null> {
  let p = cache.get(key);
  if (!p) {
    p = loadStripe(key);
    cache.set(key, p);
  }
  return p;
}

export const stripeAppearance = {
  theme: 'night' as const,
  variables: { colorPrimary: '#D9A94F', colorBackground: '#071A14', colorText: '#F3EEDF', borderRadius: '12px', fontFamily: 'Inter, sans-serif' },
};
