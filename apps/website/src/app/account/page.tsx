'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProfileView, RequireAuth, TripsList, WalletView, useRidean } from '@ridean/web-core';

const TABS = [['trips', 'Trips'], ['wallet', 'Wallet'], ['profile', 'Profile']] as const;

function AccountInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useRidean();
  const [tab, setTab] = useState<string>(sp.get('tab') ?? 'trips');
  return (
    <div className="rd-stack" style={{ ['--gap' as string]: '24px' }}>
      <div className="page-head" style={{ paddingBottom: 0 }}>
        <h1 className="rd-display">{user ? `Hello, ${user.firstName}` : 'Your account'}</h1>
      </div>
      <div className="rd-tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => { setTab(k); router.replace(`/account?tab=${k}`); }}>{l}</button>
        ))}
      </div>
      {tab === 'trips' && <TripsList />}
      {tab === 'wallet' && <WalletView />}
      {tab === 'profile' && <ProfileView onSignedOut={() => router.push('/')} />}
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="rd-container" style={{ maxWidth: 900 }}>
      <RequireAuth>
        <Suspense fallback={<div className="rd-skeleton" style={{ height: 300 }} />}>
          <AccountInner />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
