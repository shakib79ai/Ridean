'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useRidean } from '@ridean/web-core';
import type { UserSettings } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { ErrorNote, PageHead, S, SectionHead, ToggleRow, errMsg, fetchAllBookings, fmtMonthYear, isCancelled, languageLabel, useLoad } from '@/components/account/kit';

type RideKey = keyof UserSettings['ride'];

export default function ProfilePage() {
  const { api, user } = useRidean();
  const toast = useToast();
  const stats = useLoad(async () => {
    const [bookings, addresses] = await Promise.all([fetchAllBookings(api), api.addresses()]);
    return { trips: bookings.filter((b) => b.status === 'completed' || (!isCancelled(b) && b.pickupAt && new Date(b.pickupAt).getTime() < Date.now())).length, addresses };
  }, [api]);
  const settings = useLoad(() => api.settings(), [api]);

  async function setRide(key: RideKey, value: boolean) {
    const prev = settings.data;
    if (!prev) return;
    settings.setData({ ...prev, ride: { ...prev.ride, [key]: value } });
    try {
      const next = await api.updateSettings({ ride: { [key]: value } as UserSettings['ride'] });
      settings.setData(next);
      toast('Saved');
    } catch (e) {
      settings.setData(prev);
      toast(errMsg(e, 'Couldn’t save — please try again'));
    }
  }

  const home = stats.data?.addresses.find((a) => a.label.trim().toLowerCase() === 'home');
  const tile = (value: string | undefined, label: string) => (
    <div style={{ ...S.panel, padding: 20 }}>
      {value === undefined ? <Skeleton h={36} style={{ width: 70 }} /> : <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 30, fontWeight: 600 }}>{value}</div>}
      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
  const detail = (label: string, value: ReactNode) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12.5, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 15.5, marginTop: 4, overflowWrap: 'anywhere' }}>{value}</div>
    </div>
  );
  const r = settings.data?.ride;

  return (
    <div style={S.page}>
      <PageHead title="Profile" />
      {stats.error && <ErrorNote>{stats.error}</ErrorNote>}
      <div className="dz-cols-3">
        {tile(stats.data ? String(stats.data.trips) : stats.error ? '—' : undefined, 'Trips taken')}
        {tile(user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '—', 'Member since')}
        {tile(stats.data ? String(stats.data.addresses.length) : stats.error ? '—' : undefined, 'Saved places')}
      </div>

      <div style={{ ...S.panel, padding: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <SectionHead title="Personal details" size={20} link={<Link href="/account/profile/edit" style={S.goldLink}>Edit</Link>} />
          <div className="dz-split" style={{ gap: 18 }}>
            {detail('Full name', user ? `${user.firstName} ${user.lastName}` : '')}
            {detail('Email', user?.email)}
            {detail('Mobile', user?.phone || <span style={{ color: C.muted }}>Not added</span>)}
            {detail('Member since', fmtMonthYear(user?.createdAt))}
            {detail('Home', stats.data ? home?.address ?? <Link href="/account/addresses" style={{ color: C.gold }}>Add a home address</Link> : '…')}
            {detail('Language', settings.data ? languageLabel(settings.data.preferences.language) : '…')}
          </div>
        </div>
      </div>

      <SectionHead title="Ride preferences" />
      {settings.error && <ErrorNote>{settings.error}</ErrorNote>}
      {!r && settings.loading ? (
        <Skeleton h={200} />
      ) : r ? (
        <div style={S.list}>
          <ToggleRow title="Ride receipts by email" sub="We’ll use this when email receipts launch" on={r.receiptsByEmail} onChange={(v) => setRide('receiptsByEmail', v)} />
          <ToggleRow title="Quiet ride by default" sub="Chauffeur keeps conversation to a minimum" on={r.quietRide} onChange={(v) => setRide('quietRide', v)} />
          <ToggleRow title="Share trip status with family" sub="Send a live link when a trip starts" on={r.shareStatus} onChange={(v) => setRide('shareStatus', v)} last />
        </div>
      ) : null}
    </div>
  );
}
