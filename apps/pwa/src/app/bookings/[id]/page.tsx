'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, use, useCallback, useEffect, useRef, useState } from 'react';
import { serviceLabel, type Booking, type BookingLiveStatus } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { ErrorNote, Skeleton, useToast } from '@/components/site/ui';
import {
  Avatar,
  CANCELLABLE_STATUSES,
  CancelConfirm,
  EDITABLE_STATUSES,
  Icon,
  LIVE_STATUSES,
  ListRow,
  PAID_STATUSES,
  RowChevron,
  ScreenHeader,
  StatusPill,
  errMsg,
  fmtTime,
  fmtWhen,
  iconBox,
  isUpcoming,
  money,
  outlineBtn,
  paidVia,
  serviceImage,
  telHref,
} from '@/components/trips/kit';

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth>
      <Suspense fallback={<Loading />}>
        <Details id={id} />
      </Suspense>
    </RequireAuth>
  );
}

function Loading() {
  return (
    <div style={{ paddingBottom: '24px' }}>
      <ScreenHeader title="Booking details" fallback="/trips" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        <Skeleton h={150} />
        <Skeleton h={170} />
        <Skeleton h={150} />
      </div>
    </div>
  );
}

const line = (strong?: boolean, color?: string) =>
  ({ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 0', fontSize: strong ? '15px' : '14px', color: color ?? (strong ? '#F3EEDF' : '#9FB2A6'), fontWeight: strong ? 600 : 400 }) as const;

function Details({ id }: { id: string }) {
  const { api } = useRidean();
  const toast = useToast();
  const isNew = useSearchParams().get('new') === '1';

  const [b, setB] = useState<Booking | null>(null);
  const [live, setLive] = useState<BookingLiveStatus | null>(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const loadBooking = useCallback(() => api.getBooking(id).then(setB), [api, id]);
  const loadStatus = useCallback(() => api.bookingStatus(id).then(setLive).catch(() => undefined), [api, id]);

  useEffect(() => {
    loadBooking().catch((e) => setError(errMsg(e, 'We couldn’t load this booking.')));
    loadStatus();
  }, [loadBooking, loadStatus]);

  // Reload the booking once whenever the live status moves on (it can run ahead of the stored one)
  const syncedStatus = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!b || !live || live.status === b.status || syncedStatus.current === live.status) return;
    syncedStatus.current = live.status;
    loadBooking().catch(() => undefined);
  }, [b, live, loadBooking]);

  // Poll while the trip is still moving
  const status = live?.status ?? b?.status;
  useEffect(() => {
    if (!status || !LIVE_STATUSES.includes(status)) return;
    const t = setInterval(loadStatus, 15_000);
    return () => clearInterval(t);
  }, [status, loadStatus]);

  async function cancel() {
    if (!b) return;
    setCancelling(true);
    setCancelError('');
    try {
      setB(await api.cancelBooking(b.id));
      setConfirming(false);
      toast('Booking cancelled');
      loadStatus();
    } catch (e) {
      setCancelError(errMsg(e));
    } finally {
      setCancelling(false);
    }
  }

  if (error && !b)
    return (
      <div style={{ paddingBottom: '24px' }}>
        <ScreenHeader title="Booking details" fallback="/trips" />
        <div style={{ padding: '0 20px' }}>
          <ErrorNote>{error}</ErrorNote>
        </div>
      </div>
    );
  if (!b) return <Loading />;

  const currency = b.price.currency;
  const st = b.status === 'cancelled' || b.status === 'failed' ? b.status : live?.status ?? b.status;
  const tip = b.tip ?? 0;
  const discount = b.discount ?? 0;
  const fare = b.price.customerPrice - tip + discount;
  const paid = PAID_STATUSES.includes(b.status);
  const via = paid ? paidVia(b) : undefined;
  const driver = live?.driver;
  const hasDriver = !!(driver && (driver.name || driver.phone));
  const pickupMs = b.pickupAt ? Date.parse(b.pickupAt) : NaN;
  const canEdit = EDITABLE_STATUSES.includes(b.status) && !Number.isNaN(pickupMs) && pickupMs - Date.now() > 60 * 60_000;
  const canCancel = CANCELLABLE_STATUSES.includes(b.status);
  const upcoming = isUpcoming({ ...b, status: st });
  const rent = b.service === 'rent';
  const airportPickup = !!b.pickup.iata;
  const airportDrop = !!b.dropoff?.iata || (b.service === 'airport_transfer' && !airportPickup);
  const driverMeta = [driver?.vehicle, driver?.plate].filter(Boolean).join(' · ');
  const totalLabel = paid ? (b.paymentMethod === 'supplier' ? `Total paid to ${b.supplierName}` : `Total paid${via ? ` · ${via}` : ''}`) : 'Total';

  return (
    <div style={{ paddingBottom: '24px' }}>
      <ScreenHeader title="Booking details" sub={`Ref. ${b.reference}`} fallback="/trips" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        {isNew && b.status !== 'failed' && b.status !== 'cancelled' && (
          <div role="status" style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(76,195,138,.12)', color: '#9FE3C0', fontSize: '14px' }}>
            Thank you — your booking {b.reference} is {['confirmed', 'driver_assigned', 'in_progress'].includes(b.status) ? 'confirmed' : 'being confirmed'}.
          </div>
        )}
        {b.status === 'failed' && <ErrorNote>{b.supplierName} could not confirm this booking. You have not been charged.</ErrorNote>}

        <div style={{ position: 'relative', height: '150px', borderRadius: '16px', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={serviceImage(b.service)} alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(180deg,rgba(7,26,20,.25) 0%,rgba(7,26,20,.15) 40%,#071A14 100%)' }}></div>
          <div style={{ position: 'absolute', left: '20px', right: '20px', bottom: '18px' }}>
            <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '30px', lineHeight: 1.08, color: '#F3EEDF' }}>{serviceLabel(b.service)}</h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#D7DED6' }}>{b.pickupAt ? fmtWhen(b.pickupAt) : 'As soon as possible'}</p>
          </div>
        </div>

        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <StatusPill status={st} />
            {b.flightNumber && <span style={{ fontSize: '12.5px', color: '#9FB2A6' }}>Flight {b.flightNumber}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: b.dropoff ? '1px solid #1F4537' : undefined }}>
            <div style={iconBox}>
              <Icon name={airportPickup ? 'plane' : 'pin'} />
            </div>
            <div style={{ flex: 1, minWidth: '0' }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF', overflowWrap: 'anywhere' }}>{b.pickup.address}</div>
              <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>
                {rent ? 'Pick-up' : 'Pickup'} · {b.pickupAt ? fmtTime(b.pickupAt) : 'As soon as possible'}
              </div>
            </div>
          </div>
          {b.dropoff && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px' }}>
              <div style={iconBox}>
                <Icon name={airportDrop ? 'plane' : 'pin'} />
              </div>
              <div style={{ flex: 1, minWidth: '0' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF', overflowWrap: 'anywhere' }}>{b.dropoff.address}</div>
                <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>
                  {rent ? 'Return' : 'Drop-off'}
                  {b.returnAt ? ` · ${fmtWhen(b.returnAt)}` : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        {upcoming && (
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
            <ListRow icon="route" href={`/bookings/${b.id}/status`} title="Track trip" sub="Trip status and chauffeur details" right={<RowChevron />} last />
          </div>
        )}

        {hasDriver && driver && (
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar name={driver.name} size={44} />
              <div style={{ flex: 1, minWidth: '0' }}>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{driver.name ?? 'Your chauffeur'}</div>
                {(driverMeta || driver.rating != null) && (
                  <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px', overflowWrap: 'anywhere' }}>
                    {[driver.rating != null ? `★ ${driver.rating.toFixed(2)}` : '', driverMeta].filter(Boolean).join(' · ')}
                  </div>
                )}
                {driver.phone && <div style={{ fontSize: '12.5px', color: '#C9D2CB', marginTop: '2px' }}>{driver.phone}</div>}
              </div>
              {driver.phone && (
                <a href={telHref(driver.phone)} aria-label={`Call ${driver.name ?? 'your chauffeur'}`} style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="phone" />
                </a>
              )}
              {live?.messaging && (
                <Link href={`/bookings/${b.id}/chauffeur`} aria-label="Message chauffeur" style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="message" />
                </Link>
              )}
            </div>
          </div>
        )}

        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
          <div style={line()}>
            <span>Fare</span>
            <span>{money(fare, currency)}</span>
          </div>
          {discount > 0 && (
            <div style={line(false, '#4CC38A')}>
              <span>Promo{b.promoCode ? ` · ${b.promoCode}` : ''}</span>
              <span>−{money(discount, currency)}</span>
            </div>
          )}
          {tip > 0 && (
            <div style={line()}>
              <span>Tip</span>
              <span>{money(tip, currency)}</span>
            </div>
          )}
          <div style={{ height: '1px', background: '#1F4537', margin: '6px 0' }}></div>
          <div style={line(true)}>
            <span>{totalLabel}</span>
            <span>{money(b.price.customerPrice, currency)}</span>
          </div>
        </div>

        {(canEdit || paid) && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {canEdit && (
              <Link href={`/bookings/${b.id}/edit`} style={outlineBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M4 20h4L19 9l-4-4L4 16z" />
                  <path d="M13.5 6.5l4 4" />
                </svg>
                Edit booking
              </Link>
            )}
            {paid && (
              <Link href={`/account/invoices/${b.id}`} style={outlineBtn}>
                <Icon name="doc" />
                Invoice
              </Link>
            )}
          </div>
        )}

        {canCancel &&
          (confirming ? (
            <CancelConfirm title="Cancel this booking?" busy={cancelling} error={cancelError} onKeep={() => { setConfirming(false); setCancelError(''); }} onConfirm={cancel} />
          ) : (
            <button type="button" onClick={() => setConfirming(true)} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', fontSize: '14.5px', fontWeight: 600, color: '#E5645A', padding: '6px' }}>
              Cancel booking
            </button>
          ))}
      </div>
    </div>
  );
}
