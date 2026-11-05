'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Booking } from '@ridean/shared';
import { useRidean } from '@ridean/web-core';
import { CopyEmail, SUPPORT_EMAIL } from '@/components/trips/CopyEmail';
import { Icon, ListRow, RowChevron, ScreenHeader, fmtDay, sectionH2, serviceMeta, tripTitle } from '@/components/trips/kit';

type Faq = { id?: string; q: string; text: string; a?: ReactNode };

const gold = { color: '#D9A94F' } as const;

const FAQS: Faq[] = [
  {
    q: 'How do I cancel a booking?',
    text: 'Open Trips, choose the booking and tap Cancel booking. Most bookings can be cancelled free of charge up to 1 hour before pickup. The exact cancellation policy is shown on each quote before you book, and on your booking afterwards.',
  },
  {
    q: 'Where will my chauffeur meet me at the airport?',
    text: 'Airport transfers include Meet & Greet: your chauffeur waits in the arrivals hall with a name sign. Add your flight number when you book and the pickup follows your flight if it lands early or late. Your chauffeur’s details appear on your booking once they are assigned.',
  },
  {
    q: 'How is my price calculated?',
    text: 'Every price is upfront. We ask our partner suppliers to quote for your exact trip and show you the total before you book — no surge after you book. Promo codes can be added at checkout.',
  },
  {
    q: 'When is my card charged?',
    text: 'Your card is authorised when you book, so the amount is held but not taken. It is charged when the partner confirms your booking. If a booking cannot be confirmed, the hold is released.',
  },
  {
    q: 'Can I book for someone else?',
    text: 'Yes. Enter the passenger’s name, email and phone number at checkout and the booking details go to them.',
  },
  {
    q: 'How does the Ridean wallet work?',
    text: 'Top up your wallet from the Wallet tab, then choose to pay with your wallet balance at checkout. Your balance and every top-up and payment are listed on the Wallet tab.',
  },
  {
    q: 'How do business accounts work?',
    text: 'Set up Ridean Business from your account, invite your team and set a travel policy. Trips booked on the business account are billed monthly, and invoices are available under Invoices in your account.',
  },
  {
    id: 'account',
    q: 'I forgot my password or can’t sign in',
    text: `Password reset by email isn’t available yet. Email us at ${SUPPORT_EMAIL} from the address on your account and we’ll help you get back in. Once signed in, you can change your password, edit your profile, and download or delete your data from Settings.`,
    a: (
      <>
        Password reset by email isn’t available yet. Email us at <CopyEmail size={13.5} /> from the address on your account and we’ll help you get back in. Once signed in, you can change your password, edit your profile, and download or delete your data from{' '}
        <Link href="/account/settings" style={gold}>Settings</Link>.
      </>
    ),
  },
];

const Chev = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9FB2A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function HelpSupportPage() {
  const { api, user } = useRidean();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<Booking | null>(null);
  const accountRef = useRef<HTMLDetailsElement>(null);

  // /help#account opens and scrolls to the account question.
  useEffect(() => {
    const open = () => {
      if (window.location.hash === '#account' && accountRef.current) {
        accountRef.current.open = true;
        accountRef.current.scrollIntoView({ block: 'center' });
      }
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);

  // Signed in: point "Help with a recent trip" at the latest booking.
  useEffect(() => {
    if (!user) {
      setRecent(null);
      return;
    }
    let alive = true;
    api
      .myBookings({ page: 1 })
      .then((r) => {
        const latest = [...r.items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0] ?? null;
        if (alive) setRecent(latest);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [api, user]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return FAQS;
    return FAQS.filter((f) => {
      const hay = `${f.q} ${f.text}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [query]);

  const searching = !!query.trim();

  return (
    <div style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
      <ScreenHeader title="Help & support" fallback="/account" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #1F4537', background: '#0E2A22' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9FB2A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input type="search" aria-label="Search help articles" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search help articles" style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: '14.5px', color: '#F3EEDF' }} />
          {query && (
            <button type="button" className="dz-btn-reset" onClick={() => setQuery('')} style={{ fontSize: '13px', color: '#D9A94F', fontWeight: 600 }}>
              Clear
            </button>
          )}
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
            <Icon name="message" size={22} />
            <span style={{ fontSize: '14.5px', fontWeight: 600 }}>Contact us</span>
            <CopyEmail size={12} />
          </div>
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px', minWidth: 0 }}>
            <Link href="/account/invoices" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Icon name="doc" size={22} />
              <span style={{ fontSize: '14.5px', fontWeight: 600 }}>Invoices</span>
              <span style={{ fontSize: '12px', color: '#9FB2A6' }}>Download receipts</span>
            </Link>
          </div>
        </div>

        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
          <ListRow
            icon="trips"
            href={recent ? `/bookings/${recent.id}` : '/trips'}
            title="Help with a recent trip"
            sub={recent ? `${serviceMeta(recent.service).label} · ${tripTitle(recent)}, ${fmtDay(recent.pickupAt ?? recent.createdAt)}` : 'Changes, cancellations, receipts'}
            right={<RowChevron />}
            last
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 0 -2px' }}>
          <h2 style={sectionH2}>{searching ? `Results for “${query.trim()}”` : 'Common questions'}</h2>
        </div>
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
          {shown.length === 0 && (
            <div style={{ padding: '16px 2px', fontSize: '13.5px', lineHeight: 1.5, color: '#9FB2A6' }}>
              No answers match your search. Email us at <CopyEmail size={13.5} /> and we’ll help.
            </div>
          )}
          {shown.map((f, i) => (
            <details
              key={f.q}
              id={f.id}
              ref={f.id === 'account' ? accountRef : undefined}
              className="dz-faq"
              open={searching ? true : undefined}
              style={{ padding: '14px 2px', borderBottom: i < shown.length - 1 ? '1px solid #1F4537' : undefined, scrollMarginTop: 24 }}
            >
              <summary style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#F3EEDF' }}>
                <span style={{ flex: 1 }}>{f.q}</span>
                <span className="dz-fq-ic" style={{ display: 'flex', transition: 'transform .2s' }}>
                  <Chev />
                </span>
              </summary>
              <div style={{ margin: '10px 0 0', fontSize: '13.5px', lineHeight: 1.5, color: '#9FB2A6' }}>{f.a ?? f.text}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
