'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { formatMoney, serviceLabel, type Booking, type BookingLiveStatus } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { C, ErrorNote, Skeleton, useToast } from '@/components/site/ui';
import {
  Avatar,
  CANCELLABLE_STATUSES,
  Divider,
  EDITABLE_STATUSES,
  H1,
  H2,
  IconPin,
  IconPlane,
  LIVE_STATUSES,
  PAID_STATUSES,
  Panel,
  PriceLine,
  StatusPill,
  fmtDay,
  fmtTime,
  paidWith,
  serviceImage,
  statusColor,
  statusLabel,
} from '@/components/checkout/parts';

const outlineBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, border: `1px solid ${C.gold}`, color: C.gold, fontSize: 14.5, fontWeight: 600, minWidth: 0, padding: '0 10px', boxSizing: 'border-box' } as const;

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="dz-container">
      <RequireAuth>
        <Suspense fallback={<Loading />}>
          <Details id={id} />
        </Suspense>
      </RequireAuth>
    </div>
  );
}

function Loading() {
  return (
    <div className="dz-main-aside">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <Skeleton h={24} style={{ width: 260 }} />
        <Skeleton h={44} style={{ maxWidth: 520 }} />
        <Skeleton h={240} />
        <Skeleton h={150} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Skeleton h={260} />
        <Skeleton h={200} />
      </div>
    </div>
  );
}

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
    loadBooking().catch((e: Error) => setError(e.message));
    loadStatus();
  }, [loadBooking, loadStatus]);

  // Reload the booking once whenever the live status moves on (the live status can run ahead of the stored one)
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
      setCancelError((e as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  if (error && !b) return <ErrorNote>{error}</ErrorNote>;
  if (!b) return <Loading />;

  const currency = b.price.currency;
  // The live status (from the partner) can be ahead of the stored one — show the freshest
  const st = b.status === 'cancelled' || b.status === 'failed' ? b.status : live?.status ?? b.status;
  const tip = b.tip ?? 0;
  const discount = b.discount ?? 0;
  const fare = b.price.customerPrice - tip + discount;
  const paid = PAID_STATUSES.includes(b.status);
  const paidLine = paid ? paidWith(b) : undefined;
  const driver = live?.driver;
  const hasDriver = !!(driver && (driver.name || driver.phone));
  const pickupMs = b.pickupAt ? Date.parse(b.pickupAt) : NaN;
  const canEdit = EDITABLE_STATUSES.includes(b.status) && !Number.isNaN(pickupMs) && pickupMs - Date.now() > 60 * 60_000;
  const canCancel = CANCELLABLE_STATUSES.includes(b.status);
  const rent = b.service === 'rent';
  const airportPickup = !!b.pickup.iata;
  const airportDrop = !!b.dropoff?.iata || (b.service === 'airport_transfer' && !airportPickup);
  const flightOnPickup = !!b.flightNumber && (airportPickup || !b.dropoff);
  const driverMeta = [driver?.vehicle, driver?.plate].filter(Boolean).join(' · ');
  const tripState =
    st === 'cancelled' || st === 'failed' ? statusLabel(st) : st === 'completed' ? 'Completed' : st === 'pending_payment' ? 'Awaiting payment' : 'Active';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {isNew && b.status !== 'failed' && b.status !== 'cancelled' && (
        <div role="status" style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(76,195,138,.12)', color: '#9FE3C0', fontSize: 14 }}>
          Thank you — your booking {b.reference} is {['confirmed', 'driver_assigned', 'in_progress'].includes(b.status) ? 'confirmed' : 'being confirmed'}.
        </div>
      )}
      {b.status === 'failed' && <ErrorNote>{b.supplierName} could not confirm this booking. You have not been charged.</ErrorNote>}

      <div className="dz-main-aside">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <StatusPill status={st} />
            <span style={{ fontSize: 13.5, color: C.muted }}>
              Ref. {b.reference}
              {paidLine ? ` · ${paidLine}` : ''}
            </span>
          </div>
          <H1>
            {serviceLabel(b.service)} · {b.pickupAt ? fmtDay(b.pickupAt) : 'As soon as possible'}
          </H1>
          <div style={{ position: 'relative', height: 240, borderRadius: 18, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={serviceImage(b.service)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }} />
          </div>

          <Panel padding={18}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px', borderBottom: b.dropoff ? `1px solid ${C.line}` : undefined }}>
              <RowIcon>{airportPickup ? <IconPlane c={C.gold} size={18} /> : <IconPin c={C.gold} size={18} />}</RowIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: C.cream, overflowWrap: 'anywhere' }}>
                  {b.pickup.address}
                  {flightOnPickup ? ` · Flight ${b.flightNumber}` : ''}
                </div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                  {rent ? 'Pick-up' : 'Pickup'} · {b.pickupAt ? fmtTime(b.pickupAt) : 'As soon as possible'}
                </div>
              </div>
            </div>
            {b.dropoff && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px' }}>
                <RowIcon>{airportDrop ? <IconPlane c={C.gold} size={18} /> : <IconPin c={C.gold} size={18} />}</RowIcon>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.cream, overflowWrap: 'anywhere' }}>
                    {b.dropoff.address}
                    {b.flightNumber && !flightOnPickup ? ` · Flight ${b.flightNumber}` : ''}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                    {rent ? 'Return' : 'Drop-off'}
                    {b.returnAt ? ` · ${fmtDay(b.returnAt)}, ${fmtTime(b.returnAt)}` : ''}
                  </div>
                </div>
              </div>
            )}
          </Panel>

          {hasDriver && driver && (
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <Avatar name={driver.name} />
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{driver.name ?? 'Your chauffeur'}</div>
                  {(driver.rating != null || driverMeta) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: C.muted, marginTop: 3 }}>
                      {driver.rating != null && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F6C428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z" />
                        </svg>
                      )}
                      {[driver.rating != null ? driver.rating.toFixed(2) : '', driverMeta].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {driver.phone && <div style={{ fontSize: 13.5, color: C.soft, marginTop: 3 }}>{driver.phone}</div>}
                </div>
                {(driver.phone || live?.messaging) && (
                  <div style={{ display: 'flex', gap: 10, width: 300, maxWidth: '100%' }}>
                    {driver.phone && (
                      <a href={`tel:${driver.phone.replace(/[^\d+]/g, '')}`} style={outlineBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                          <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                        </svg>
                        Call
                      </a>
                    )}
                    {live?.messaging && (
                      <Link href={`/bookings/${b.id}/chauffeur`} style={outlineBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                          <path d="M4 5h16v11H9l-5 4z" />
                        </svg>
                        Message
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0, position: 'sticky', top: 20, alignSelf: 'start' }}>
          <Panel padding={22}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <H2>Trip status</H2>
              <div style={{ fontSize: 13, color: C.muted }}>
                Status · <span style={{ color: statusColor(st) }}>{tripState}</span>
              </div>
              {live ? (
                live.events.map((ev) => {
                  const nextUp = live.events.find((x) => !x.done && ['on_the_way', 'arrived', 'in_progress'].includes(x.key));
                  const eta = nextUp === ev && live.etaMinutes != null ? `ETA ${fmtTime(new Date(Date.now() + live.etaMinutes * 60_000).toISOString())}` : '';
                  return (
                    <div key={ev.key} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 12, background: ev.done ? (ev.key === 'cancelled' ? C.bad : C.yellow) : C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {ev.done && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A1F18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, fontSize: 15, color: ev.done ? C.cream : C.muted }}>{ev.label}</div>
                      <div style={{ fontSize: 13, color: C.muted }}>{ev.done && ev.at ? fmtTime(ev.at) : eta}</div>
                    </div>
                  );
                })
              ) : (
                <Skeleton h={120} />
              )}
            </div>
          </Panel>

          <Panel padding={22}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
              <H2>Payment</H2>
              <PriceLine label="Fare" value={formatMoney(fare, currency)} />
              {discount > 0 && <PriceLine label={`Promo${b.promoCode ? ` · ${b.promoCode}` : ''}`} value={`−${formatMoney(discount, currency)}`} color={C.ok} />}
              {tip > 0 && <PriceLine label="Tip" value={formatMoney(tip, currency)} />}
              <Divider />
              <PriceLine label={paid ? (b.paymentMethod === 'supplier' ? `Total (paid to ${b.supplierName})` : 'Total paid') : 'Total'} value={formatMoney(b.price.customerPrice, currency)} strong />
            </div>
          </Panel>

          {(canEdit || paid) && (
            <div style={{ display: 'flex', gap: 10 }}>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M6 3h8l4 4v14H6z" />
                    <path d="M14 3v4h4M9 12h6M9 16h6" />
                  </svg>
                  Invoice
                </Link>
              )}
            </div>
          )}

          {canCancel &&
            (confirming ? (
              <div role="alertdialog" aria-label="Cancel this booking?" style={{ border: `1px solid ${C.bad}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Cancel this booking?</div>
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>Refunds follow the cancellation policy you accepted when booking.</div>
                {cancelError && <ErrorNote>{cancelError}</ErrorNote>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setConfirming(false)} disabled={cancelling} style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', height: 44, lineHeight: '44px', borderRadius: 12, border: `1px solid ${C.line}`, color: C.cream, fontSize: 14.5, fontWeight: 600 }}>
                    Keep booking
                  </button>
                  <button type="button" onClick={cancel} disabled={cancelling} style={{ all: 'unset', cursor: cancelling ? 'wait' : 'pointer', flex: 1, textAlign: 'center', height: 44, lineHeight: '44px', borderRadius: 12, background: C.bad, color: '#0A1F18', fontSize: 14.5, fontWeight: 600, opacity: cancelling ? 0.7 : 1 }}>
                    {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', height: 48, lineHeight: '48px', borderRadius: 12, border: `1px solid ${C.bad}`, color: C.bad, fontSize: 15, fontWeight: 600 }}>
                Cancel booking
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function RowIcon({ children }: { children: ReactNode }) {
  return <div style={{ width: 38, height: 38, borderRadius: 11, background: C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{children}</div>;
}
