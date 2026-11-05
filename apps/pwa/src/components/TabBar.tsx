'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconTrips, IconUser, IconWallet } from '@ridean/web-core';

const TABS = [
  { href: '/', label: 'Home', Icon: IconHome, match: (p: string) => p === '/' || p.startsWith('/book/') || p.startsWith('/quotes') || p.startsWith('/checkout') },
  { href: '/trips', label: 'Trips', Icon: IconTrips, match: (p: string) => p.startsWith('/trips') || p.startsWith('/bookings') },
  { href: '/wallet', label: 'Wallet', Icon: IconWallet, match: (p: string) => p.startsWith('/wallet') },
  { href: '/account', label: 'Account', Icon: IconUser, match: (p: string) => p.startsWith('/account') || p.startsWith('/sign') },
];

export function TabBar() {
  const path = usePathname() ?? '/';
  return (
    <div className="tabbar">
      <nav aria-label="Main">
        {TABS.map(({ href, label, Icon, match }) => (
          <Link key={href} href={href} aria-current={match(path) ? 'page' : undefined}>
            <Icon size={23} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
