'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRidean } from '@ridean/web-core';
import { Arrow, ctaStyle, ErrorNote, Field, ghostStyle, useToast } from '@/components/site/ui';

const TOPICS = ['A trip', 'Payments', 'Business', 'Partnerships', 'Other'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactPage() {
  const { api, user } = useRidean();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('A trip');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  // Pre-fill from the signed-in account (only fields the visitor hasn't typed in yet).
  useEffect(() => {
    if (!user) return;
    setName((n) => n || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim());
    setEmail((e) => e || user.email || '');
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) return setError('Please enter your name');
    if (!EMAIL_RE.test(email.trim())) return setError('Please enter a valid email address');
    if (message.trim().length < 10) return setError('Please tell us a little more (at least 10 characters)');
    setBusy(true);
    try {
      await api.contact({ name: name.trim(), email: email.trim(), topic, message: message.trim() });
      setSent(true);
      toast('Message sent');
    } catch (err) {
      setError((err as Error).message || 'We could not send your message. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setMessage('');
    setSent(false);
  }

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
                Contact us
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>Real people, ready to help.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="dz-container" style={{ paddingBottom: 72 }}>
        <div className="dz-split" style={{ gap: '28px' }}>
          <form
            noValidate
            onSubmit={submit}
            style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '28px', minWidth: 0 }}
          >
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }} role="status">
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '26px', color: '#F3EEDF' }}>Message sent</h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#C9D2CB' }}>
                  Thanks, {name.trim().split(' ')[0] || 'there'} — we’ve received your message and will reply to <strong style={{ color: '#F3EEDF' }}>{email.trim()}</strong> as soon as we can.
                </p>
                <button type="button" className="dz-btn-reset" onClick={reset} style={{ ...ghostStyle, alignSelf: 'flex-start' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                  <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '26px', color: '#F3EEDF' }}>Send us a message</h2>
                </div>
                <div className="dz-split" style={{ gap: '12px' }}>
                  <Field icon={<UserIcon />} label="Your name">
                    <input name="name" type="text" className="dz-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" maxLength={120} />
                  </Field>
                  <Field icon={<MailIcon />} label="Email">
                    <input name="email" type="email" className="dz-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </Field>
                </div>
                <div style={{ fontSize: '13px', color: '#9FB2A6' }} id="topic-label">
                  Topic
                </div>
                <div role="group" aria-labelledby="topic-label" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {TOPICS.map((t) => (
                    <button key={t} type="button" className={`dz-chip ${topic === t ? 'on' : ''}`} aria-pressed={topic === t} onClick={() => setTopic(t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '12px', color: '#9FB2A6' }}>Message</span>
                  <textarea
                    rows={5}
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={4000}
                    placeholder="How can we help? Include your booking reference if it’s about a trip."
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      display: 'block',
                      width: '100%',
                      marginTop: '6px',
                      padding: '14px',
                      border: '1px solid #1F4537',
                      borderRadius: '12px',
                      background: '#071A14',
                      fontSize: '15px',
                      color: '#F3EEDF',
                      whiteSpace: 'pre-wrap',
                    }}
                  />
                </label>
                {error && <ErrorNote>{error}</ErrorNote>}
                <button type="submit" className="dz-cta" disabled={busy} style={ctaStyle}>
                  <span>{busy ? 'Sending…' : 'Send message'}</span>
                  <Arrow />
                </button>
              </div>
            )}
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
            <InfoCard
              title="Customer support"
              icon={
                <>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3.5 6l8.5 7 8.5-7" />
                </>
              }
            >
              <a href="mailto:support@ridean.com">support@ridean.com</a>
            </InfoCard>
            <InfoCard
              title="Ridean Business"
              icon={
                <>
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M9 7V5h6v2M3 12h18" />
                </>
              }
            >
              <a href="mailto:business@ridean.com">business@ridean.com</a>
            </InfoCard>
            <InfoCard title="Partnerships" icon={<path d="M4 5h16v11H9l-5 4z" />}>
              <a href="mailto:partners@ridean.com">partners@ridean.com</a>
            </InfoCard>
            <InfoCard
              title="Head office"
              icon={
                <>
                  <rect x="4" y="3" width="11" height="18" rx="1" />
                  <path d="M15 9h5v12h-5M8 7h3M8 11h3M8 15h3" />
                </>
              }
            >
              Best My Flight Inc.
              <br />
              1088 Liberty Ave, Brooklyn, NY 11208
            </InfoCard>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9A94F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            {icon}
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: '14.5px', color: '#C9D2CB', marginTop: '4px', lineHeight: 1.5, overflowWrap: 'anywhere' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

const UserIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F3EEDF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </svg>
);
const MailIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F3EEDF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6l8.5 7 8.5-7" />
  </svg>
);
