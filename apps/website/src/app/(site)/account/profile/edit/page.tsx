'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useRidean } from '@ridean/web-core';
import type { UserSettings } from '@ridean/shared';
import { C, initials, useToast } from '@/components/site/ui';
import { CURRENCIES, ErrorNote, InputField, LANGUAGES, Muted, PageHead, S, errMsg, useLoad } from '@/components/account/kit';

const inputStyle = { all: 'unset', boxSizing: 'border-box', width: '100%', fontSize: 14.5, color: C.cream, marginTop: 2 } as const;

export default function ProfileEditPage() {
  const { api, user, refresh } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const settings = useLoad(() => api.settings(), [api]);
  const [f, setF] = useState({ firstName: '', lastName: '', phone: '' });
  const [prefs, setPrefs] = useState({ language: 'en-US', currency: 'USD' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setF({ firstName: user.firstName ?? '', lastName: user.lastName ?? '', phone: user.phone ?? '' });
  }, [user]);
  useEffect(() => {
    if (settings.data) setPrefs({ language: settings.data.preferences.language, currency: settings.data.preferences.currency });
  }, [settings.data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!f.firstName.trim() || !f.lastName.trim()) return setError('Please enter your first and last name.');
    setError('');
    setBusy(true);
    try {
      await api.updateMe({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), phone: f.phone.trim() || undefined });
      const p = settings.data?.preferences;
      if (!p || p.language !== prefs.language || p.currency !== prefs.currency) await api.updateSettings({ preferences: prefs as UserSettings['preferences'] });
      await refresh();
      toast('Profile saved');
      router.push('/account/profile');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  const langs = LANGUAGES.some((l) => l.value === prefs.language) ? LANGUAGES : [...LANGUAGES, { value: prefs.language, label: prefs.language, short: '' }];
  const curs = CURRENCIES.some((c) => c.value === prefs.currency) ? CURRENCIES : [...CURRENCIES, { value: prefs.currency, label: prefs.currency }];

  return (
    <div style={S.page}>
      <PageHead title="Edit profile" />
      <form onSubmit={save} style={{ ...S.panel, padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'linear-gradient(135deg,#E2B04A,#9C6F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 30, color: '#0A1F18', flexShrink: 0 }}>
              {initials(user)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.cream }}>{user ? `${user.firstName} ${user.lastName}` : ''}</span>
              <span style={{ fontSize: 13, color: C.muted, overflowWrap: 'anywhere' }}>{user?.email}</span>
            </div>
          </div>

          <div className="dz-split" style={{ gap: 12 }}>
            <InputField icon="user" label="First name">
              <input name="fn" type="text" autoComplete="given-name" required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} style={inputStyle} />
            </InputField>
            <InputField icon="user" label="Last name">
              <input name="ln" type="text" autoComplete="family-name" required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} style={inputStyle} />
            </InputField>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <InputField icon="mail" label="Email" style={{ opacity: 0.6 }}>
                <input name="email" type="email" value={user?.email ?? ''} disabled readOnly aria-describedby="email-hint" style={{ ...inputStyle, cursor: 'not-allowed' }} />
              </InputField>
              <Muted><span id="email-hint">Contact support to change your email</span></Muted>
            </div>
            <InputField icon="phone" label="Mobile">
              <input name="phone" type="tel" autoComplete="tel" placeholder="+1 212 555 0100" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} style={inputStyle} />
            </InputField>
            <InputField icon="globe" label="Language">
              <select className="dz-acct-select" value={prefs.language} disabled={!settings.data} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}>
                {langs.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </InputField>
            <InputField icon="tag" label="Currency">
              <select className="dz-acct-select" value={prefs.currency} disabled={!settings.data} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}>
                {curs.map((c) => <option key={c.value} value={c.value}>{c.value} · {c.label}</option>)}
              </select>
            </InputField>
          </div>

          {settings.error && <ErrorNote>{settings.error}</ErrorNote>}
          {error && <ErrorNote>{error}</ErrorNote>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link href="/account/profile" style={S.plain}>Cancel</Link>
            <div style={{ width: 220, maxWidth: '100%' }}>
              <button type="submit" className="dz-cta" disabled={busy || !user} style={S.cta}>
                <span>{busy ? 'Saving…' : 'Save changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
