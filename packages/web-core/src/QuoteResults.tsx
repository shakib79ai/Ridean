'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { serviceLabel, type Quote } from '@ridean/shared';
import { useRidean } from './api-context';
import { IconBag, IconCheck, IconClock, IconUser } from './icons';
import { decodeSearch } from './search-params';
import { Empty, formatWhen, money } from './ui';

/** Reads ?s= (encoded search), asks the API for quotes from every supplier and lists them. */
export function QuoteResults({ checkoutPath = '/checkout', newSearchPath = '/' }: { checkoutPath?: string; newSearchPath?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const { api } = useRidean();
  const req = decodeSearch(params.get('s'));
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [errors, setErrors] = useState<{ supplier: string; message: string }[]>([]);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<'price' | 'class'>('price');

  useEffect(() => {
    if (!req) return;
    let alive = true;
    setQuotes(null);
    setError('');
    api
      .searchQuotes(req)
      .then((r) => {
        if (!alive) return;
        setQuotes(r.quotes);
        setErrors(r.errors);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('s')]);

  if (!req) return <Empty title="Start a search" text="Tell us where and when to see prices." action={<a className="rd-btn" href={newSearchPath}>New search</a>} />;

  const sorted = [...(quotes ?? [])].sort((a, b) => (sort === 'price' ? a.price.customerPrice - b.price.customerPrice : b.vehicle.passengers - a.vehicle.passengers));

  return (
    <div className="rd-stack" style={{ ['--gap' as string]: '16px' }}>
      <div className="rd-card rd-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="rd-stack" style={{ ['--gap' as string]: '4px' }}>
          <span className="rd-eyebrow">{serviceLabel(req.service)}{req.tripType === 'return' ? ' · Return' : ''}</span>
          <strong style={{ fontSize: 16 }}>{req.pickup.address}{req.dropoff ? ` → ${req.dropoff.address}` : ''}</strong>
          <span className="rd-muted" style={{ fontSize: 13.5 }}>
            {req.service === 'rent' ? `${formatWhen(req.rentalPickupAt)} – ${formatWhen(req.rentalReturnAt)}` : formatWhen(req.pickupAt)}
            {req.hours ? ` · ${req.hours} hours` : ''}
          </span>
        </div>
        <button className="rd-btn rd-btn-ghost" style={{ height: 42 }} onClick={() => router.push(newSearchPath)}>Change search</button>
      </div>

      {error && <div className="rd-alert">{error}</div>}
      {!quotes && !error && [0, 1, 2].map((i) => <div key={i} className="rd-skeleton" style={{ height: 120 }} />)}
      {quotes && quotes.length === 0 && <Empty title="No cars available" text="No supplier has availability for this search. Try another time or place." />}

      {quotes && quotes.length > 0 && (
        <>
          <div className="rd-row" style={{ justifyContent: 'space-between' }}>
            <span className="rd-muted" style={{ fontSize: 14 }}>{quotes.length} {quotes.length === 1 ? 'option' : 'options'} from {new Set(quotes.map((q) => q.supplierName)).size} {new Set(quotes.map((q) => q.supplierName)).size === 1 ? 'supplier' : 'suppliers'}</span>
            <div className="rd-row" style={{ ['--gap' as string]: '8px' }}>
              <button className="rd-chip" aria-pressed={sort === 'price'} onClick={() => setSort('price')}>Lowest price</button>
              <button className="rd-chip" aria-pressed={sort === 'class'} onClick={() => setSort('class')}>Most space</button>
            </div>
          </div>
          {sorted.map((q) => (
            <article key={q.id} className="rd-card rd-quote">
              <div className="rd-stack" style={{ ['--gap' as string]: '8px' }}>
                <div className="rd-row" style={{ flexWrap: 'wrap' }}>
                  <h3 className="rd-display" style={{ fontSize: 22 }}>{q.vehicle.name}</h3>
                  <span className="rd-pill rd-pill-info">{q.supplierName}</span>
                </div>
                <div className="rd-row rd-muted" style={{ fontSize: 13.5, flexWrap: 'wrap', ['--gap' as string]: '14px' }}>
                  <span className="rd-row" style={{ ['--gap' as string]: '6px' }}><IconUser size={15} />{q.vehicle.passengers} passengers</span>
                  <span className="rd-row" style={{ ['--gap' as string]: '6px' }}><IconBag size={15} />{q.vehicle.bags} bags</span>
                  {q.etaMinutes !== undefined && <span className="rd-row" style={{ ['--gap' as string]: '6px' }}><IconClock size={15} />{q.etaMinutes} min away</span>}
                  {q.durationMinutes !== undefined && <span>{q.durationMinutes} min trip</span>}
                </div>
                <div className="rd-row" style={{ flexWrap: 'wrap', ['--gap' as string]: '12px', fontSize: 13 }}>
                  {q.inclusions.map((i) => <span key={i} className="rd-row" style={{ ['--gap' as string]: '5px', color: '#c9d2cb' }}><IconCheck size={14} style={{ color: 'var(--ok)' }} />{i}</span>)}
                </div>
                <span className="rd-muted" style={{ fontSize: 12.5 }}>{q.cancellation}</span>
              </div>
              <div className="rd-stack" style={{ alignItems: 'flex-end', ['--gap' as string]: '8px' }}>
                <span className="rd-price">{money(q.price.customerPrice, q.price.currency)}</span>
                <span className="rd-muted" style={{ fontSize: 12 }}>Total · taxes and fees included</span>
                <button className="rd-btn" onClick={() => router.push(`${checkoutPath}/${q.id}`)}>Select</button>
              </div>
            </article>
          ))}
          {errors.length > 0 && <p className="rd-muted" style={{ fontSize: 12.5 }}>Some suppliers did not respond in time: {errors.map((e) => e.supplier).join(', ')}.</p>}
        </>
      )}
    </div>
  );
}
