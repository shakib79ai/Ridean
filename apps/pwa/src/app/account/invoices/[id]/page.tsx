'use client';

import { use } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { Invoice } from '@ridean/shared';
import { Skeleton, useToast } from '@/components/site/ui';
import { ErrorNote, Icon, S, Screen, ScreenHead, fmtDate, money, useLoad } from '@/components/account/kit';

const Divider = () => <div style={{ height: '1px', background: '#1F4537', margin: '6px 0' }} />;

const lineAmount = (amount: number, currency: string) => (amount < 0 ? `−${money(-amount, currency)}` : money(amount, currency));

function summary(i: Invoice) {
  return [
    `Ridean invoice ${i.number}`,
    `Booking ${i.reference} · issued ${fmtDate(i.issuedAt)}`,
    i.description,
    ...i.lines.map((l) => `${l.label}: ${lineAmount(l.amount, i.currency)}`),
    `Total paid: ${money(i.total, i.currency)} (${i.paidWith})`,
  ].join('\n');
}

function InvoiceDetail({ id }: { id: string }) {
  const { api } = useRidean();
  const toast = useToast();
  const inv = useLoad(() => api.invoice(id), [api, id]);
  const i = inv.data;

  async function share() {
    if (!i) return;
    const text = summary(i);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `Ridean invoice ${i.number}`, text });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        // fall through to copying
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Invoice summary copied');
    } catch {
      toast('Couldn’t copy — please try again');
    }
  }

  return (
    <Screen>
      <ScreenHead title="Invoice" sub={i ? `${i.number} · ${fmtDate(i.issuedAt)}` : undefined} fallback="/account/invoices" />
      <div style={S.body}>
        {inv.error && <ErrorNote>{inv.error}</ErrorNote>}
        {!i && inv.loading ? (
          <Skeleton h={360} />
        ) : i ? (
          <>
            <div style={{ ...S.panel, padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ ...S.wordmark, fontSize: '26px' }}>Ridean</span>
                  <div style={{ fontSize: '11.5px', color: '#9FB2A6', marginTop: 2 }}>Booking {i.reference}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#9FB2A6', lineHeight: 1.5 }}>Best My Flight Inc.<br />1088 Liberty Ave<br />Brooklyn, NY 11208</div>
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '13px', padding: '6px 0' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#9FB2A6', fontSize: '12px' }}>Billed to</div>
                  <div style={{ marginTop: '3px', overflowWrap: 'anywhere' }}>{i.billedTo.name}</div>
                  {i.billedTo.company && <div style={{ marginTop: '2px', color: '#9FB2A6', fontSize: '12px', overflowWrap: 'anywhere' }}>{i.billedTo.company}</div>}
                </div>
                <div style={{ textAlign: 'right', minWidth: 0 }}>
                  <div style={{ color: '#9FB2A6', fontSize: '12px' }}>Paid with</div>
                  <div style={{ marginTop: '3px', overflowWrap: 'anywhere' }}>{i.paidWith}</div>
                </div>
              </div>
              <Divider />
              <div style={{ fontSize: '13px', color: '#9FB2A6', padding: '6px 0', overflowWrap: 'anywhere' }}>{i.description}</div>
              {i.lines.map((l, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: '14px', color: '#9FB2A6', fontWeight: 400 }}>
                  <span>{l.label}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{lineAmount(l.amount, i.currency)}</span>
                </div>
              ))}
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '15px', color: '#F3EEDF', fontWeight: 600 }}>
                <span>Total paid</span>
                <span>{money(i.total, i.currency)}</span>
              </div>
            </div>
            <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={share} style={{ ...S.ghost, flex: 1 }}>
                <Icon name="send" />
                Share
              </button>
            </div>
            <button type="button" className="dz-cta no-print" onClick={() => window.print()} title="Opens the print dialog — choose “Save as PDF”" style={S.cta}>
              <span>Download PDF</span>
            </button>
          </>
        ) : null}
      </div>
    </Screen>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth>
      <InvoiceDetail id={id} />
    </RequireAuth>
  );
}
