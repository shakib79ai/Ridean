import { Suspense } from 'react';
import { QuoteResults } from '@ridean/web-core';

export const metadata = { title: 'Choose your ride' };

export default function QuotesPage() {
  return (
    <div className="rd-container" style={{ maxWidth: 960 }}>
      <div className="page-head"><h1 className="rd-display">Choose your ride</h1></div>
      <Suspense fallback={<div className="rd-skeleton" style={{ height: 300 }} />}>
        <QuoteResults />
      </Suspense>
    </div>
  );
}
