'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DEFAULT_USER_SETTINGS, type UserSettings } from '@ridean/shared';
import { useRidean } from '@ridean/web-core';
import { ErrorNote, Toggle, useToast } from '@/components/site/ui';
import { ListRow, ScreenHeader, downloadFile, errMsg, sectionH2, type IconName } from '@/components/trips/kit';
import { CopyEmail } from '@/components/trips/CopyEmail';

type Privacy = UserSettings['privacy'];

const DOCS: { id: string; title: string; sub?: string; icon: IconName; text: string }[] = [
  { id: 'terms', title: 'Terms of service', sub: 'Updated 1 Oct 2026', icon: 'doc', text: 'These terms govern your use of Ridean websites and apps, operated by Best My Flight Inc.' },
  { id: 'privacy', title: 'Privacy policy', sub: 'How we use your data', icon: 'shield', text: 'We collect only what we need to arrange your trips — pickup and drop-off, contact details and payment tokens — and never sell your data.' },
  { id: 'cookies', title: 'Cookie policy', icon: 'doc', text: 'Essential cookies keep you signed in. Analytics cookies are optional and off until you allow them.' },
  { id: 'conduct', title: 'Chauffeur code of conduct', icon: 'doc', text: 'Chauffeurs are licensed professionals from partners we vet, and are expected to be punctual, courteous and discreet on every trip.' },
];

const CHOICES: { key: keyof Privacy; title: string; sub: string }[] = [
  { key: 'shareLocation', title: 'Share location during trips', sub: 'Helps set your pickup point and keep your trip on time' },
  { key: 'personalisedOffers', title: 'Personalised offers', sub: 'Use trip history to tailor promotions' },
  { key: 'analytics', title: 'Crash reports', sub: 'Share usage and error data to help us fix problems faster' },
];

const Chev = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9FB2A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, transform: open ? 'rotate(90deg)' : undefined, transition: 'transform .2s' }}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export default function LegalPrivacyPage() {
  const { api, user, ready } = useRidean();
  const toast = useToast();
  const [openDoc, setOpenDoc] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<Privacy | null>(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  // /legal#privacy etc. opens that summary
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (DOCS.some((d) => d.id === id)) setOpenDoc(id);
  }, []);

  // Load the signed-in user's privacy choices.
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
      .catch((e) => alive && setLoadError(errMsg(e, 'We could not load your privacy choices.')));
    return () => {
      alive = false;
    };
  }, [api, user]);

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
      toast(errMsg(err, 'Could not save — please try again'));
    } finally {
      setSaving(false);
    }
  }

  async function exportData() {
    setExporting(true);
    setExportError('');
    try {
      const data = await api.exportData();
      downloadFile(`ridean-data-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
      toast('Download started');
    } catch (e) {
      setExportError(errMsg(e, 'We couldn’t prepare your data. Please try again.'));
    } finally {
      setExporting(false);
    }
  }

  const signedIn = !!user;
  const values = privacy ?? DEFAULT_USER_SETTINGS.privacy;
  const disabled = !signedIn || !privacy || saving;

  return (
    <div style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
      <ScreenHeader title="Legal & privacy" fallback="/account" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
          {DOCS.map((d, i) => {
            const open = openDoc === d.id;
            const last = i === DOCS.length - 1;
            return (
              <div key={d.id} id={d.id} style={{ borderBottom: last ? undefined : '1px solid #1F4537' }}>
                <ListRow icon={d.icon} title={d.title} sub={d.sub} right={<Chev open={open} />} onClick={() => setOpenDoc(open ? null : d.id)} expanded={open} last />
                {open && (
                  <div style={{ padding: '0 2px 14px 54px', fontSize: '13.5px', lineHeight: 1.55, color: '#C9D2CB' }}>
                    <p style={{ margin: 0 }}>{d.text}</p>
                    <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#9FB2A6' }}>
                      Questions? <CopyEmail size={12.5} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', margin: '4px 0 -2px', flexWrap: 'wrap' }}>
          <h2 style={sectionH2}>Your data</h2>
          {ready && !signedIn && (
            <Link href="/signin?next=/legal" style={{ fontSize: '13px', fontWeight: 600, color: '#D9A94F' }}>
              Sign in to manage
            </Link>
          )}
        </div>
        {loadError && <ErrorNote>{loadError}</ErrorNote>}
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px', opacity: signedIn ? 1 : 0.6 }} aria-busy={signedIn && !privacy && !loadError}>
          {CHOICES.map((c, i) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 2px', borderBottom: i < CHOICES.length - 1 ? '1px solid #1F4537' : undefined }}>
              <div style={{ flex: 1, minWidth: '0' }}>
                <div style={{ fontSize: '15px', color: '#F3EEDF' }}>{c.title}</div>
                <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>{c.sub}</div>
              </div>
              <Toggle on={values[c.key]} onChange={(v) => change(c.key, v)} label={c.title} disabled={disabled} />
            </div>
          ))}
        </div>

        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
          {signedIn ? (
            <ListRow icon="download" title="Download my data" sub={exporting ? 'Preparing your file…' : 'Get a copy of your account data (JSON)'} onClick={exportData} disabled={exporting} right={<Chev open={false} />} last />
          ) : (
            <ListRow icon="download" href="/signin?next=/legal" title="Download my data" sub="Sign in to download a copy of your data" right={<Chev open={false} />} last />
          )}
        </div>
        {exportError && <ErrorNote>{exportError}</ErrorNote>}
        <p style={{ margin: '0', fontSize: '12px', lineHeight: 1.5, color: '#9FB2A6' }}>Ridean is operated by Best My Flight Inc., 1088 Liberty Ave, Brooklyn, NY 11208.</p>
      </div>
    </div>
  );
}
