'use client';

import { useState } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { SavedCard } from '@ridean/shared';
import { ErrorNote, Skeleton, useToast } from '@/components/site/ui';
import { Icon, ListRow, LogoHeader, RowChevron, errMsg, fmtDay, iconBox, money, sectionH2, signedMoney, useLoad, type IconName } from '@/components/trips/kit';
import { StripePayConfirm } from '@/components/trips/StripeConfirm';

const AMOUNTS = [2500, 5000, 10000, 20000];

const txIcon = (amount: number, description: string): IconName => (amount < 0 ? 'car' : description.startsWith('Refund') ? 'refund' : 'plus');

const brandName = (b: string) => {
  const k = (b || '').toLowerCase();
  const map: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', american_express: 'Amex', discover: 'Discover', diners: 'Diners', jcb: 'JCB', unionpay: 'UnionPay' };
  return map[k] ?? (k ? k[0].toUpperCase() + k.slice(1) : 'Card');
};
const cardLabel = (c: SavedCard) => `${brandName(c.brand)} •••• ${c.last4}`;

export default function WalletPage() {
  return (
    <div style={{ paddingBottom: '92px' }}>
      <LogoHeader />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
        <RequireAuth>
          <Wallet />
        </RequireAuth>
      </div>
    </div>
  );
}

function Wallet() {
  const { api, stripeKey } = useRidean();
  const toast = useToast();
  const [busy, setBusy] = useState<number | null>(null);
  const [topUpError, setTopUpError] = useState('');
  const [pending, setPending] = useState<{ secret: string; amount: number } | null>(null);

  const wallet = useLoad(() => api.wallet(), [api]);
  const cards = useLoad(() => api.paymentMethods().catch(() => [] as SavedCard[]), [api]);
  const def = cards.data?.find((c) => c.isDefault) ?? null;
  const w = wallet.data;
  const currency = w?.currency ?? 'USD';

  async function topUp(amount: number) {
    setTopUpError('');
    setBusy(amount);
    try {
      const r = await api.topUpWallet(amount);
      if (r?.clientSecret && stripeKey) {
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

  const cardsSub = cards.loading ? ' ' : def ? `${cardLabel(def)} · default` : cards.data?.length ? `${cards.data.length} saved` : 'No saved cards yet';

  return (
    <>
      {wallet.error && <ErrorNote>{wallet.error}</ErrorNote>}

      <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', padding: '22px', background: 'linear-gradient(135deg,#1E5442 0%,#0E2A22 60%,#0A1F18 100%)', border: '1px solid rgba(217,169,79,.35)' }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '90px', background: 'radial-gradient(circle,rgba(242,210,122,.25),transparent 70%)' }}></div>
        <div style={{ fontSize: '13px', color: '#9FB2A6', position: 'relative' }}>Ridean Wallet balance</div>
        {w ? (
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '40px', fontWeight: 600, color: '#F3EEDF', marginTop: '4px', position: 'relative', overflowWrap: 'anywhere' }}>{money(w.balance, currency)}</div>
        ) : (
          <Skeleton h={48} style={{ width: 170, marginTop: 8 }} />
        )}
        <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '10px', position: 'relative' }}>Use your balance at checkout for rides, transfers and rentals.</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 0 -2px' }}>
        <h2 style={sectionH2}>Add funds</h2>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            className="dz-chip"
            disabled={busy !== null || !!pending || !w}
            onClick={() => topUp(a)}
            aria-label={`Add ${money(a, currency)}`}
            style={{ flex: 1, minWidth: 0, textAlign: 'center', padding: '9px 0', opacity: (busy !== null && busy !== a) || !w ? 0.6 : 1, cursor: busy !== null || !!pending || !w ? 'not-allowed' : 'pointer' }}
          >
            {busy === a ? '…' : `+${money(a, currency).replace(/\.00$/, '')}`}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '-4px' }}>
        {!stripeKey ? 'Test mode — top-ups are added instantly and no card is charged.' : def ? `Charged to ${cardLabel(def)}` : 'You’ll confirm your card for each top-up.'}
      </div>
      {topUpError && <ErrorNote>{topUpError}</ErrorNote>}
      {pending && stripeKey && (
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '14px', marginBottom: '10px' }}>Confirm your {money(pending.amount, currency)} top-up</div>
          <StripePayConfirm
            stripeKey={stripeKey}
            clientSecret={pending.secret}
            submitLabel={`Add ${money(pending.amount, currency)}`}
            onCancel={() => setPending(null)}
            onDone={() => {
              setPending(null);
              toast('Top-up received');
              // The payment webhook credits the wallet; give it a moment.
              setTimeout(() => wallet.reload(), 2500);
            }}
          />
        </div>
      )}

      <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
        <ListRow icon="card" href="/account/payment-methods" title="Payment methods" sub={cardsSub} right={<RowChevron />} />
        <ListRow icon="doc" href="/account/invoices" title="Invoices" sub="Download receipts" right={<RowChevron />} last />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 0 -2px' }}>
        <h2 style={sectionH2}>Recent activity</h2>
      </div>
      {wallet.loading && !w ? (
        <Skeleton h={200} />
      ) : w && w.transactions.length === 0 ? (
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px', fontSize: '14.5px', color: '#C9D2CB' }}>No wallet activity yet. Add funds to get started.</div>
      ) : w ? (
        <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 14px' }}>
          {w.transactions.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: i < w.transactions.length - 1 ? '1px solid #1F4537' : undefined }}>
              <div style={iconBox}>
                <Icon name={txIcon(t.amount, t.description)} />
              </div>
              <div style={{ flex: 1, minWidth: '0' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF', overflowWrap: 'anywhere' }}>{t.description}</div>
                <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>{fmtDay(t.createdAt)}</div>
              </div>
              <span style={{ fontSize: '14.5px', fontWeight: 600, color: t.amount > 0 ? '#4CC38A' : '#F3EEDF', whiteSpace: 'nowrap' }}>{signedMoney(t.amount, currency)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
