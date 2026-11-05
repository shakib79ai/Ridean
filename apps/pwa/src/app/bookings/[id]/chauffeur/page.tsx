'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Booking, BookingLiveStatus, BookingMessage } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { ErrorNote, Skeleton } from '@/components/site/ui';
import { Icon, ScreenHeader, errMsg, fmtTime, telHref } from '@/components/trips/kit';

const QUICK_REPLIES = ['I’m outside', 'Running 5 min late', 'Please call me'];

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return `Today ${fmtTime(iso)}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${fmtTime(iso)}`;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} ${fmtTime(iso)}`;
}

export default function ContactDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth>
      <Chat id={id} />
    </RequireAuth>
  );
}

function Chat({ id }: { id: string }) {
  const { api } = useRidean();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [live, setLive] = useState<BookingLiveStatus | null>(null);
  const [messages, setMessages] = useState<BookingMessage[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [msgError, setMsgError] = useState('');
  const [sendError, setSendError] = useState('');
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    () =>
      api
        .bookingMessages(id)
        .then((m) => {
          setMessages((prev) => {
            // keep optimistic messages the server hasn't returned yet
            const pending = (prev ?? []).filter((p) => p.id.startsWith('tmp-'));
            return [...m, ...pending];
          });
          setMsgError('');
        })
        .catch((e) => setMsgError(errMsg(e, 'We couldn’t load your messages.'))),
    [api, id],
  );

  useEffect(() => {
    Promise.all([api.getBooking(id), api.bookingStatus(id)])
      .then(([b, s]) => {
        setBooking(b);
        setLive(s);
        if (s.messaging) loadMessages();
      })
      .catch((e) => setLoadError(errMsg(e, 'We couldn’t load this trip.')));
  }, [api, id, loadMessages]);

  // Poll the thread every 10s while messaging is available
  useEffect(() => {
    if (!live?.messaging) return;
    const t = setInterval(loadMessages, 10_000);
    return () => clearInterval(t);
  }, [live?.messaging, loadMessages]);

  // Keep the newest message in view
  const count = messages?.length ?? 0;
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  async function send(body: string) {
    const msg = body.trim();
    if (!msg) return;
    setSendError('');
    const tmp: BookingMessage = { id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`, sender: 'customer', body: msg, createdAt: new Date().toISOString() };
    setMessages((m) => [...(m ?? []), tmp]);
    try {
      const saved = await api.sendBookingMessage(id, msg);
      setMessages((m) => (m ?? []).map((x) => (x.id === tmp.id ? saved : x)).filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i));
    } catch (e) {
      setMessages((m) => (m ?? []).filter((x) => x.id !== tmp.id));
      setSendError(errMsg(e, 'Your message wasn’t sent. Please try again.'));
      setText((t) => t || msg);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = text;
    setText('');
    send(msg);
  }

  const fallback = `/bookings/${id}`;

  if (loadError)
    return (
      <div style={{ paddingBottom: '24px' }}>
        <ScreenHeader title="Your chauffeur" fallback={fallback} />
        <div style={{ padding: '0 20px' }}>
          <ErrorNote>{loadError}</ErrorNote>
        </div>
      </div>
    );

  if (!booking || !live)
    return (
      <div style={{ paddingBottom: '24px' }}>
        <ScreenHeader title="Your chauffeur" fallback={fallback} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
          <Skeleton h={360} />
          <Skeleton h={50} />
        </div>
      </div>
    );

  const driver = live.driver;
  const firstName = driver?.name?.split(/\s+/)[0];
  const sub = driver?.name
    ? [driver.vehicle, live.etaMinutes != null ? `${live.etaMinutes} min away` : ''].filter(Boolean).join(' · ') || driver.phone
    : 'Not assigned yet';

  const call = driver?.phone ? (
    <a href={telHref(driver.phone)} aria-label={`Call ${driver.phone}`} style={{ width: '42px', height: '42px', borderRadius: '21px', background: 'linear-gradient(180deg,#FFD43B,#F2B705)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="phone" size={19} color="#0A1F18" />
    </a>
  ) : undefined;

  return (
    <div style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
      <ScreenHeader title={driver?.name ?? 'Your chauffeur'} sub={sub} fallback={fallback} trailing={call} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        {!live.messaging ? (
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '15px', color: '#F3EEDF', lineHeight: 1.5 }}>Messaging isn’t available for this trip — call your chauffeur.</div>
            {driver?.phone ? (
              <a href={telHref(driver.phone)} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '48px', padding: '0 18px', borderRadius: '12px', border: '1px solid #D9A94F', color: '#D9A94F', fontSize: '14.5px', fontWeight: 600 }}>
                <Icon name="phone" />
                Call {driver.phone}
              </a>
            ) : (
              <div style={{ fontSize: '13.5px', color: '#9FB2A6', lineHeight: 1.5 }}>
                Your chauffeur’s number will appear here once one is assigned. Need help now? <Link href="/help" style={{ color: '#D9A94F' }}>Get support</Link>.
              </div>
            )}
            <Link href={`/bookings/${booking.id}`} style={{ fontSize: '14px', color: '#9FB2A6' }}>
              Back to booking
            </Link>
          </div>
        ) : (
          <>
            <div ref={listRef} aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: 'max(260px, min(430px, calc(100dvh - 300px)))', overflowY: 'auto', padding: '4px 0' }}>
              {messages === null && !msgError && <Skeleton h={56} style={{ width: '60%' }} />}
              {msgError && messages === null && <ErrorNote>{msgError}</ErrorNote>}
              {messages && messages.length === 0 && (
                <div style={{ alignSelf: 'center', margin: 'auto 0', fontSize: '13.5px', color: '#9FB2A6', textAlign: 'center' }}>No messages yet. Send a note or use a quick reply below.</div>
              )}
              {messages?.map((m, i) => {
                const prev = messages[i - 1];
                const showDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                const mine = m.sender === 'customer';
                return (
                  <div key={m.id} style={{ display: 'contents' }}>
                    {showDay && <div style={{ alignSelf: 'center', fontSize: '11.5px', color: '#9FB2A6' }}>{dayLabel(m.createdAt)}</div>}
                    {m.sender === 'system' ? (
                      <div style={{ alignSelf: 'center', maxWidth: '85%', fontSize: '12px', color: '#9FB2A6', textAlign: 'center' }}>{m.body}</div>
                    ) : (
                      <div
                        title={fmtTime(m.createdAt)}
                        style={{
                          alignSelf: mine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          background: mine ? '#F6C428' : '#12352B',
                          color: mine ? '#0A1F18' : '#F3EEDF',
                          padding: '10px 14px',
                          borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          fontSize: '14px',
                          lineHeight: 1.4,
                          overflowWrap: 'anywhere',
                          whiteSpace: 'pre-wrap',
                          opacity: m.id.startsWith('tmp-') ? 0.7 : 1,
                        }}
                      >
                        {m.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {msgError && messages !== null && <ErrorNote>{msgError}</ErrorNote>}
            {sendError && <ErrorNote>{sendError}</ErrorNote>}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {QUICK_REPLIES.map((q) => (
                <button key={q} type="button" className="dz-chip" onClick={() => send(q)} style={{ fontSize: '12.5px', padding: '7px 12px' }}>
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', height: '50px', padding: '0 16px', borderRadius: '25px', border: '1px solid #1F4537', background: '#0E2A22' }}>
                <input
                  name="msg"
                  aria-label="Message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={1000}
                  placeholder={`Message ${firstName ?? 'your chauffeur'}`}
                  style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: '14.5px', color: '#F3EEDF' }}
                />
              </label>
              <button
                type="submit"
                aria-label="Send"
                disabled={!text.trim()}
                style={{ all: 'unset', cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.6, width: '50px', height: '50px', borderRadius: '25px', background: 'linear-gradient(180deg,#FFD43B,#F2B705)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0A1F18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M4 12l16-8-6 16-2.5-6.5z" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
