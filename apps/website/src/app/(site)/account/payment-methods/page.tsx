'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRidean } from '@ridean/web-core';
import type { SavedCard } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { EmptyCard, ErrorNote, Icon, PageHead, S, brandName, cardExpiry, cardLabel, errMsg, money, useLoad, type IconName } from '@/components/account/kit';

const pmIcon = (name: IconName) => (
  <div style={{ width: 48, height: 32, borderRadius: 6, background: C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon name={name} />
  </div>
);

export default function PaymentMethodsPage() {
  const { api, user } = useRidean();
  const toast = useToast();
  const cards = useLoad(() => api.paymentMethods(), [api]);
  const extras = useLoad(async () => {
    const [wallet, business] = await Promise.all([api.wallet().catch(() => null), api.business().catch(() => null)]);
    return { wallet, business };
  }, [api]);
  const [busy, setBusy] = useState('');
  const [confirmId, setConfirmId] = useState('');
  const [error, setError] = useState('');

  const list = cards.data ?? [];
  const def = list.find((c) => c.isDefault) ?? list[0];

  async function makeDefault(c: SavedCard) {
    if (c.isDefault || busy) return;
    setError('');
    setBusy(c.id);
    const prev = cards.data;
    cards.setData(list.map((x) => ({ ...x, isDefault: x.id === c.id })));
    try {
      await api.setDefaultPaymentMethod(c.id);
      toast('Default payment updated');
    } catch (e) {
      cards.setData(prev);
      setError(errMsg(e));
    } finally {
      setBusy('');
    }
  }

  async function remove(c: SavedCard) {
    setError('');
    setBusy(c.id);
    try {
      await api.removePaymentMethod(c.id);
      setConfirmId('');
      await cards.reload();
      toast('Card removed');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy('');
    }
  }

  const holder = user ? `${user.firstName} ${user.lastName}`.toUpperCase() : '';

  return (
    <div style={S.page}>
      <PageHead
        title="Payment methods"
        action={
          <div style={{ width: 240 }}>
            <Link href="/account/payment-methods/new" className="dz-cta" style={S.cta}><span>Add payment method</span></Link>
          </div>
        }
      />
      {cards.error && <ErrorNote>{cards.error}</ErrorNote>}
      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="dz-acct-pm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {cards.loading && !cards.data ? (
            <Skeleton h={190} style={{ borderRadius: 20 }} />
          ) : def ? (
            <div style={{ borderRadius: 20, padding: 24, height: 190, boxSizing: 'border-box', background: 'linear-gradient(135deg,#2A2414,#0E2A22 70%)', border: '1px solid rgba(217,169,79,.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={S.wordmark}>Ridean</span>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '.08em' }}>{brandName(def.brand).toUpperCase()}</span>
              </div>
              <div>
                <div style={{ fontSize: 21, letterSpacing: '.14em', whiteSpace: 'nowrap', overflow: 'hidden' }}>•••• •••• •••• {def.last4}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: C.muted, marginTop: 8 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{holder}</span>
                  <span>{cardExpiry(def)}</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyCard text="No saved cards yet." action={<Link href="/account/payment-methods/new" style={S.goldLink}>Add a card</Link>} />
          )}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: C.muted }}>
            {list.length > 1 ? 'Tap a card to make it your default for rides, transfers and rentals.' : 'Your default card is used for rides, transfers and rentals.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          {cards.loading && !cards.data && <><Skeleton h={66} /><Skeleton h={66} /></>}
          {list.map((c) => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" role="radio" aria-checked={!!c.isDefault} className={`dz-pm ${c.isDefault ? 'on' : ''}`} disabled={!!busy} onClick={() => makeDefault(c)}>
                  {pmIcon('card')}
                  <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, color: C.cream }}>{cardLabel(c)}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Expires {cardExpiry(c)}{c.isDefault ? ' · default' : ''}</div>
                  </div>
                  <span className="dz-radio" />
                </button>
                <button type="button" aria-label={`Remove ${cardLabel(c)}`} className="dz-acct-link" disabled={!!busy} onClick={() => setConfirmId(confirmId === c.id ? '' : c.id)} style={{ padding: 8 }}>
                  <Icon name="trash" size={17} color={C.muted} />
                </button>
              </div>
              {confirmId === c.id && (
                <div role="alertdialog" aria-label="Remove card" style={{ ...S.panel, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 160, fontSize: 14 }}>Remove {cardLabel(c)}?</span>
                  <button type="button" className="dz-acct-link" onClick={() => setConfirmId('')} style={{ fontSize: 14, color: C.muted }}>Keep</button>
                  <button type="button" className="dz-acct-link" disabled={busy === c.id} onClick={() => remove(c)} style={{ fontSize: 14, fontWeight: 600, color: C.bad }}>{busy === c.id ? 'Removing…' : 'Remove card'}</button>
                </div>
              )}
            </div>
          ))}

          {extras.data?.wallet && (
            <Link href="/account/wallet" className="dz-pm" style={{ cursor: 'pointer' }}>
              {pmIcon('wallet')}
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 15.5, color: C.cream }}>Ridean Wallet</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Balance {money(extras.data.wallet.balance, extras.data.wallet.currency)} · choose at checkout</div>
              </div>
              <Icon name="right" color={C.muted} />
            </Link>
          )}
          {extras.data?.business && (
            <Link href="/account/business" className="dz-pm" style={{ cursor: 'pointer' }}>
              {pmIcon('briefcase')}
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 15.5, color: C.cream }}>Business account</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{extras.data.business.name} · choose at checkout</div>
              </div>
              <Icon name="right" color={C.muted} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
