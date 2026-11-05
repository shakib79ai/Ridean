'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Booking, BookingLiveStatus, BookingMessage } from '@ridean/shared';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { C, ErrorNote, Skeleton } from '@/components/site/ui';
import { Avatar, H1, IconPhone, Panel, RouteCard, fmtTime } from '@/components/checkout/parts';

const QUICK_REPLIES = ['I’m outside', 'Running 5 min late', 'Please call me'];

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return `Today ${fmtTime(iso)}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${fmtTime(iso)}`;
  return `${d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} ${fmtTime(iso)}`;
}

export default function ContactDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="dz-container">
      <RequireAuth>
        <Chat id={id} />
      </RequireAuth>
    </div>
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
            // keep optimistic messages that the server hasn't returned yet
            const pending = (prev ?? []).filter((p) => p.id.startsWith('tmp-'));
            return [...m, ...pending];
          });
          setMsgError('');
        })
        .catch((e: Error) => setMsgError(e.message)),
    [api, id],
  );

  useEffect(() => {
    Promise.all([api.getBooking(id), api.bookingStatus(id)])
      .then(([b, s]) => {
        setBooking(b);
        setLive(s);
        if (s.messaging) loadMessages();
      })
      .catch((e: Error) => setLoadError(e.message));
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
      setSendError((e as Error).message);
      setText((t) => t || msg);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = text;
    setText('');
    send(msg);
  }

  if (loadError) return <ErrorNote>{loadError}</ErrorNote>;
  if (!booking || !live) {
    return (
      <div className="dz-main-aside">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <H1>Message your chauffeur</H1>
          <Skeleton h={520} />
        </div>
        <Skeleton h={260} />
      </div>
    );
  }

  const driver = live.driver;
  const firstName = driver?.name?.split(/\s+/)[0];
  const sub = ['Your chauffeur', live.etaMinutes != null ? `${live.etaMinutes} min away` : ''].filter(Boolean).join(' · ');

  return (
    <div className="dz-main-aside">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <H1>Message your chauffeur</H1>
        <Panel padding={22}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: `1px solid ${C.line}` }}>
              <Avatar name={driver?.name} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{driver?.name ?? 'Chauffeur not assigned yet'}</div>
                <div style={{ fontSize: 13, color: C.muted }}>
                  {driver?.name ? sub : 'We’ll show your chauffeur here once the partner assigns one.'}
                  {driver?.phone ? ` · ${driver.phone}` : ''}
                </div>
              </div>
              {driver?.phone && (
                <a href={telHref(driver.phone)} aria-label={`Call ${driver.name ?? 'your chauffeur'}`} style={{ width: 46, height: 46, borderRadius: 23, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconPhone c="#0A1F18" size={20} />
                </a>
              )}
            </div>

            {!live.messaging ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 4px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 16, color: C.cream }}>Messaging isn’t available for this trip — call your chauffeur.</div>
                {driver?.phone ? (
                  <a href={telHref(driver.phone)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 18px', borderRadius: 12, border: `1px solid ${C.gold}`, color: C.gold, fontSize: 14.5, fontWeight: 600 }}>
                    <IconPhone c={C.gold} size={18} />
                    Call {driver.phone}
                  </a>
                ) : (
                  <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>
                    Your chauffeur’s number will appear here once one is assigned. Need help now? <Link href="/help" style={{ color: C.gold }}>Contact support</Link>.
                  </div>
                )}
                <Link href={`/bookings/${booking.id}`} style={{ fontSize: 14, color: C.muted }}>
                  Back to booking
                </Link>
              </div>
            ) : (
              <>
                <div ref={listRef} aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 380, overflowY: 'auto', padding: '6px 2px' }}>
                  {messages === null && !msgError && <Skeleton h={60} style={{ width: '60%' }} />}
                  {msgError && messages === null && <ErrorNote>{msgError}</ErrorNote>}
                  {messages && messages.length === 0 && (
                    <div style={{ alignSelf: 'center', margin: 'auto 0', fontSize: 14, color: C.muted, textAlign: 'center' }}>No messages yet. Send a note or use a quick reply below.</div>
                  )}
                  {messages?.map((m, i) => {
                    const prev = messages[i - 1];
                    const showDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                    const mine = m.sender === 'customer';
                    return (
                      <div key={m.id} style={{ display: 'contents' }}>
                        {showDay && <div style={{ alignSelf: 'center', fontSize: 12, color: C.muted }}>{dayLabel(m.createdAt)}</div>}
                        {m.sender === 'system' ? (
                          <div style={{ alignSelf: 'center', maxWidth: '85%', fontSize: 12.5, color: C.muted, textAlign: 'center' }}>{m.body}</div>
                        ) : (
                          <div
                            title={fmtTime(m.createdAt)}
                            style={{
                              alignSelf: mine ? 'flex-end' : 'flex-start',
                              maxWidth: '70%',
                              background: mine ? C.yellow : C.panel2,
                              color: mine ? '#0A1F18' : C.cream,
                              padding: '12px 16px',
                              borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              fontSize: 15,
                              lineHeight: 1.45,
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
                {sendError && <ErrorNote>{sendError}</ErrorNote>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {QUICK_REPLIES.map((q) => (
                    <button key={q} type="button" className="dz-chip" onClick={() => send(q)}>
                      {q}
                    </button>
                  ))}
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10 }}>
                  <label style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', height: 52, padding: '0 18px', borderRadius: 26, border: `1px solid ${C.line}`, background: C.bg }}>
                    <input
                      name="msg"
                      aria-label="Message"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={1000}
                      placeholder={`Message ${firstName ?? 'your chauffeur'}`}
                      style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: 15, color: C.cream }}
                    />
                  </label>
                  <button type="submit" aria-label="Send" disabled={!text.trim()} style={{ all: 'unset', cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.6, width: 52, height: 52, borderRadius: 26, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A1F18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M4 12l16-8-6 16-2.5-6.5z" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </Panel>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0, position: 'sticky', top: 20, alignSelf: 'start' }}>
        {/* Decorative street-map illustration (not live tracking) */}
        <div style={{ position: 'relative', height: 260, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}`, background: '#0A2019' }}>
          <svg width="100%" height="100%" viewBox="0 0 420 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="420" height="260" fill="#0A2019" />
            <g stroke="#143A2E" strokeWidth="12" fill="none">
              <path d="M-10 78 L430 57" />
              <path d="M-10 195 L430 221" />
              <path d="M108 -10 L144 270" />
              <path d="M300 -10 L276 270" />
            </g>
            <g stroke="#10302A" strokeWidth="6" fill="none">
              <path d="M-10 135 L430 130" />
              <path d="M204 -10 L216 270" />
              <path d="M372 -10 L360 270" />
              <path d="M36 -10 L60 270" />
              <path d="M252 -10 L246 270" />
            </g>
            <rect x="162" y="151" width="70" height="34" rx="5" fill="#123A2A" />
            <rect x="228" y="26" width="60" height="40" rx="5" fill="#123A2A" />
            <rect x="48" y="21" width="54" height="36" rx="5" fill="#123A2A" />
            <path d="M84 187 C 168 177, 180 109, 240 94 S 324 62, 342 52" stroke="#D9A94F" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="84" cy="187" r="9" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
            <circle cx="342" cy="52" r="10" fill="#F6C428" />
            <circle cx="342" cy="52" r="4" fill="#071A14" />
          </svg>
        </div>
        <RouteCard booking={booking} />
      </div>
    </div>
  );
}
