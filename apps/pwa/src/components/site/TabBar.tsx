'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home', icon: <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />, match: (p: string) => p === '/' },
  { href: '/trips', label: 'Trips', icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3.5" /></>, match: (p: string) => p.startsWith('/trips') },
  { href: '/wallet', label: 'Wallet', icon: <><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18M16 15h2" /><path d="M6 6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>, match: (p: string) => p.startsWith('/wallet') },
  { href: '/account', label: 'Account', icon: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>, match: (p: string) => p === '/account' },
];

/** Bottom tab bar from the PWA design — shown on the four top-level screens. */
export function TabBar() {
  const path = usePathname() ?? '/';
  return (
    <div className="pw-tabbar">
      <nav aria-label="Main">
        {TABS.map((t) => {
          const on = t.match(path);
          return (
            <Link key={t.href} href={t.href} aria-current={on ? 'page' : undefined}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={on ? '#F6C428' : '#9FB2A6'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{t.icon}</svg>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
