'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { Invoice } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { EmptyCard, ErrorNote, Icon, S, Screen, ScreenHead, downloadFile, fmtDate, money, serviceMeta, useLoad } from '@/components/account/kit';

const monthKey = (iso: string) => iso.slice(0, 7);
const monthName = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  const name = d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  return y === new Date().getFullYear() ? name : `${name} ${y}`;
};
const tripLabel = (i: Invoice) => {
  const parts = i.description.split(' · ');
  return parts.length > 1 ? `${serviceMeta(i.service).label} · ${parts[1]}` : i.description;
};
const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

function Invoices() {
  const { api } = useRidean();
  const toast = useToast();
  const [month, setMonth] = useState('all');
  const all = useLoad(() => api.invoices(), [api]);
  const filtered = useLoad(() => (month === 'all' ? Promise.resolve(null) : api.invoices({ month })), [api, month]);

  const year = new Date().getFullYear();
  const months = Array.from(new Set((all.data ?? []).map((i) => monthKey(i.issuedAt)))).sort().reverse().slice(0, 3);
  const thisYear = (all.data ?? []).filter((i) => new Date(i.issuedAt).getFullYear() === year);
  const currency = thisYear[0]?.currency ?? all.data?.[0]?.currency ?? 'USD';
  const yearTotal = thisYear.reduce((n, i) => n + i.total, 0);
  const rows = month === 'all' ? all.data : filtered.data;
  const loading = month === 'all' ? all.loading && !all.data : filtered.loading || !filtered.data;
  const error = all.error || (month !== 'all' ? filtered.error : '');

  function exportCsv() {
    if (!rows?.length) return;
    const head = ['Invoice', 'Date', 'Reference', 'Trip', 'Paid with', 'Amount', 'Currency'];
    const lines = rows.map((i) => [i.number, i.issuedAt.slice(0, 10), i.reference, i.description, i.paidWith, (i.total / 100).toFixed(2), i.currency].map(csvCell).join(','));
    downloadFile(`ridean-statement-${month === 'all' ? 'all' : month}.csv`, [head.map(csvCell).join(','), ...lines].join('\n'), 'text/csv;charset=utf-8');
    toast('Statement downloaded');
  }

  const canExport = !!rows?.length && !loading;

  return (
    <Screen>
      <ScreenHead title="Invoices" fallback="/account" />
      <div style={S.body}>
        {months.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="radiogroup" aria-label="Month">
            {['all', ...months].map((m) => (
              <button key={m} type="button" role="radio" aria-checked={month === m} className={`dz-chip ${month === m ? 'on' : ''}`} onClick={() => setMonth(m)}>
                {m === 'all' ? 'All' : monthName(m)}
              </button>
            ))}
          </div>
        )}

        <div style={{ ...S.panel, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', color: '#9FB2A6' }}>Total spent · {year}</div>
              {all.data ? (
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '28px', fontWeight: 600, marginTop: '2px', overflowWrap: 'anywhere' }}>{money(yearTotal, currency)}</div>
              ) : all.error ? (
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '28px', fontWeight: 600, marginTop: '2px' }}>—</div>
              ) : (
                <Skeleton h={34} style={{ width: 130, marginTop: 4, borderRadius: 8 }} />
              )}
            </div>
            <button type="button" onClick={exportCsv} disabled={!canExport} className="pa-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#D9A94F', flexShrink: 0 }}>
              <Icon name="download" size={17} />
              Export
            </button>
          </div>
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        {loading ? (
          <Skeleton h={260} />
        ) : rows && rows.length === 0 ? (
          <EmptyCard text={month === 'all' ? 'No invoices yet — you’ll get one for every paid trip.' : 'No invoices for this month.'} action={month === 'all' ? <Link href="/book/ride" style={{ ...S.goldLink, fontSize: 14 }}>Book a ride</Link> : undefined} />
        ) : rows ? (
          <div style={S.list}>
            {rows.map((i, idx) => (
              <Link key={i.id} href={`/account/invoices/${i.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: idx === rows.length - 1 ? undefined : '1px solid #1F4537' }}>
                <div style={S.iconBox}><Icon name={serviceMeta(i.service).icon} /></div>
                <div style={{ flex: 1, minWidth: '0' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tripLabel(i)}</div>
                  <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtDate(i.issuedAt)} · {i.number}</div>
                </div>
                <span style={{ fontSize: '14.5px', fontWeight: 600, whiteSpace: 'nowrap', color: C.cream }}>{money(i.total, i.currency)}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </Screen>
  );
}

export default function InvoicesPage() {
  return (
    <RequireAuth>
      <Invoices />
    </RequireAuth>
  );
}
