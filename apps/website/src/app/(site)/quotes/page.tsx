'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { SERVICES, type CoreServiceKey } from '@ridean/shared';
import { decodeSearch } from '@ridean/web-core';
import { Skeleton } from '@/components/site/ui';

/** Old results URL (the home search posts here): forwards to the matching service page, keeping ?s=. */
export default function QuotesPage() {
  return (
    <Suspense fallback={null}>
      <QuotesRedirect />
    </Suspense>
  );
}

function QuotesRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const s = params.get('s');

  useEffect(() => {
    const req = decodeSearch(s);
    const def = req ? SERVICES[req.service as CoreServiceKey] : undefined;
    if (!req || !def) {
      router.replace('/ride');
      return;
    }
    router.replace(`/${def.slug}?s=${s}`);
  }, [router, s]);

  return (
    <div className="dz-container" style={{ paddingBottom: 64 }}>
      <Skeleton h={300} />
    </div>
  );
}
