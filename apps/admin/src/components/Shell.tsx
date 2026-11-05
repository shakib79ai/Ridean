'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useRidean } from '@ridean/web-core/src/api-context';

const NAV = [
  ['/', 'Dashboard'],
  ['/bookings', 'Bookings'],
  ['/reports', 'Transaction report'],
  ['/earnings', 'Earnings'],
  ['/settlements', 'Settlements'],
  ['/suppliers', 'Supplier accounts'],
  ['/users', 'Users'],
  ['/inbox', 'Inbox'],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? '/';
  const router = useRouter();
  const { user, ready, logout } = useRidean();
  const isLogin = path === '/login';
  const staff = !!user && user.role !== 'customer';

  useEffect(() => {
    if (ready && !staff && !isLogin) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [ready, staff, isLogin, path, router]);

  if (isLogin) return <>{children}</>;
  if (!ready || !staff) return <div style={{ padding: 40 }} className="rd-muted">Loading…</div>;

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Ridean<small>Admin</small></div>
        {NAV.map(([href, label]) => (
          <Link key={href} href={href} aria-current={(href === '/' ? path === '/' : path.startsWith(href)) ? 'page' : undefined}>{label}</Link>
        ))}
        <div className="grow" />
        <div className="rd-muted" style={{ fontSize: 12.5, padding: '0 12px 8px' }}>{user.firstName} {user.lastName}<br />{user.role}</div>
        <button className="rd-btn rd-btn-dark btn-sm" onClick={() => { logout(); router.replace('/login'); }}>Sign out</button>
      </aside>
      <div className="content">{children}</div>
    </div>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="ph">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children && <div className="rd-row" style={{ flexWrap: 'wrap' }}>{children}</div>}
    </div>
  );
}

export function Loading({ error }: { error?: string | null }) {
  return error ? <div className="rd-alert">{error}</div> : <div className="rd-skeleton" style={{ height: 220 }} />;
}
