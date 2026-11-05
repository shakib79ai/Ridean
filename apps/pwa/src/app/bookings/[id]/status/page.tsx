'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import type { Booking, BookingLiveStatus, BookingStatus } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { ErrorNote, Skeleton, useToast } from '@/components/site/ui';
import {
  Avatar,
  CANCELLABLE_STATUSES,
  CancelConfirm,
  Icon,
  LIVE_STATUSES,
  ScreenHeader,
  errMsg,
  fmtTime,
  fmtWhen,
  outlineBtn,
  statusColor,
  telHref,
  vehicleTitle,
} from '@/components/trips/kit';

export default function TripStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth>
      <Status id={id} />
    </RequireAuth>
  );
}

function headline(status: BookingStatus, live: BookingLiveStatus | null) {
  switch (status) {
    case 'pending_payment':
      return 'Awaiting payment';
    case 'payment_authorised':
      return 'Confirming your booking';
    case 'confirmed':
      return 'Booking confirmed';
    case 'driver_assigned':
      return live?.etaMinutes != null ? 'Your chauffeur is on the way' : 'Chauffeur assigned';
    case 'in_progress':
      return 'Trip in progress';
    case 'completed':
      return 'Trip complete';
    case 'cancelled':
      return 'Booking cancelled';
    case 'failed':
      return 'Booking not confirmed';
    default:
      return 'Trip status';
  }
}

function stateLabel(status: BookingStatus) {
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'failed') return 'Not confirmed';
  if (status === 'completed') return 'Completed';
  if (status === 'pending_payment') return 'Awaiting payment';
  return 'Active';
}

/** Decorative street-map illustration — not live tracking. */
function MapArt() {
  return (
    <div style={{ position: 'relative', height: '230px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1F4537', background: '#0A2019' }}>
      <svg width="100%" height="100%" viewBox="0 0 350 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="350" height="230" fill="#0A2019" />
        <g stroke="#143A2E" strokeWidth="10" fill="none">
          <path d="M-10 69 L360 51" />
          <path d="M-10 172 L360 196" />
          <path d="M90 -10 L120 240" />
          <path d="M250 -10 L230 240" />
        </g>
        <g stroke="#10302A" strokeWidth="5" fill="none">
          <path d="M-10 120 L360 115" />
          <path d="M170 -10 L180 240" />
          <path d="M310 -10 L300 240" />
          <path d="M30 -10 L50 240" />
        </g>
        <rect x="135" y="133" width="40" height="28" rx="4" fill="#123A2A" />
        <rect x="190" y="23" width="36" height="34" rx="4" fill="#123A2A" />
        <path d="M70 166 C 140 156, 150 97, 200 83 S 270 55, 285 46" stroke="#D9A94F" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="70" cy="166" r="8" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
        <circle cx="285" cy="46" r="9" fill="#F6C428" />
        <circle cx="285" cy="46" r="3.5" fill="#071A14" />
      </svg>
    </div>
  );
}

function Status({ id }: { id: string }) {
  const { api } = useRidean();
  const toast = useToast();
  const [b, setB] = useState<Booking | null>(null);
  const [live, setLive] = useState<BookingLiveStatus | null>(null);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const loadStatus = useCallback(
    () =>
      api
        .bookingStatus(id)
        .then((s) => {
          setLive(s);
          setStatusError('');
        })
        .catch((e) => setStatusError(errMsg(e, 'We couldn’t refresh the trip status.'))),
    [api, id],
  );

  useEffect(() => {
    api
      .getBooking(id)
      .then(setB)
      .catch((e) => setError(errMsg(e, 'We couldn’t load this booking.')));
    loadStatus();
  }, [api, id, loadStatus]);

  const status: BookingStatus | undefined = b && (b.status === 'cancelled' || b.status === 'failed') ? b.status : live?.status ?? b?.status;

  // Poll every 15s while the trip is still moving
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

  const fallback = `/bookings/${id}`;

  if (error && !b)
    return (
      <div style={{ paddingBottom: '24px' }}>
        <ScreenHeader title="Trip status" fallback={fallback} />
        <div style={{ padding: '0 20px' }}>
          <ErrorNote>{error}</ErrorNote>
        </div>
      </div>
    );

  if (!b || !status || (!live && !statusError)) {
    return (
      <div style={{ paddingBottom: '24px' }}>
        <ScreenHeader title="Trip status" fallback={fallback} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
          <MapArt />
          <Skeleton h={130} />
          <Skeleton h={180} />
        </div>
      </div>
    );
  }

  const driver = live?.driver;
  const hasDriver = !!(driver && (driver.name || driver.phone));
  const vehicleName = driver?.vehicle || b.vehicle?.name;
  const canCancel = CANCELLABLE_STATUSES.includes(b.status) && CANCELLABLE_STATUSES.includes(status);
  const title = headline(status, live);

  async function share() {
    if (!b) return;
    const lines = [
      `Ridean trip ${b.reference}`,
      `Pickup: ${b.pickup.address}`,
      `Time: ${b.pickupAt ? fmtWhen(b.pickupAt) : 'As soon as possible'}`,
      vehicleName ? `Vehicle: ${vehicleName}` : '',
      driver?.plate ? `Plate: ${driver.plate}` : '',
      driver?.name ? `Chauffeur: ${driver.name}` : '',
    ].filter(Boolean);
    const text = lines.join('\n');
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `Ridean trip ${b.reference}`, text, url });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
        // fall through to the clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Trip details copied');
    } catch {
      toast('Couldn’t copy the trip details');
    }
  }

  // Next step still to happen gets the ETA, like the website
  const nextUp = live?.events.find((x) => !x.done && ['on_the_way', 'arrived', 'in_progress'].includes(x.key));

  return (
    <div style={{ paddingBottom: '24px' }}>
      <ScreenHeader title={title} sub={`Ref. ${b.reference}`} fallback={fallback} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        <MapArt />

        {hasDriver && driver ? (
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar name={driver.name} size={52} />
              <div style={{ flex: 1, minWidth: '0' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, overflowWrap: 'anywhere' }}>{driver.name ?? 'Your chauffeur'}</div>
                {driver.rating != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#9FB2A6', marginTop: '3px' }}>
                    <Icon name="star" size={13} color="#F6C428" />
                    {driver.rating.toFixed(2)}
                  </div>
                )}
                {driver.phone && <div style={{ fontSize: '12.5px', color: '#C9D2CB', marginTop: '3px' }}>{driver.phone}</div>}
              </div>
              {live?.etaMinutes != null && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 600, color: '#F6C428', whiteSpace: 'nowrap' }}>{live.etaMinutes} min</div>
                  <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>away</div>
                </div>
              )}
            </div>
            {(vehicleName || driver.plate) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #1F4537' }}>
                <div style={{ minWidth: 0 }}>
                  {vehicleName && <div style={{ fontSize: '14.5px', overflowWrap: 'anywhere' }}>{vehicleName}</div>}
                  <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>{vehicleTitle(b.vehicle)}</div>
                </div>
                {driver.plate && <div style={{ padding: '6px 12px', borderRadius: '8px', background: '#F3EEDF', color: '#0A1F18', fontWeight: 700, fontSize: '14px', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{driver.plate}</div>}
              </div>
            )}
          </div>
        ) : (
          LIVE_STATUSES.includes(status) && (
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px', fontSize: '14px', color: '#C9D2CB', lineHeight: 1.5 }}>
              Your chauffeur’s details will appear here once {b.supplierName} assigns one.
            </div>
          )
        )}

        {hasDriver && driver && (driver.phone || live?.messaging) && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {driver.phone && (
              <a href={telHref(driver.phone)} aria-label={`Call ${driver.phone}`} style={outlineBtn}>
                <Icon name="phone" />
                Call
              </a>
            )}
            {live?.messaging && (
              <Link href={`/bookings/${b.id}/chauffeur`} style={outlineBtn}>
                <Icon name="message" />
                Message
              </Link>
            )}
          </div>
        )}

        {statusError && <ErrorNote>{statusError}</ErrorNote>}

        {live && (
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#9FB2A6', marginBottom: '4px' }}>
              Trip status · <span style={{ color: statusColor(status) }}>{stateLabel(status)}</span>
            </div>
            {live.events.map((ev) => {
              const eta = nextUp === ev && live.etaMinutes != null ? `ETA ${fmtTime(new Date(Date.now() + live.etaMinutes * 60_000).toISOString())}` : '';
              return (
                <div key={ev.key} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '7px 0' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '11px', background: ev.done ? (ev.key === 'cancelled' ? '#E5645A' : '#F6C428') : '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {ev.done && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A1F18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, fontSize: '14.5px', color: ev.done ? '#F3EEDF' : '#9FB2A6' }}>{ev.label}</div>
                  <div style={{ fontSize: '12.5px', color: '#9FB2A6' }}>{ev.done && ev.at ? fmtTime(ev.at) : eta}</div>
                </div>
              );
            })}
          </div>
        )}

        {confirming && canCancel ? (
          <CancelConfirm title="Cancel this trip?" busy={cancelling} error={cancelError} onKeep={() => { setConfirming(false); setCancelError(''); }} onConfirm={cancel} />
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={share} className="dz-btn-reset" style={outlineBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M4 12l16-8-6 16-2.5-6.5z" />
              </svg>
              Share trip
            </button>
            {canCancel && (
              <button type="button" onClick={() => setConfirming(true)} style={{ all: 'unset', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', borderRadius: '12px', border: '1px solid #E5645A', color: '#E5645A', fontSize: '14.5px', fontWeight: 600 }}>
                Cancel trip
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
