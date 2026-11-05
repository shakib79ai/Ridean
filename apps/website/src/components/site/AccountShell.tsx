'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import { C, initials } from './ui';

const ic = (d: ReactNode, active: boolean) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? C.yellow : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{d}</svg>
);

const ITEMS: { href: string; label: string; exact?: boolean; icon: ReactNode }[] = [
  { href: '/account', label: 'Dashboard', exact: true, icon: <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /> },
  { href: '/account/trips', label: 'Trips', icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3.5" /></> },
  { href: '/account/wallet', label: 'Wallet', icon: <><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18M16 15h2" /><path d="M6 6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></> },
  { href: '/account/profile', label: 'Profile', icon: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></> },
  { href: '/account/payment-methods', label: 'Payment methods', icon: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></> },
  { href: '/account/addresses', label: 'Saved addresses', icon: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></> },
  { href: '/account/business', label: 'Business account', icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></> },
  { href: '/account/invoices', label: 'Invoices', icon: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></> },
  { href: '/account/settings', label: 'Settings', icon: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 21h4" /></> },
  { href: '/help', label: 'Help & support', icon: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.3 1-1.3 1.9M12 17h.01" /></> },
];

function Sidebar() {
  const path = usePathname() ?? '';
  const router = useRouter();
  const { user, logout } = useRidean();
  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : undefined;
  return (
    <div className="dz-side" style={{ alignSelf: 'start' }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, position: 'sticky', top: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px 14px', borderBottom: `1px solid ${C.line}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'linear-gradient(135deg,#E2B04A,#9C6F1F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: '#0A1F18', flexShrink: 0 }}>{initials(user)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user ? `${user.firstName} ${user.lastName}` : ' '}</div>
              {memberSince && (
                <div style={{ marginTop: 5 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 999, background: 'rgba(217,169,79,.14)', color: C.gold, fontSize: 11.5, fontWeight: 600 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" /></svg>
                    Member since {memberSince}
                  </span>
                </div>
              )}
            </div>
          </div>
          <nav aria-label="Account" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ITEMS.map((it) => {
              const active = it.exact ? path === it.href : path.startsWith(it.href);
              return (
                <Link key={it.href} href={it.href} aria-current={active ? 'page' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, fontSize: 15, textDecoration: 'none', background: active ? C.panel2 : 'transparent', color: active ? C.cream : C.soft, fontWeight: active ? 600 : 400 }}>
                  {ic(it.icon, active)}
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <button type="button" className="dz-btn-reset" onClick={() => { logout(); router.push('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: `1px solid ${C.line}`, fontSize: 15, color: C.bad }}>
            {ic(<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />, false)}
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

/** Two-column account layout (sidebar + content). Requires sign-in. On phones the sidebar collapses into a chip row. */
export function AccountShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? '';
  return (
    <div className="dz-container">
      <RequireAuth>
        <nav className="dz-account-chips" aria-label="Account sections">
          {ITEMS.map((it) => {
            const active = it.exact ? path === it.href : path.startsWith(it.href);
            return <Link key={it.href} href={it.href} className={`dz-chip ${active ? 'on' : ''}`}>{it.label}</Link>;
          })}
        </nav>
        <div className="dz-account">
          <Sidebar />
          <div style={{ minWidth: 0 }}>{children}</div>
        </div>
      </RequireAuth>
    </div>
  );
}
