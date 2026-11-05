'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRidean } from '@ridean/web-core';
import type { Invoice } from '@ridean/shared';
import { C, Skeleton } from '@/components/site/ui';
import { EmptyCard, ErrorNote, Icon, PageHead, S, downloadFile, fmtDate, money, serviceMeta, useLoad } from '@/components/account/kit';

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

export default function InvoicesPage() {
  const { api } = useRidean();
  const [month, setMonth] = useState('all');
  const all = useLoad(() => api.invoices(), [api]);
  const filtered = useLoad(() => (month === 'all' ? Promise.resolve(null) : api.invoices({ month })), [api, month]);

  const year = new Date().getFullYear();
  const months = Array.from(new Set((all.data ?? []).map((i) => monthKey(i.issuedAt)))).sort().reverse().slice(0, 3);
  const yearTotals = (all.data ?? []).filter((i) => new Date(i.issuedAt).getFullYear() === year);
  const currency = yearTotals[0]?.currency ?? all.data?.[0]?.currency ?? 'USD';
  const yearTotal = yearTotals.reduce((n, i) => n + i.total, 0);
  const rows = month === 'all' ? all.data : filtered.data;
  const loading = month === 'all' ? all.loading && !all.data : filtered.loading || !filtered.data;
  const error = all.error || (month !== 'all' ? filtered.error : '');

  function exportCsv() {
    if (!rows?.length) return;
    const head = ['Invoice', 'Date', 'Reference', 'Trip', 'Paid with', 'Amount', 'Currency'];
    const lines = rows.map((i) => [i.number, i.issuedAt.slice(0, 10), i.reference, i.description, i.paidWith, (i.total / 100).toFixed(2), i.currency].map(csvCell).join(','));
    downloadFile(`ridean-statement-${month === 'all' ? 'all' : month}.csv`, [head.map(csvCell).join(','), ...lines].join('\n'), 'text/csv;charset=utf-8');
  }

  const grid = 'dz-acct-inv-row';

  return (
    <div style={S.page}>
      <PageHead
        title="Invoices"
        action={
          <button type="button" onClick={exportCsv} disabled={!rows?.length} style={{ ...S.ghost, opacity: rows?.length ? 1 : 0.5, cursor: rows?.length ? 'pointer' : 'not-allowed' }}>
            <Icon name="download" size={17} />
            Export statement
          </button>
        }
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="radiogroup" aria-label="Month">
          {['all', ...months].map((m) => (
            <button key={m} type="button" role="radio" aria-checked={month === m} className={`dz-chip ${month === m ? 'on' : ''}`} onClick={() => setMonth(m)}>
              {m === 'all' ? 'All' : monthName(m)}
            </button>
          ))}
        </div>
        {all.data && (
          <span style={{ fontSize: 14, color: C.muted }}>
            Total spent in {year} · <span style={{ color: C.cream, fontWeight: 600 }}>{money(yearTotal, currency)}</span>
          </span>
        )}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <Skeleton h={260} />
      ) : rows && rows.length === 0 ? (
        <EmptyCard text={month === 'all' ? 'No invoices yet — you’ll get one for every paid trip.' : 'No invoices for this month.'} action={month === 'all' ? <Link href="/ride" style={S.goldLink}>Book a ride</Link> : undefined} />
      ) : rows ? (
        <div style={{ ...S.panel, padding: 0, overflow: 'hidden' }}>
          <div className={`${grid} dz-acct-inv-head`} style={{ padding: '14px 20px', fontSize: 12.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, borderBottom: `1px solid ${C.line}` }}>
            <span>Invoice</span>
            <span>Date</span>
            <span>Trip</span>
            <span>Paid with</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span />
          </div>
          {rows.map((i, idx) => (
            <Link key={i.id} href={`/account/invoices/${i.id}`} className={grid} style={{ alignItems: 'center', padding: '16px 20px', fontSize: 15, borderBottom: idx === rows.length - 1 ? undefined : `1px solid ${C.line}` }}>
              <span style={{ color: C.gold }}>{i.number}</span>
              <span style={{ color: C.soft }}>{fmtDate(i.issuedAt)}</span>
              <span>{tripLabel(i)}</span>
              <span style={{ color: C.soft }}>{i.paidWith}</span>
              <span style={{ textAlign: 'right', fontWeight: 600 }}>{money(i.total, i.currency)}</span>
              <span style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, fontSize: 13.5, color: C.gold }}>
                <Icon name="download" size={16} />
                PDF
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
