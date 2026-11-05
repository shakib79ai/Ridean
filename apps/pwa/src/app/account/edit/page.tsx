'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { UserSettings } from '@ridean/shared';
import { Skeleton, initials, useToast } from '@/components/site/ui';
import { ErrorNote, InputField, Muted, S, Screen, ScreenHead, ToggleRow, errMsg, useLoad } from '@/components/account/kit';

type Ride = UserSettings['ride'];

function ProfileEdit() {
  const { api, user, refresh } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const settings = useLoad(() => api.settings(), [api]);
  const [f, setF] = useState({ firstName: '', lastName: '', phone: '' });
  const [ride, setRide] = useState<Ride | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setF({ firstName: user.firstName ?? '', lastName: user.lastName ?? '', phone: user.phone ?? '' });
  }, [user]);
  useEffect(() => {
    if (settings.data) setRide(settings.data.ride);
  }, [settings.data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!f.firstName.trim() || !f.lastName.trim()) return setError('Please enter your first and last name.');
    setError('');
    setBusy(true);
    try {
      await api.updateMe({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), phone: f.phone.trim() || undefined });
      const prev = settings.data?.ride;
      if (ride && prev && (prev.receiptsByEmail !== ride.receiptsByEmail || prev.quietRide !== ride.quietRide)) {
        await api.updateSettings({ ride: { receiptsByEmail: ride.receiptsByEmail, quietRide: ride.quietRide } as Ride });
      }
      await refresh();
      toast('Profile saved');
      router.push('/account');
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScreenHead title="Edit profile" fallback="/account" />
      <form onSubmit={save} style={S.body} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
          <div style={{ width: '88px', height: '88px', borderRadius: '44px', background: 'linear-gradient(135deg,#E2B04A,#9C6F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '33px', color: '#0A1F18', flexShrink: 0 }}>{initials(user)}</div>
        </div>
        <div style={{ ...S.panel, padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InputField icon="user" label="First name">
              <input name="fn" type="text" autoComplete="given-name" required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} style={S.input} />
            </InputField>
            <InputField icon="user" label="Last name">
              <input name="ln" type="text" autoComplete="family-name" required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} style={S.input} />
            </InputField>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <InputField icon="mail" label="Email" style={{ opacity: 0.6 }}>
                <input name="email" type="email" value={user?.email ?? ''} disabled readOnly aria-describedby="email-hint" style={{ ...S.input, cursor: 'not-allowed' }} />
              </InputField>
              <Muted><span id="email-hint">Contact support to change your email</span></Muted>
            </div>
            <InputField icon="phone" label="Phone">
              <input name="phone" type="tel" autoComplete="tel" placeholder="+1 212 555 0100" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} style={S.input} />
            </InputField>
          </div>
        </div>

        {settings.error && <ErrorNote>{settings.error}</ErrorNote>}
        {!ride && settings.loading ? (
          <Skeleton h={130} />
        ) : ride ? (
          <div style={S.list}>
            <ToggleRow title="Ride receipts by email" sub="We’ll use this when email receipts launch" on={ride.receiptsByEmail} onChange={(v) => setRide({ ...ride, receiptsByEmail: v })} />
            <ToggleRow title="Quiet ride by default" sub="Chauffeur keeps conversation to a minimum" on={ride.quietRide} onChange={(v) => setRide({ ...ride, quietRide: v })} last />
          </div>
        ) : null}

        {error && <ErrorNote>{error}</ErrorNote>}
        <button type="submit" className="dz-cta" disabled={busy || !user} style={S.cta}>
          <span>{busy ? 'Saving…' : 'Save changes'}</span>
        </button>
      </form>
    </Screen>
  );
}

export default function ProfileEditPage() {
  return (
    <RequireAuth>
      <ProfileEdit />
    </RequireAuth>
  );
}
