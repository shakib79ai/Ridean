'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useRidean } from '@ridean/web-core';
import { Chevron, initials } from './ui';

const NAV: { href: string; label: string; also?: string[] }[] = [
  { href: '/ride', label: 'Ride' },
  { href: '/airport-transfer', label: 'Airport transfer' },
  { href: '/rent', label: 'Rent a car' },
  { href: '/hourly', label: 'Chauffeur', also: ['/luxury'] },
  { href: '/account/business', label: 'Business' },
];
const HOME_NAV: { href: string; label: string; also?: string[] }[] = [
  { href: '/ride', label: 'Ride' },
  { href: '/airport-transfer', label: 'Airport transfer' },
  { href: '/rent', label: 'Rent a car' },
  { href: '/hourly', label: 'Hourly chauffeur' },
  { href: '/luxury', label: 'Luxury chauffeur' },
  { href: '/account/business', label: 'Business' },
  { href: '/services', label: 'Services' },
];
const MENU = [
  { href: '/account', label: 'Dashboard' },
  { href: '/account/trips', label: 'Trips' },
  { href: '/account/wallet', label: 'Wallet' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/settings', label: 'Settings' },
];

const logo: React.CSSProperties = { fontFamily: "'Playfair Display',serif", fontWeight: 700, letterSpacing: '-.01em', background: 'linear-gradient(180deg,#F8DD8A 0%,#E2B04A 55%,#B9842A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontSize: 36, textDecoration: 'none' };

export function SiteHeader() {
  const path = usePathname() ?? '/';
  const router = useRouter();
  const { user, logout } = useRidean();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = path === '/' ? HOME_NAV : NAV;

  useEffect(() => {
    setMenu(false);
    setMobile(false);
  }, [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="dz-header" style={{ position: 'relative', zIndex: 20, background: '#0A1813', borderBottom: '1px solid #1F4537' }}>
      <div style={{ maxWidth: 1344, margin: '0 auto', padding: '0 max(16px, min(48px, 4vw))', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 4vw, 56px)', height: 78 }}>
          <Link href="/" style={logo} aria-label="Ridean home">Ridean</Link>
          <nav className={`dz-nav ${mobile ? 'open' : ''}`} aria-label="Main" style={{ display: 'flex', gap: 34, flex: 1 }}>
            {nav.map((n) => {
              const active = path.startsWith(n.href) || !!n.also?.some((a) => path.startsWith(a));
              return (
                <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} style={{ padding: '26px 0 22px', fontSize: 15, color: active ? '#F3EEDF' : '#D9DED8', fontWeight: active ? 600 : 400, borderBottom: `2.5px solid ${active ? '#F6C428' : 'transparent'}`, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginLeft: 'auto' }}>
            <Link href="/help" className="dz-hide-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#D9DED8', textDecoration: 'none' }}>
              Help <Chevron size={15} />
            </Link>
            {user ? (
              <div ref={ref} style={{ position: 'relative' }}>
                <button type="button" className="dz-btn-reset" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg,#E2B04A,#9C6F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: '#0A1F18' }}>{initials(user)}</span>
                  <span className="dz-hide-sm" style={{ fontSize: 14.5, color: '#F3EEDF' }}>{user.firstName}</span>
                  <Chevron size={16} />
                </button>
                {menu && (
                  <div role="menu" style={{ position: 'absolute', right: 0, top: 48, width: 220, background: '#0E2A22', border: '1px solid #1F4537', borderRadius: 14, padding: 8, boxShadow: '0 18px 50px rgba(0,0,0,.45)' }}>
                    {MENU.map((m) => (
                      <Link key={m.href} role="menuitem" href={m.href} style={{ display: 'block', padding: '10px 12px', borderRadius: 10, fontSize: 14.5, color: '#F3EEDF', textDecoration: 'none' }}>{m.label}</Link>
                    ))}
                    <button type="button" role="menuitem" className="dz-btn-reset" onClick={() => { logout(); router.push('/'); }} style={{ width: '100%', padding: '10px 12px', borderTop: '1px solid #1F4537', marginTop: 4, fontSize: 14.5, color: '#E5645A' }}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/signin" className="dz-hide-sm" style={{ fontSize: 15, color: '#F3EEDF', textDecoration: 'none' }}>Sign in</Link>
                <Link href="/signup" className="dz-cta" style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 14.5, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Get started</Link>
              </>
            )}
            <button type="button" className="dz-btn-reset dz-menu-btn" aria-label="Menu" aria-expanded={mobile} onClick={() => setMobile((m) => !m)} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #1F4537', alignItems: 'center', justifyContent: 'center', color: '#F3EEDF' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
