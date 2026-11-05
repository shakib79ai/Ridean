'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { UserSettings } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import {
  APP_VERSION, CURRENCIES, ErrorNote, Icon, InputField, LANGUAGES, ListRow, Muted, S, Screen, ScreenHead, SectionHead, ToggleRow, currencyLabel, errMsg, languageLabel, useLoad,
} from '@/components/account/kit';

type NotifKey = keyof UserSettings['notifications'];
type Open = '' | 'language' | 'currency' | 'password' | 'delete';

const trailing = (text: string, open: boolean) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9FB2A6' }}>
    {text}
    <Icon name="right" size={16} color={C.muted} style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform .2s' }} />
  </span>
);

function Inline({ children }: { children: ReactNode }) {
  return <div style={{ padding: '0 2px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>;
}

function Settings() {
  const { api, logout } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const settings = useLoad(() => api.settings(), [api]);
  const [open, setOpen] = useState<Open>('');
  const [busy, setBusy] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [delPw, setDelPw] = useState('');
  const [delError, setDelError] = useState('');
  const s = settings.data;
  const toggle = (k: Open) => setOpen((o) => (o === k ? '' : k));

  async function setNotif(key: NotifKey, value: boolean) {
    if (!s) return;
    const prev = s;
    settings.setData({ ...s, notifications: { ...s.notifications, [key]: value } });
    try {
      settings.setData(await api.updateSettings({ notifications: { [key]: value } as UserSettings['notifications'] }));
      toast('Saved');
    } catch (e) {
      settings.setData(prev);
      toast(errMsg(e, 'Couldn’t save — please try again'));
    }
  }

  async function setPref(patch: Partial<UserSettings['preferences']>) {
    if (!s) return;
    const prev = s;
    settings.setData({ ...s, preferences: { ...s.preferences, ...patch } });
    setOpen('');
    try {
      settings.setData(await api.updateSettings({ preferences: patch as UserSettings['preferences'] }));
      toast('Saved');
    } catch (e) {
      settings.setData(prev);
      toast(errMsg(e, 'Couldn’t save — please try again'));
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (!pw.current) return setPwError('Enter your current password.');
    if (pw.next.length < 8) return setPwError('Your new password must be at least 8 characters.');
    if (pw.next !== pw.confirm) return setPwError('The new passwords don’t match.');
    setPwError('');
    setBusy('password');
    try {
      await api.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setOpen('');
      toast('Password changed');
    } catch (err) {
      setPwError(errMsg(err));
    } finally {
      setBusy('');
    }
  }

  async function deleteAccount(e: FormEvent) {
    e.preventDefault();
    if (!delPw) return setDelError('Enter your password to confirm.');
    setDelError('');
    setBusy('delete');
    try {
      await api.deleteAccount(delPw);
      logout();
      router.push('/');
    } catch (err) {
      setDelError(errMsg(err));
      setBusy('');
    }
  }

  const lang = s?.preferences.language;
  const langShort = LANGUAGES.find((l) => l.value === lang)?.short ?? (lang ?? '').slice(0, 2).toUpperCase();

  return (
    <Screen>
      <ScreenHead title="Settings" fallback="/account" />
      <div style={S.body}>
        {settings.error && <ErrorNote>{settings.error}</ErrorNote>}

        <SectionHead title="Notifications" />
        {!s ? (
          settings.loading ? <Skeleton h={200} /> : null
        ) : (
          <div style={S.list}>
            <ToggleRow title="Trip updates" sub="Chauffeur arrival and trip status" on={s.notifications.tripUpdates} onChange={(v) => setNotif('tripUpdates', v)} />
            <ToggleRow title="Flight alerts" sub="Delays affecting your transfer" on={s.notifications.flightAlerts} onChange={(v) => setNotif('flightAlerts', v)} />
            <ToggleRow title="Offers & news" sub="Promotions from Ridean" on={s.notifications.offers} onChange={(v) => setNotif('offers', v)} last />
          </div>
        )}
        <Muted>Notifications are delivered once email/SMS sending is enabled.</Muted>

        <SectionHead title="Preferences" />
        {!s ? (
          settings.loading ? <Skeleton h={200} /> : null
        ) : (
          <div style={S.list}>
            <ListRow icon="globe" title="Language" sub={languageLabel(lang)} right={trailing(langShort, open === 'language')} onClick={() => toggle('language')} ariaExpanded={open === 'language'} />
            {open === 'language' && (
              <Inline>
                <InputField icon="globe" label="Language">
                  <select className="pa-select" autoFocus value={lang} onChange={(e) => setPref({ language: e.target.value })}>
                    {!LANGUAGES.some((l) => l.value === lang) && <option value={lang}>{lang}</option>}
                    {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </InputField>
              </Inline>
            )}
            <ListRow icon="tag" title="Currency" sub={currencyLabel(s.preferences.currency)} right={trailing(s.preferences.currency, open === 'currency')} onClick={() => toggle('currency')} ariaExpanded={open === 'currency'} />
            {open === 'currency' && (
              <Inline>
                <InputField icon="tag" label="Currency">
                  <select className="pa-select" autoFocus value={s.preferences.currency} onChange={(e) => setPref({ currency: e.target.value })}>
                    {!CURRENCIES.some((c) => c.value === s.preferences.currency) && <option value={s.preferences.currency}>{s.preferences.currency}</option>}
                    {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.value} · {c.label}</option>)}
                  </select>
                </InputField>
              </Inline>
            )}
            <ListRow icon="moon" title="Appearance" sub="Dark" right={<span style={{ fontSize: '13px', color: '#9FB2A6' }}>Only theme</span>} last />
          </div>
        )}

        <SectionHead title="Security" />
        <div style={S.list}>
          <ListRow icon="lock" title="Change password" sub="Use at least 8 characters" right={trailing('', open === 'password')} onClick={() => toggle('password')} ariaExpanded={open === 'password'} last={open !== 'password'} />
          {open === 'password' && (
            <form onSubmit={changePassword} noValidate>
              <Inline>
                <InputField icon="lock" label="Current password">
                  <input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} style={S.input} />
                </InputField>
                <InputField icon="lock" label="New password">
                  <input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} style={S.input} />
                </InputField>
                <InputField icon="lock" label="Confirm new password">
                  <input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} style={S.input} />
                </InputField>
                {pwError && <ErrorNote>{pwError}</ErrorNote>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => { setOpen(''); setPwError(''); }} style={S.plain}>Cancel</button>
                  <button type="submit" className="dz-cta" disabled={busy === 'password'} style={{ ...S.cta, flex: 1, height: 50, fontSize: 16 }}>{busy === 'password' ? 'Saving…' : 'Update password'}</button>
                </div>
              </Inline>
            </form>
          )}
        </div>

        <div style={S.list}>
          <ListRow icon="help" title="About Ridean" sub={`Version ${APP_VERSION}`} />
          <ListRow icon="logout" title="Delete account" titleColor={C.bad} sub="Permanently remove your data" right={trailing('', open === 'delete')} onClick={() => toggle('delete')} ariaExpanded={open === 'delete'} last={open !== 'delete'} />
          {open === 'delete' && (
            <form onSubmit={deleteAccount} noValidate>
              <Inline>
                <p style={{ margin: 0, fontSize: 13.5, color: C.soft, lineHeight: 1.5 }}>This signs you out and removes your personal details. Upcoming trips must be cancelled or completed first. Enter your password to confirm.</p>
                <InputField icon="lock" label="Password">
                  <input type="password" autoComplete="current-password" value={delPw} onChange={(e) => setDelPw(e.target.value)} style={S.input} />
                </InputField>
                {delError && <ErrorNote>{delError}</ErrorNote>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => { setOpen(''); setDelError(''); setDelPw(''); }} style={S.plain}>Cancel</button>
                  <button type="submit" disabled={busy === 'delete'} className="dz-cta" style={{ ...S.cta, flex: 1, height: 50, fontSize: 16, background: C.bad, color: '#fff' }}>{busy === 'delete' ? 'Deleting…' : 'Delete my account'}</button>
                </div>
              </Inline>
            </form>
          )}
        </div>
      </div>
    </Screen>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <Settings />
    </RequireAuth>
  );
}
