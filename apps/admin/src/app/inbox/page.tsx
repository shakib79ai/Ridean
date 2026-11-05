'use client';

import { useState } from 'react';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Loading, PageHead } from '@/components/Shell';
import { dt } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

/** Messages sent through the website contact form. */
export default function InboxPage() {
  const { api } = useRidean();
  const [filter, setFilter] = useState<'false' | 'true' | ''>('false');
  const { data, error, reload } = useLoad(() => api.admin.contactMessages(filter ? { handled: filter } : {}), [api, filter]);
  const [open, setOpen] = useState<string | null>(null);

  async function toggle(id: string, handled: boolean) {
    await api.admin.markContactMessage(id, handled);
    reload();
  }

  return (
    <>
      <PageHead title="Inbox" sub="Messages from the website contact form">
        <div className="seg2">
          <button aria-pressed={filter === 'false'} onClick={() => setFilter('false')}>Open</button>
          <button aria-pressed={filter === 'true'} onClick={() => setFilter('true')}>Handled</button>
          <button aria-pressed={filter === ''} onClick={() => setFilter('')}>All</button>
        </div>
      </PageHead>
      {!data ? <Loading error={error} /> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Received</th><th>From</th><th>Topic</th><th>Message</th><th /></tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={5} className="rd-muted">No messages.</td></tr>}
              {data.map((m) => (
                <tr key={m.id} className="click" onClick={() => setOpen(open === m.id ? null : m.id)}>
                  <td>{dt(m.createdAt)}</td>
                  <td><strong>{m.name}</strong><div className="rd-muted" style={{ fontSize: 12 }}>{m.email}</div></td>
                  <td>{m.topic}</td>
                  <td style={{ whiteSpace: open === m.id ? 'pre-wrap' : 'nowrap', maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</td>
                  <td className="num">
                    <button className="rd-btn rd-btn-dark btn-sm" onClick={(e) => { e.stopPropagation(); void toggle(m.id, !m.handled); }}>{m.handled ? 'Reopen' : 'Mark handled'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="legend">Reply from your support mailbox to the sender's email address, then mark the message handled.</p>
    </>
  );
}
