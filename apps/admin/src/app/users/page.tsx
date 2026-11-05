'use client';

import { useState } from 'react';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Loading, PageHead } from '@/components/Shell';
import { d } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

export default function UsersPage() {
  const { api } = useRidean();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, error } = useLoad(() => api.admin.users({ q, page }), [api, q, page]);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (
    <>
      <PageHead title="Users" sub={data ? `${data.total} accounts` : undefined} />
      <div className="filters"><input className="inp" placeholder="Search name or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} style={{ minWidth: 280 }} /></div>
      {!data ? <Loading error={error} /> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id}><td>{u.firstName} {u.lastName}</td><td>{u.email}</td><td>{u.phone ?? '—'}</td><td style={{ textTransform: 'capitalize' }}>{u.role}</td><td>{d(u.createdAt)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="pager">
            Page {data.page} of {pages}
            <button className="rd-btn rd-btn-dark btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="rd-btn rd-btn-dark btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}
