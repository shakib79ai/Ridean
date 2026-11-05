'use client';

import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';
import { DEFAULT_USER_SETTINGS, type UserSettings } from '@ridean/shared';
import { useRidean } from '@ridean/web-core';
import { ErrorNote, Toggle, useToast } from '@/components/site/ui';
import m from '@/components/marketing/marketing.module.css';

type Privacy = UserSettings['privacy'];

const DOCS = [
  {
    id: 'terms',
    title: 'Terms of service',
    text: 'Updated 1 Oct 2026. These terms govern your use of Ridean websites and apps, operated by Best My Flight Inc.',
  },
  {
    id: 'privacy',
    title: 'Privacy policy',
    text: 'We collect only what we need to arrange your trips — pickup and drop-off, contact details and payment tokens — and never sell your data.',
  },
  {
    id: 'cookies',
    title: 'Cookie policy',
    text: 'Essential cookies keep you signed in. Analytics cookies are optional and off until you allow them.',
  },
  {
    id: 'conduct',
    title: 'Chauffeur code of conduct',
    text: 'Chauffeurs are licensed professionals from partners we vet, and are expected to be punctual, courteous and discreet on every trip.',
  },
];

const CHOICES: { key: keyof Privacy; title: string; sub: string }[] = [
  { key: 'shareLocation', title: 'Share location during trips', sub: 'Helps set your pickup point and keep your trip on time' },
  { key: 'personalisedOffers', title: 'Personalised offers', sub: 'Use trip history to tailor promotions' },
  { key: 'analytics', title: 'Analytics cookies', sub: 'Help us improve the website' },
];

const h2 = { margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, color: '#F3EEDF' } as const;

export default function LegalPrivacyPage() {
  const { api, user, ready } = useRidean();
  const toast = useToast();
  const [active, setActive] = useState('terms');
  const [privacy, setPrivacy] = useState<Privacy | null>(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the signed-in visitor's privacy choices.
  useEffect(() => {
    if (!user) {
      setPrivacy(null);
      return;
    }
    let alive = true;
    setLoadError('');
    api
      .settings()
      .then((s) => alive && setPrivacy(s.privacy))
      .catch((e: Error) => alive && setLoadError(e.message || 'We could not load your privacy choices.'));
    return () => {
      alive = false;
    };
  }, [api, user]);

  // Highlight the section currently in view.
  useEffect(() => {
    const els = DOCS.map((d) => document.getElementById(d.id)).filter((e): e is HTMLElement => !!e);
    if (!('IntersectionObserver' in window) || !els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: '-90px 0px -55% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setActive(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }

  async function change(key: keyof Privacy, value: boolean) {
    if (!privacy) return;
    const prev = privacy;
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    setSaving(true);
    try {
      const saved = await api.updateSettings({ privacy: next });
      setPrivacy(saved.privacy ?? next);
      toast('Saved');
    } catch (err) {
      setPrivacy(prev);
      toast((err as Error).message || 'Could not save — please try again');
    } finally {
      setSaving(false);
    }
  }

  const signedIn = !!user;
  const values = privacy ?? DEFAULT_USER_SETTINGS.privacy;
  const disabled = !signedIn || !privacy || saving;

  return (
    <div className="dz-container" style={{ paddingTop: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '0' }}>
        <h1 style={{ ...h2, fontSize: 'clamp(34px, 7vw, 44px)', lineHeight: 1.06 }}>Legal & privacy</h1>
        <p style={{ margin: '0', fontSize: '15px', lineHeight: 1.6, color: '#9FB2A6' }}>Plain-language summaries of the documents that govern Ridean.</p>
        <div className={m.legalGrid}>
          <div className={m.legalNav} style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '10px' }}>
            <nav aria-label="Legal documents" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[...DOCS, { id: 'choices', title: 'Your privacy choices' }].map((d) => (
                <a
                  key={d.id}
                  href={`#${d.id}`}
                  onClick={(e) => jump(e, d.id)}
                  aria-current={active === d.id ? 'location' : undefined}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    background: active === d.id ? '#12352B' : undefined,
                    color: active === d.id ? '#F3EEDF' : '#C9D2CB',
                  }}
                >
                  {d.title}
                </a>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '0' }}>
            {DOCS.map((d) => (
              <section key={d.id} id={d.id} style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '24px', scrollMarginTop: 96 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '0' }}>
                  <h2 style={{ ...h2, fontSize: '22px' }}>{d.title}</h2>
                  <p style={{ margin: '0', fontSize: '15px', lineHeight: 1.6, color: '#C9D2CB' }}>{d.text}</p>
                  <Link href="/contact" style={{ fontSize: '14px', color: '#D9A94F' }}>
                    Questions about this document? Contact us →
                  </Link>
                </div>
              </section>
            ))}
            <div id="choices" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', scrollMarginTop: 96 }}>
              <h2 style={{ ...h2, fontSize: '24px' }}>Your privacy choices</h2>
              {ready && !signedIn && (
                <Link href="/signin?next=/legal%23choices" style={{ fontSize: '14px', fontWeight: 600, color: '#D9A94F' }}>
                  Sign in to manage your choices
                </Link>
              )}
            </div>
            {loadError && <ErrorNote>{loadError}</ErrorNote>}
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 18px', opacity: signedIn ? 1 : 0.6 }} aria-busy={signedIn && !privacy && !loadError}>
              {CHOICES.map((c, i) => (
                <div
                  key={c.key}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 2px', borderBottom: i < CHOICES.length - 1 ? '1px solid #1F4537' : undefined }}
                >
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', color: '#F3EEDF' }}>{c.title}</div>
                    <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>{c.sub}</div>
                  </div>
                  <Toggle on={values[c.key]} onChange={(v) => change(c.key, v)} label={c.title} disabled={disabled} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
