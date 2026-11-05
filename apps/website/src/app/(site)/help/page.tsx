'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type Faq = { id?: string; q: string; a: ReactNode; text: string };

const FAQS: Faq[] = [
  {
    q: 'How are prices calculated?',
    text: 'Every price is upfront. We ask our partner suppliers to quote for your exact trip and show you the total before you book — no surge after you book. Promo codes can be added at checkout.',
    a: null,
  },
  {
    q: 'How do I cancel a booking?',
    text: 'Open Trips in your account, choose the booking and select Cancel. Most bookings can be cancelled free of charge up to 1 hour before pickup. The exact cancellation policy is shown on each quote before you book, and on your booking afterwards.',
    a: null,
  },
  {
    q: 'When is my card charged?',
    text: 'Your card is authorised when you book, so the amount is held but not taken. It is charged when the partner confirms your booking. If a booking cannot be confirmed, the hold is released.',
    a: null,
  },
  {
    q: 'Where will my chauffeur meet me at the airport?',
    text: 'Airport transfers include Meet & Greet: your chauffeur waits in the arrivals hall with a name sign. Add your flight number when you book and the pickup follows your flight if it lands early or late. Your chauffeur’s details appear on your booking once they are assigned.',
    a: null,
  },
  {
    q: 'How does the Ridean wallet work?',
    text: 'Top up your wallet from your account, then choose to pay with your wallet balance at checkout. Your balance and every top-up and payment are listed on the Wallet page.',
    a: null,
  },
  {
    q: 'Can I book for someone else?',
    text: 'Yes. Enter the passenger’s name, email and phone number at checkout and the booking details go to them.',
    a: null,
  },
  {
    q: 'How do business accounts work?',
    text: 'Set up Ridean Business from your account, invite your team and set a travel policy. Trips booked on the business account are billed monthly, and invoices are available under Invoices in your account.',
    a: null,
  },
  {
    id: 'account',
    q: 'I forgot my password or can’t sign in',
    text: 'Password reset by email isn’t available yet. Send us a message from the Contact page using the email address on your account and we’ll help you get back in. Once signed in, you can change your password, edit your profile, and download or delete your data from Settings.',
    a: (
      <>
        Password reset by email isn’t available yet. <Link href="/contact" style={{ color: '#D9A94F' }}>Send us a message</Link> using the email address on your
        account and we’ll help you get back in. Once signed in, you can change your password, edit your profile, and download or delete your data from{' '}
        <Link href="/account/settings" style={{ color: '#D9A94F' }}>Settings</Link>.
      </>
    ),
  },
];

const TOPICS: { label: string; query?: string; href?: string; icon: ReactNode }[] = [
  {
    label: 'Airport pickups',
    query: 'airport',
    icon: <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" />,
  },
  {
    label: 'Payments & charges',
    query: 'card',
    icon: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
  },
  {
    label: 'Cancellations',
    query: 'cancel',
    icon: (
      <>
        <path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    label: 'Invoices',
    href: '/account/invoices',
    icon: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 12h6M9 16h6" />
      </>
    ),
  },
];

const ACTIONS: { label: string; sub: string; href: string; icon: ReactNode }[] = [
  { label: 'Contact us', sub: 'Send a message to our team', href: '/contact', icon: <path d="M4 5h16v11H9l-5 4z" /> },
  {
    label: 'A recent trip',
    sub: 'Changes, cancellations, receipts',
    href: '/account/trips',
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h3.5" />
      </>
    ),
  },
  {
    label: 'Business help',
    sub: 'Billing and team accounts',
    href: '/account/business',
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5h6v2M3 12h18" />
      </>
    ),
  },
  {
    label: 'Invoices',
    sub: 'Download receipts and invoices',
    href: '/account/invoices',
    icon: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 12h6M9 16h6" />
      </>
    ),
  },
];

const Gold = ({ size, children }: { size: number; children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);
const Chev = ({ d }: { d: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9FB2A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

export default function HelpSupportPage() {
  const [query, setQuery] = useState('');
  const accountRef = useRef<HTMLDetailsElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

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

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return FAQS;
    return FAQS.filter((f) => {
      const hay = `${f.q} ${f.text}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [query]);

  return (
    <>
      <section style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
        <img
          src="/img/design/signin-hero.png"
          alt=""
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background:
              'linear-gradient(90deg,rgba(7,26,20,.95) 0%,rgba(7,26,20,.7) 38%,rgba(7,26,20,.15) 75%),linear-gradient(180deg,rgba(7,26,20,0) 55%,#071A14 100%)',
          }}
        ></div>
        <div style={{ position: 'relative', height: '100%' }}>
          <div className="dz-container" style={{ paddingTop: 0 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '300px',
                maxWidth: '620px',
                paddingBottom: '30px',
                boxSizing: 'border-box',
              }}
            >
              <h1 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 'clamp(38px, 8vw, 54px)', lineHeight: 1.06, color: '#F3EEDF' }}>
                How can we help?
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>Search our help centre or send a message to our team.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="dz-container" style={{ paddingTop: 0, paddingBottom: 72 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: '0' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              height: '60px',
              padding: '0 20px',
              borderRadius: '14px',
              border: '1px solid #D9A94F',
              background: '#0E2A22',
              marginTop: '-30px',
              position: 'relative',
              zIndex: 5,
              boxShadow: '0 20px 40px -16px rgba(0,0,0,.6)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              type="search"
              aria-label="Search help articles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles — e.g. cancel, airport pickup, invoice"
              style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: '16px', color: '#F3EEDF' }}
            />
            {query && (
              <button type="button" className="dz-btn-reset" onClick={() => setQuery('')} style={{ fontSize: 13.5, color: '#D9A94F', fontWeight: 600 }}>
                Clear
              </button>
            )}
          </label>
          <div className="dz-cols-4" style={{ gap: '16px' }}>
            {ACTIONS.map((a) => (
              <div key={a.label} className="dz-card-link" style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
                <Link href={a.href} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Gold size={24}>{a.icon}</Gold>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>{a.label}</span>
                  <span style={{ fontSize: '13.5px', color: '#9FB2A6' }}>{a.sub}</span>
                </Link>
              </div>
            ))}
          </div>
          <div className="dz-main-aside" style={{ gap: '28px' }}>
            <div ref={faqRef} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '26px', color: '#F3EEDF' }}>
                  {query.trim() ? `Results for “${query.trim()}”` : 'Common questions'}
                </h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 22px' }}>
                {shown.length === 0 && (
                  <p style={{ margin: 0, padding: '20px 4px', fontSize: '14.5px', lineHeight: 1.6, color: '#9FB2A6' }}>
                    No answers match your search.{' '}
                    <Link href="/contact" style={{ color: '#D9A94F', fontWeight: 600 }}>
                      Send us a message
                    </Link>{' '}
                    and we’ll help.
                  </p>
                )}
                {shown.map((f, i) => (
                  <details
                    key={f.q}
                    id={f.id}
                    ref={f.id === 'account' ? accountRef : undefined}
                    className="dz-faq"
                    open={query.trim() ? true : undefined}
                    style={{ padding: '18px 4px', borderBottom: i < shown.length - 1 ? '1px solid #1F4537' : undefined, scrollMarginTop: 100 }}
                  >
                    <summary style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px' }}>
                      <span style={{ flex: 1 }}>{f.q}</span>
                      <span className="dz-fq-ic" style={{ display: 'flex', transition: 'transform .2s' }}>
                        <Chev d="M6 9l6 6 6-6" />
                      </span>
                    </summary>
                    <p style={{ margin: '10px 0 0', fontSize: '14.5px', lineHeight: 1.6, color: '#9FB2A6' }}>{f.a ?? f.text}</p>
                  </details>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '22px', color: '#F3EEDF' }}>Popular topics</h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 16px' }}>
                {TOPICS.map((t, i) => {
                  const rowStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 2px',
                    borderBottom: i < TOPICS.length - 1 ? '1px solid #1F4537' : undefined,
                    width: '100%',
                  } as const;
                  const inner = (
                    <>
                      <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Gold size={18}>{t.icon}</Gold>
                      </div>
                      <div style={{ flex: 1, minWidth: '0' }}>
                        <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF' }}>{t.label}</div>
                      </div>
                      <Chev d="M9 6l6 6-6 6" />
                    </>
                  );
                  return t.href ? (
                    <Link key={t.label} href={t.href} style={rowStyle}>
                      {inner}
                    </Link>
                  ) : (
                    <button
                      key={t.label}
                      type="button"
                      className="dz-btn-reset"
                      style={rowStyle}
                      onClick={() => {
                        setQuery(t.query ?? '');
                        faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      {inner}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
