'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Supplier } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Loading, PageHead } from '@/components/Shell';
import { Balance } from '@/components/Status';
import { FLOW_LABEL, m, svc } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

export default function SuppliersPage() {
  const { api, user } = useRidean();
  const router = useRouter();
  const { data, error } = useLoad(() => api.admin.suppliers() as Promise<(Supplier & { balance: number })[]>, [api]);
  return (
    <>
      <PageHead title="Supplier accounts" sub="API partners, commercial terms and balances">
        {user?.role === 'admin' && <Link href="/suppliers/new" className="rd-btn btn-sm">Add supplier</Link>}
      </PageHead>
      {!data ? <Loading error={error} /> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Supplier</th><th>Adapter</th><th>Services</th><th>Rate</th><th>Markup</th><th>Payment flow</th><th>Status</th><th className="num">Balance</th></tr></thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="click" onClick={() => router.push(`/suppliers/${s.id}`)}>
                  <td><strong>{s.name}</strong><div className="rd-muted" style={{ fontSize: 12 }}>{s.code}</div></td>
                  <td>{s.adapter}</td>
                  <td style={{ whiteSpace: 'normal', maxWidth: 260 }}>{s.services.map(svc).join(', ')}</td>
                  <td>{s.terms.inventoryType === 'gross' ? `Gross · ${s.terms.commissionPct}% commission` : 'Net'}</td>
                  <td>{s.terms.markupType === 'percent' ? `${s.terms.markupValue}%` : m(s.terms.markupValue)}</td>
                  <td>{FLOW_LABEL[s.terms.paymentFlow]}</td>
                  <td>{s.active ? <span className="rd-pill rd-pill-ok">Active</span> : <span className="rd-pill rd-pill-mut">Paused</span>}</td>
                  <td className="num"><Balance v={s.balance} fmt={(n) => m(n)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
