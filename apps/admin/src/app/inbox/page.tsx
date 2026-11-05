'use client';

import { useState } from 'react';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Avatar, Btn, Chips, Empty, Loading, PageHead, Pill, useToast } from '@/components/ui';
import { dt } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const FILTERS = [
  ['false', 'Open'],
  ['true', 'Handled'],
  ['', 'All'],
] as const;
type FilterKey = (typeof FILTERS)[number][0];

/** Messages sent through the website contact form. */
export default function InboxPage() {
  const { api } = useRidean();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterKey>('false');
  const { data, error, loading, reload, setData } = useLoad(() => api.admin.contactMessages(filter ? { handled: filter } : {}), [api, filter]);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(id: string, handled: boolean) {
    setBusy(id);
    try {
      await api.admin.markContactMessage(id, handled);
      // Drop it from a filtered list straight away; in "All" just flip its state.
      setData((list) => (list ? (filter ? list.filter((x) => x.id !== id) : list.map((x) => (x.id === id ? { ...x, handled } : x))) : list));
      toast(handled ? 'Marked as handled' : 'Message reopened');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const label = FILTERS.find(([k]) => k === filter)![1].toLowerCase();

  return (
    <>
      <PageHead
        title="Inbox"
        sub={data ? `${data.length} ${filter === '' ? '' : `${label} `}${data.length === 1 ? 'message' : 'messages'} from the contact form` : 'Messages from the website contact form'}
      />

      <div className="az-between">
        <Chips label="Filter messages" options={FILTERS} value={filter} onChange={setFilter} />
        <span className="az-muted" style={{ fontSize: 13.5 }}>Reply from your support mailbox, then mark the message handled.</span>
      </div>

      {!data ? (
        <Loading error={error} onRetry={reload} height={320} />
      ) : data.length === 0 ? (
        <div className="az-card">
          <Empty title={filter === 'false' ? 'Inbox zero' : 'No messages'}>
            {filter === 'false' ? 'Every contact-form message has been handled.' : 'Nothing here yet.'}
          </Empty>
        </div>
      ) : (
        <div className="az-stack" style={{ gap: 12, opacity: loading ? 0.6 : 1 }} aria-busy={loading}>
          {data.map((msg) => (
            <article key={msg.id} className="az-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <Avatar name={msg.name} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="az-between" style={{ alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="az-row" style={{ gap: 8 }}>
                      <strong style={{ fontSize: 15, fontWeight: 600 }}>{msg.name}</strong>
                      <span className="az-badge">{msg.topic}</span>
                      {msg.handled ? <Pill tone="ok">Handled</Pill> : <Pill tone="warn">Open</Pill>}
                    </div>
                    <a href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.topic}`)}`} className="az-a" style={{ fontWeight: 500, display: 'inline-block', marginTop: 4, overflowWrap: 'anywhere' }}>{msg.email}</a>
                  </div>
                  <div className="az-row" style={{ gap: 12 }}>
                    <time className="az-muted" style={{ fontSize: 13 }} dateTime={msg.createdAt}>{dt(msg.createdAt)}</time>
                    <Btn size="sm" kind={msg.handled ? 'o' : 'g'} icon={msg.handled ? 'refresh' : 'check'} disabled={busy === msg.id} onClick={() => void toggle(msg.id, !msg.handled)}>
                      {busy === msg.id ? 'Saving…' : msg.handled ? 'Reopen' : 'Mark handled'}
                    </Btn>
                  </div>
                </div>
                <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.55, color: 'var(--soft)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{msg.message}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
