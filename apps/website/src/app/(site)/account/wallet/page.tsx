'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRidean } from '@ridean/web-core';
import { C, Skeleton, useToast } from '@/components/site/ui';
import {
  EmptyCard, ErrorNote, Icon, ListRow, Muted, PageHead, RowChevron, S, SectionHead, StripeConfirm, cardLabel, errMsg, fmtDay, money, signedMoney, useLoad, type IconName,
} from '@/components/account/kit';

const AMOUNTS = [2500, 5000, 10000, 20000];

const txIcon = (amount: number, description: string): IconName => (amount < 0 ? 'car' : description.startsWith('Refund') ? 'refund' : 'plus');

export default function WalletPage() {
  const { api, stripeKey } = useRidean();
  const toast = useToast();
  const [busy, setBusy] = useState<number | null>(null);
  const [topUpError, setTopUpError] = useState('');
  const [pending, setPending] = useState<{ secret: string; amount: number } | null>(null);

  const wallet = useLoad(() => api.wallet(), [api]);
  const cards = useLoad(() => api.paymentMethods().catch(() => []), [api]);
  const def = cards.data?.find((c) => c.isDefault) ?? null;
  const w = wallet.data;
  const currency = w?.currency ?? 'USD';

  async function topUp(amount: number) {
    setTopUpError('');
    setBusy(amount);
    try {
      const r = await api.topUpWallet(amount);
      if (r.clientSecret && stripeKey) {
        setPending({ secret: r.clientSecret, amount });
      } else {
        await wallet.reload();
        toast(`Added ${money(amount, currency)} to your wallet`);
      }
    } catch (e) {
      setTopUpError(errMsg(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={S.page}>
      <PageHead title="Wallet" />

      {wallet.error && <ErrorNote>{wallet.error}</ErrorNote>}

      <div className="dz-split" style={{ gap: 20 }}>
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', padding: 28, background: 'linear-gradient(135deg,#1E5442 0%,#0E2A22 60%,#0A1F18 100%)', border: '1px solid rgba(217,169,79,.35)', minHeight: 160 }}>
          <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: 110, background: 'radial-gradient(circle,rgba(242,210,122,.25),transparent 70%)' }} />
          <div style={{ fontSize: 14, color: C.muted }}>Ridean Wallet balance</div>
          {w ? (
            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 52, fontWeight: 600, marginTop: 4, position: 'relative' }}>{money(w.balance, currency)}</div>
          ) : (
            <Skeleton h={56} style={{ width: 200, marginTop: 8 }} />
          )}
          <div style={{ fontSize: 13, color: C.muted, marginTop: 12, position: 'relative' }}>Use your balance at checkout for rides, transfers and rentals.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div style={{ ...S.panel, padding: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
              <SectionHead title="Add funds" size={20} />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {AMOUNTS.map((a) => (
                  <button key={a} type="button" className="dz-chip" disabled={busy !== null || !!pending || !w} onClick={() => topUp(a)} style={{ flex: 1, textAlign: 'center', opacity: busy !== null && busy !== a ? 0.6 : 1 }}>
                    {busy === a ? '…' : `+${money(a, currency).replace(/\.00$/, '')}`}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>{def ? `Charged to ${cardLabel(def)}` : 'Charged to your card at checkout'}</div>
              {topUpError && <ErrorNote>{topUpError}</ErrorNote>}
              {pending && stripeKey && (
                <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
                  <div style={{ fontSize: 14, marginBottom: 10 }}>Confirm your {money(pending.amount, currency)} top-up</div>
                  <StripeConfirm
                    stripeKey={stripeKey}
                    clientSecret={pending.secret}
                    mode="pay"
                    submitLabel={`Add ${money(pending.amount, currency)}`}
                    onCancel={() => setPending(null)}
                    onDone={() => {
                      setPending(null);
                      toast('Top-up received');
                      // The webhook credits the wallet; give it a moment.
                      setTimeout(() => wallet.reload(), 2500);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div style={{ ...S.panel, padding: '2px 16px' }}>
            <ListRow
              icon="card"
              href="/account/payment-methods"
              title="Payment methods"
              sub={cards.loading ? ' ' : def ? `${cardLabel(def)} · default` : cards.data?.length ? `${cards.data.length} saved` : 'No saved cards yet'}
              right={<RowChevron />}
              last
            />
          </div>
        </div>
      </div>

      <SectionHead title="Recent activity" size={24} link={<Link href="/account/invoices" style={S.goldLink}>Invoices</Link>} />
      {wallet.loading && !w ? (
        <Skeleton h={220} />
      ) : w && w.transactions.length === 0 ? (
        <EmptyCard text="No wallet activity yet. Add funds to get started." />
      ) : w ? (
        <div style={{ ...S.panel, padding: '2px 18px' }}>
          {w.transactions.map((t, i) => (
            <ListRow
              key={t.id}
              icon={txIcon(t.amount, t.description)}
              title={t.description}
              sub={fmtDay(t.createdAt)}
              last={i === w.transactions.length - 1}
              right={<span style={{ fontSize: 15, fontWeight: 600, color: t.amount > 0 ? C.ok : C.cream, whiteSpace: 'nowrap' }}>{signedMoney(t.amount, currency)}</span>}
            />
          ))}
        </div>
      ) : null}
      {!stripeKey && <Muted><Icon name="lock" size={13} color={C.muted} style={{ verticalAlign: '-2px', marginRight: 6 }} />Test mode — top-ups are added instantly and no card is charged.</Muted>}
    </div>
  );
}
