import { Suspense } from 'react';
import { BookingDetail, RequireAuth } from '@ridean/web-core';
import { BackButton } from '@/components/BackButton';

export const metadata = { title: 'Booking' };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="rd-stack">
      <BackButton label="Trips" />
      <RequireAuth>
        <Suspense fallback={<div className="rd-skeleton" style={{ height: 300 }} />}>
          <BookingDetail id={id} />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
