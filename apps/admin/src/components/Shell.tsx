'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Avatar, HeadProvider, Icon, ToastProvider } from './ui';

const NAV = [
  ['/', 'Dashboard', 'dashboard'],
  ['/bookings', 'Bookings', 'calendar'],
  ['/bookings/new', 'New booking', 'plus'],
  ['/drivers', 'Drivers & Suppliers', 'car'],
  ['/users', 'Users', 'users'],
  ['/settlements', 'Settlements', 'bank'],
  ['/earnings', 'Earnings', 'trend'],
  ['/reports', 'Transaction report', 'report'],
  ['/suppliers', 'Supplier accounts', 'ledger'],
  ['/settings', 'Settings', 'settings'],
  ['/help', 'Help & support', 'help'],
] as const;

export const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', ops: 'Operations', finance: 'Finance', customer: 'Customer' };

function active(path: string, href: string) {
  if (href === '/') return path === '/';
  if (href === '/bookings') return path === '/bookings' || (path.startsWith('/bookings/') && !path.startsWith('/bookings/new'));
  return path === href || path.startsWith(href + '/');
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? '/';
  const router = useRouter();
  const { user, ready, logout, api } = useRidean();
  const isLogin = path === '/login';
  const staff = !!user && user.role !== 'customer';
  const [head, setHead] = useState<{ title: string; sub?: string; actions?: ReactNode; searchPlaceholder?: string }>({ title: '' });
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (ready && !staff && !isLogin) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [ready, staff, isLogin, path, router]);

  useEffect(() => setOpen(false), [path]);

  // Bell shows unhandled messages from the website/app contact form.
  useEffect(() => {
    if (!staff) return;
    let live = true;
    api.admin
      .contactMessages({ handled: 'false' })
      .then((m) => live && setUnread(m.length))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [api, staff, path]);

  if (isLogin) return <ToastProvider>{children}</ToastProvider>;
  if (!ready || !staff) return <div style={{ padding: 40 }} className="az-muted">Loading…</div>;

  const name = `${user.firstName} ${user.lastName}`.trim();
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/bookings?q=${encodeURIComponent(term)}`);
  };

  return (
    <ToastProvider>
      <HeadProvider value={{ set: setHead }}>
        <div className="az-shell">
          <aside className={`az-side ${open ? 'open' : ''}`} aria-label="Main navigation">
            <div className="az-brand"><div className="az-word">Ridean</div><small>ADMIN</small></div>
            <nav className="az-nav">
              {NAV.map(([href, label, icon]) => (
                <Link key={href} href={href} aria-current={active(path, href) ? 'page' : undefined}>
                  <Icon name={icon} size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <div style={{ flex: 1 }} />
            <div className="az-me">
              <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
                <Avatar name={name} />
                <div style={{ minWidth: 0 }}>
                  <div className="n" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div className="r">{ROLE_LABEL[user.role] ?? user.role}</div>
                </div>
              </Link>
              <button type="button" aria-label="Sign out" title="Sign out" onClick={() => { logout(); router.replace('/login'); }}>
                <Icon name="logout" size={18} />
              </button>
            </div>
          </aside>
          <div className="az-main">
            <header className="az-top">
              <div className="az-row" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                <button type="button" className="az-menu-btn" aria-label="Open menu" onClick={() => setOpen((o) => !o)}><Icon name="menu" size={20} /></button>
                <div style={{ minWidth: 0 }}>
                  <h1>{head.title}</h1>
                  {head.sub && <div className="sub">{head.sub}</div>}
                </div>
              </div>
              <div className="az-top-r">
                {head.actions}
                <form className="az-search" role="search" onSubmit={search}>
                  <Icon name="search" size={18} />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={head.searchPlaceholder ?? 'Search bookings, customers…'} aria-label="Search bookings" />
                </form>
                <Link href="/inbox" className="az-bell" aria-label={unread ? `${unread} new messages` : 'Messages'} title="Messages">
                  <Icon name="bell" size={19} />
                  {unread > 0 && <span className="dot" />}
                </Link>
                <Link href="/profile" aria-label="Your profile"><Avatar name={name} size={42} /></Link>
              </div>
            </header>
            <main className="az-content">{children}</main>
          </div>
        </div>
      </HeadProvider>
    </ToastProvider>
  );
}
