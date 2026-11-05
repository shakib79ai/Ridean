'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useRidean } from '@ridean/web-core';

const NAV = [
  { href: '/ride', label: 'Ride' },
  { href: '/airport-transfer', label: 'Airport transfer' },
  { href: '/rent', label: 'Rent a car' },
  { href: '/hourly', label: 'Hourly chauffeur' },
  { href: '/luxury', label: 'Luxury chauffeur' },
  { href: '/business', label: 'Business' },
  { href: '/services', label: 'Services' },
];

export function Header() {
  const path = usePathname();
  const { user } = useRidean();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="rd-container site-header-inner">
        <Link href="/" className="rd-logo" style={{ fontSize: 34 }} aria-label="Ridean home">Ridean</Link>
        <nav className={`site-nav ${open ? 'open' : ''}`} aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? 'page' : undefined} onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
        </nav>
        <div className="rd-row" style={{ marginLeft: 'auto', ['--gap' as string]: '18px' }}>
          <Link href="/help" className="rd-hide-mobile" style={{ fontSize: 15, color: '#d9ded8' }}>Help</Link>
          {user ? (
            <Link href="/account" className="rd-btn rd-btn-dark" style={{ height: 42 }}>{user.firstName}</Link>
          ) : (
            <>
              <Link href="/signin" className="rd-hide-mobile" style={{ fontSize: 15 }}>Sign in</Link>
              <Link href="/signup" className="rd-btn" style={{ height: 42, fontSize: 14.5 }}>Get started</Link>
            </>
          )}
          <button className="rd-btn rd-btn-dark site-menu-btn" style={{ height: 42, width: 42, padding: 0 }} aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>☰</button>
        </div>
      </div>
    </header>
  );
}
