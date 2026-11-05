'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Supplier } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { PaymentForm } from '@/components/PaymentForm';
import { Loading, PageHead } from '@/components/Shell';
import { Balance } from '@/components/Status';
import { FLOW_LABEL, m } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

type Row = Supplier & { balance: number };

export default function SettlementsPage() {
  const { api } = useRidean();
  const { data, error, reload } = useLoad(() => api.admin.suppliers() as Promise<Row[]>, [api]);
  const [pay, setPay] = useState<Row | null>(null);
  if (!data) return <><PageHead title="Settlements" /><Loading error={error} /></>;
  const weOwe = data.filter((s) => s.balance > 0).reduce((a, s) => a + s.balance, 0);
  const owedUs = data.filter((s) => s.balance < 0).reduce((a, s) => a - s.balance, 0);
  return (
    <>
      <PageHead title="Settlements" sub="Outstanding balances with each supplier" />
      <div className="kpis">
        <div className="kpi"><div className="l">We owe suppliers</div><div className="v pos">{m(weOwe)}</div></div>
        <div className="kpi"><div className="l">Suppliers owe us</div><div className="v neg">{m(owedUs)}</div></div>
        <div className="kpi"><div className="l">Net</div><div className="v">{m(weOwe - owedUs)}</div><div className="s">{weOwe >= owedUs ? 'Payable' : 'Receivable'}</div></div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Supplier</th><th>Payment flow</th><th>Cycle</th><th>Terms</th><th className="num">Balance</th><th /></tr></thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td><Link href={`/suppliers/${s.id}`} className="rd-link">{s.name}</Link></td>
                <td>{FLOW_LABEL[s.terms.paymentFlow]}</td>
                <td style={{ textTransform: 'capitalize' }}>{s.terms.settlementCycle.replace('_', ' ')}</td>
                <td>{s.terms.paymentTerms ?? '—'}</td>
                <td className="num"><Balance v={s.balance} fmt={(n) => m(n)} /></td>
                <td className="num">{s.balance !== 0 && <button className="rd-btn rd-btn-ghost btn-sm" onClick={() => setPay(s)}>{s.balance > 0 ? 'Pay' : 'Record receipt'}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pay && (
        <div className="rd-card rd-stack" style={{ marginTop: 18 }}>
          <div className="rd-row" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Settle with {pay.name}</h3>
            <button className="rd-btn rd-btn-dark btn-sm" onClick={() => setPay(null)}>Close</button>
          </div>
          <PaymentForm key={pay.id} supplierId={pay.id} suggested={pay.balance} onDone={() => { setPay(null); reload(); }} />
        </div>
      )}
    </>
  );
}
