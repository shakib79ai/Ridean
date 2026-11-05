'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminUserRow } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Avatar, Btn, Chips, Delta, Empty, Icon, Kpi, Loading, PageHead, Pager, Pill, useToast } from '@/components/ui';
import { dec, toCsv } from '@/components/partners/shared';
import { downloadText, m } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

type Filter = 'all' | 'active' | 'new' | 'deleted';
const FILTERS = [['all', 'All'], ['active', 'Active'], ['new', 'New this week'], ['deleted', 'Deleted']] as const;

const joined = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const fullName = (u: AdminUserRow) => `${u.firstName} ${u.lastName}`.trim() || u.email;

export default function UsersPage() {
  const { api } = useRidean();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const params = { q: q || undefined, filter: filter === 'all' ? undefined : filter };
  const { data, error, loading, reload } = useLoad(() => api.admin.users({ ...params, page }), [api, q, filter, page]);
  const stats = data?.stats;

  async function exportCsv() {
    setExporting(true);
    try {
      const all: AdminUserRow[] = [];
      let p = 1;
      for (;;) {
        const res = await api.admin.users({ ...params, page: p });
        all.push(...res.items);
        if (p * res.pageSize >= res.total || res.items.length === 0) break;
        p += 1;
      }
      const csv = toCsv([
        ['First name', 'Last name', 'Email', 'Phone', 'Joined', 'Trips', 'Wallet balance', 'Status'],
        ...all.map((u) => [u.firstName, u.lastName, u.email, u.phone ?? '', u.createdAt.slice(0, 10), u.trips, dec(u.walletBalance), u.deleted ? 'Deleted' : 'Active']),
      ]);
      downloadText(`ridean-users-${filter}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      toast(`Exported ${all.length.toLocaleString()} user${all.length === 1 ? '' : 's'}`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHead title="Users" sub={stats ? `${stats.total.toLocaleString()} registered riders` : undefined} />

      {stats ? (
        <div className="az-grid az-g3">
          <Kpi label="Total users" icon="users" value={stats.total.toLocaleString()} sub="Active rider accounts" />
          <Kpi label="New this week" icon="plus" value={stats.newThisWeek.toLocaleString()} sub={<Delta now={stats.newThisWeek} before={stats.newLastWeek} label="vs last week" />} />
          <Kpi
            label="Riders with trips"
            icon="car"
            value={stats.withTrips.toLocaleString()}
            sub={stats.total ? `${((stats.withTrips / stats.total) * 100).toFixed(1)}% of users` : 'No users yet'}
          />
        </div>
      ) : (
        !error && <Loading height={140} />
      )}

      <div className="az-between">
        <Chips
          label="Filter users"
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
          options={FILTERS}
        />
        <div className="az-row">
          <label className="az-search" style={{ display: 'flex', width: 280, maxWidth: '100%' }}>
            <Icon name="search" size={18} />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search name or email" aria-label="Search users by name or email" type="search" />
          </label>
          <Btn kind="g" icon="download" onClick={exportCsv} disabled={exporting || !data || data.total === 0}>{exporting ? 'Exporting…' : 'Export'}</Btn>
        </div>
      </div>

      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <>
          {error && <Loading error={error} onRetry={reload} />}
          <div className="az-twrap" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }} aria-busy={loading}>
            {data.items.length === 0 ? (
              <Empty title="No users found">{q ? `Nothing matches “${q}”.` : 'No accounts in this view yet.'}</Empty>
            ) : (
              <table className="az-t">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Trips</th>
                    <th className="num">Wallet</th>
                    <th>Status</th>
                    <th aria-label="Bookings" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="az-row" style={{ gap: 12, flexWrap: 'nowrap' }}>
                          <Avatar name={fullName(u)} size={36} />
                          <div>
                            {fullName(u)}
                            {u.phone && <span className="sub">{u.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{joined(u.createdAt)}</td>
                      <td>{u.trips.toLocaleString()}</td>
                      <td className="num">{m(u.walletBalance)}</td>
                      <td>{u.deleted ? <Pill tone="mut">Deleted</Pill> : <Pill tone="ok">Active</Pill>}</td>
                      <td className="num">
                        <Link className="az-a" href={`/bookings?q=${encodeURIComponent(u.email)}`}>Bookings</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} noun="users" />
        </>
      )}
    </>
  );
}
