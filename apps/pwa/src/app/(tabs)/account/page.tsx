'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { C, Skeleton, initials } from '@/components/site/ui';
import { ErrorNote, Icon, cardLabel, fetchAllBookings, isCancelled, money, useLoad, type IconName } from '@/components/account/kit';

const tileStyle = { background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '12px', textAlign: 'center', minWidth: 0 } as const;

function Tile({ value, label }: { value: string | null; label: string }) {
  return (
    <div style={tileStyle}>
      {value === null ? (
        <Skeleton h={28} style={{ width: '60%', margin: '0 auto', borderRadius: 8 }} />
      ) : (
        <div style={{ fontFamily: 'Playfair Display,serif', fontSize: value.length > 7 ? '17px' : '22px', lineHeight: '28px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      )}
      <div style={{ fontSize: '11.5px', color: '#9FB2A6', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function MenuRow({ href, icon, title, sub, last }: { href: string; icon: IconName; title: string; sub: ReactNode; last?: boolean }) {
  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: last ? undefined : '1px solid #1F4537' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} />
      </div>
      <div style={{ flex: 1, minWidth: '0' }}>
        <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF' }}>{title}</div>
        <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
      </div>
      <Icon name="right" color="#9FB2A6" />
    </Link>
  );
}

const subSkel = <span className="dz-skel" style={{ display: 'inline-block', width: 110, height: 12, borderRadius: 6, verticalAlign: 'middle' }} />;

function Profile() {
  const { api, user, logout } = useRidean();
  const router = useRouter();

  const trips = useLoad(async () => {
    const all = await fetchAllBookings(api);
    return all.filter((b) => b.status === 'completed' || (!isCancelled(b) && b.pickupAt && new Date(b.pickupAt).getTime() < Date.now())).length;
  }, [api]);
  const addresses = useLoad(() => api.addresses(), [api]);
  const wallet = useLoad(() => api.wallet(), [api]);
  const cards = useLoad(() => api.paymentMethods(), [api]);
  const business = useLoad(() => api.business(), [api]);

  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;
  const def = cards.data ? cards.data.find((c) => c.isDefault) ?? cards.data[0] : undefined;
  const addr = addresses.data;
  const addrSub = !addr
    ? addresses.error ? 'Home, work and favourite places' : subSkel
    : addr.length === 0
      ? 'Add home or work'
      : addr.length <= 2
        ? addr.map((a) => a.label).join(', ')
        : `${addr.slice(0, 2).map((a) => a.label).join(', ')} + ${addr.length - 2}`;
  const cardSub = cards.data ? (def ? cardLabel(def) : 'Add a card') : cards.error ? 'Cards, wallet and business' : subSkel;
  const bizSub = business.data ? business.data.name : business.loading ? subSkel : business.error ? 'Travel for work' : 'Set up for your team';

  const error = trips.error || addresses.error || wallet.error;

  function signOut() {
    logout();
    router.push('/');
  }

  return (
    <div style={{ paddingBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', minHeight: '62px' }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, letterSpacing: '-.01em', background: 'linear-gradient(180deg,#F8DD8A 0%,#E2B04A 55%,#B9842A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontSize: '30px' }}>Ridean</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '62px', height: '62px', borderRadius: '31px', background: 'linear-gradient(135deg,#E2B04A,#9C6F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '24px', color: '#0A1F18', flexShrink: 0 }}>{initials(user)}</div>
            <div style={{ flex: 1, minWidth: '0' }}>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '22px', fontWeight: 600, overflowWrap: 'anywhere' }}>{user ? `${user.firstName} ${user.lastName}` : ''}</div>
              <div style={{ fontSize: '13px', color: '#9FB2A6', marginTop: '3px', overflowWrap: 'anywhere' }}>{user?.email}</div>
              {memberSince && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', background: 'rgba(217,169,79,.14)', color: '#D9A94F', fontSize: '11.5px', fontWeight: 600 }}>
                    <Icon name="calendar" size={13} /> Member since {memberSince}
                  </span>
                </div>
              )}
            </div>
            <Link href="/account/edit" aria-label="Edit profile" style={{ padding: 4 }}>
              <Icon name="pencil" size={19} />
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '10px' }}>
          <Tile value={trips.data !== null ? String(trips.data) : trips.error ? '—' : null} label="Trips" />
          <Tile value={addr ? String(addr.length) : addresses.error ? '—' : null} label="Saved places" />
          <Tile value={wallet.data ? money(wallet.data.balance, wallet.data.currency) : wallet.error ? '—' : null} label="Wallet" />
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}

        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
          <MenuRow href="/account/edit" icon="user" title="Edit profile" sub="Name, phone, email" />
          <MenuRow href="/account/payment-methods" icon="card" title="Payment methods" sub={cardSub} />
          <MenuRow href="/account/addresses" icon="pin" title="Saved addresses" sub={addrSub} />
          <MenuRow href="/account/business" icon="briefcase" title="Business account" sub={bizSub} />
          <MenuRow href="/account/invoices" icon="doc" title="Invoices" sub="Receipts for your trips" />
          <MenuRow href="/account/settings" icon="bell" title="Settings" sub="Notifications, language" />
          <MenuRow href="/help" icon="help" title="Help & support" sub="24/7 chauffeur support" />
          <MenuRow href="/legal" icon="shield" title="Legal & privacy" sub="Terms, data and cookies" last />
        </div>

        <button type="button" onClick={signOut} className="dz-btn-reset" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', height: '50px', borderRadius: '12px', border: '1px solid #1F4537', color: '#E5645A', fontSize: '15px', fontWeight: 600 }}>
          <Icon name="logout" color="#E5645A" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AccountTabPage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}
