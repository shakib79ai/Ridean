'use client';

import Link from 'next/link';
import { use, type ReactNode } from 'react';
import { useRidean } from '@ridean/web-core';
import { C, Skeleton } from '@/components/site/ui';
import { ErrorNote, Icon, ListRow, PageHead, RowChevron, S, fmtDate, money, useLoad } from '@/components/account/kit';

const PRINT_CSS = `
@media print {
  .dz-header, header, footer, .dz-side, .dz-account-chips, .no-print { display: none !important; }
  .dz-account, .dz-acct-inv { display: block !important; }
  .dz-container { padding: 0 !important; max-width: none !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { margin: 14mm; }
}`;

const Divider = () => <div style={{ height: 1, background: C.line, margin: '6px 0' }} />;

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { api } = useRidean();
  const inv = useLoad(() => api.invoice(id), [api, id]);
  const i = inv.data;

  const back = (
    <Link href="/account/invoices" className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14.5, color: C.gold }}>
      <Icon name="left" size={16} />
      All invoices
    </Link>
  );

  const field = (label: string, value: ReactNode) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12.5, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 15, marginTop: 4, overflowWrap: 'anywhere' }}>{value}</div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{PRINT_CSS}</style>
      <PageHead title="Invoice" action={back} />
      {inv.error && <ErrorNote>{inv.error}</ErrorNote>}
      {!i && inv.loading ? (
        <div className="dz-acct-inv"><Skeleton h={420} /><Skeleton h={160} /></div>
      ) : i ? (
        <div className="dz-acct-inv">
          <div style={{ ...S.panel, padding: 36 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ ...S.wordmark, fontSize: 34 }}>Ridean</span>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Invoice · {i.number}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Booking {i.reference}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                  Ridean · Best My Flight Inc.
                  <br />
                  1088 Liberty Ave
                  <br />
                  Brooklyn, NY 11208
                </div>
              </div>
              <Divider />
              <div className="dz-acct-inv-cols">
                {field('Billed to', (
                  <>
                    {i.billedTo.name}
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{i.billedTo.email}</div>
                    {i.billedTo.company && <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{i.billedTo.company}</div>}
                  </>
                ))}
                {field('Issued', fmtDate(i.issuedAt))}
                {field('Paid with', i.paidWith)}
              </div>
              <Divider />
              <div style={{ fontSize: 14, color: C.muted, overflowWrap: 'anywhere' }}>{i.description}</div>
              {i.lines.map((l, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 0', fontSize: 14, color: C.muted }}>
                  <span>{l.label}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{l.amount < 0 ? `−${money(-l.amount, i.currency)}` : money(l.amount, i.currency)}</span>
                </div>
              ))}
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 15, color: C.cream, fontWeight: 600 }}>
                <span>Total paid</span>
                <span>{money(i.total, i.currency)}</span>
              </div>
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            <button type="button" className="dz-cta" onClick={() => window.print()} style={S.cta} title="Opens the print dialog — choose “Save as PDF”">
              <span>Download PDF</span>
            </button>
            <button type="button" onClick={() => window.print()} style={{ ...S.ghost, height: 48 }}>
              <Icon name="doc" />
              Print
            </button>
            <div style={{ ...S.panel, padding: '2px 16px' }}>
              <ListRow icon="help" href="/contact" title="Question about this charge?" sub="Send us a message and we’ll get back to you" right={<RowChevron />} last />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
