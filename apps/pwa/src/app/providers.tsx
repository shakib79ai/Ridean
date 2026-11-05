'use client';

import type { ReactNode } from 'react';
import { ApiProvider } from '@ridean/web-core';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApiProvider baseUrl={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'} stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}>
      {children}
    </ApiProvider>
  );
}
