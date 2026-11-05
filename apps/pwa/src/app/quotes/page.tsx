import { Suspense } from 'react';
import { QuoteResults } from '@ridean/web-core';
import { BackButton } from '@/components/BackButton';

export const metadata = { title: 'Choose your ride' };

export default function QuotesPage() {
  return (
    <div className="rd-stack">
      <BackButton />
      <h1 className="app-title">Choose your ride</h1>
      <Suspense fallback={<div className="rd-skeleton" style={{ height: 300 }} />}>
        <QuoteResults />
      </Suspense>
    </div>
  );
}
