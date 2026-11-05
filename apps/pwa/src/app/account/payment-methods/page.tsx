'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { SavedCard } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { ConfirmStrip, EmptyCard, ErrorNote, Icon, S, Screen, ScreenHead, brandName, cardExpiry, cardLabel, errMsg, money, useLoad, type IconName } from '@/components/account/kit';

const pmIcon = (name: IconName) => (
  <div style={{ width: '44px', height: '30px', borderRadius: '6px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon name={name} />
  </div>
);

const pmText = (title: string, sub: ReactNode) => (
  <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
    <div style={{ fontSize: '15px', color: '#F3EEDF' }}>{title}</div>
    <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px', overflowWrap: 'anywhere' }}>{sub}</div>
  </div>
);

function PaymentMethods() {
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
  const holder = user ? `${user.firstName} ${user.lastName}`.toUpperCase() : '';

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

  return (
    <Screen>
      <ScreenHead
        title="Payment methods"
        sub={list.length > 1 ? 'Tap a card to make it your default' : list.length === 1 ? 'Your default card is used for rides, transfers and rentals' : undefined}
        fallback="/account"
      />
      <div style={S.body}>
        {cards.error && <ErrorNote>{cards.error}</ErrorNote>}
        {error && <ErrorNote>{error}</ErrorNote>}

        {cards.loading && !cards.data ? (
          <Skeleton h={120} style={{ borderRadius: 18 }} />
        ) : def ? (
          <div style={{ borderRadius: '18px', padding: '20px', height: '120px', background: 'linear-gradient(135deg,#2A2414,#0E2A22 70%)', border: '1px solid rgba(217,169,79,.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={S.wordmark}>Ridean</span>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '.08em', color: '#F3EEDF' }}>{brandName(def.brand).toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontSize: '17px', letterSpacing: '.14em', color: '#F3EEDF', whiteSpace: 'nowrap', overflow: 'hidden' }}>•••• •••• •••• {def.last4}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: '12px', color: '#9FB2A6', marginTop: '6px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{holder}</span>
                <span>{cardExpiry(def)}</span>
              </div>
            </div>
          </div>
        ) : cards.data ? (
          <EmptyCard text="No saved cards yet." action={<Link href="/account/payment-methods/new" style={{ ...S.goldLink, fontSize: 14 }}>Add a card</Link>} />
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cards.loading && !cards.data && <><Skeleton h={60} /><Skeleton h={60} /></>}
          {list.length > 0 && <div role="radiogroup" aria-label="Default card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {list.map((c) => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" role="radio" aria-checked={!!c.isDefault} className={`dz-pm ${c.isDefault ? 'on' : ''}`} disabled={!!busy} onClick={() => makeDefault(c)}>
                  {pmIcon('card')}
                  {pmText(cardLabel(c), `Expires ${cardExpiry(c)}${c.isDefault ? ' · default' : ''}`)}
                  <span className="dz-radio" />
                </button>
                <button type="button" aria-label={`Remove ${cardLabel(c)}`} className="pa-link" disabled={!!busy} onClick={() => setConfirmId(confirmId === c.id ? '' : c.id)} style={{ padding: 8 }}>
                  <Icon name="trash" size={17} color={C.muted} />
                </button>
              </div>
              {confirmId === c.id && (
                <div style={{ ...S.panel, padding: '12px 14px 0' }}>
                  <ConfirmStrip label="Remove card" text={`Remove ${cardLabel(c)}?`} confirmLabel="Remove card" busyLabel="Removing…" busy={busy === c.id} onCancel={() => setConfirmId('')} onConfirm={() => remove(c)} />
                </div>
              )}
            </div>
          ))}
          </div>}

          {extras.data?.wallet && (
            <Link href="/wallet" className="dz-pm">
              {pmIcon('wallet')}
              {pmText('Ridean Wallet', `Balance ${money(extras.data.wallet.balance, extras.data.wallet.currency)} · choose at checkout`)}
              <Icon name="right" color={C.muted} />
            </Link>
          )}
          {extras.data?.business && (
            <Link href="/account/business" className="dz-pm">
              {pmIcon('briefcase')}
              {pmText('Business account', `${extras.data.business.name} · choose at checkout`)}
              <Icon name="right" color={C.muted} />
            </Link>
          )}
        </div>

        <Link href="/account/payment-methods/new" className="dz-cta" style={S.cta}><span>Add payment method</span></Link>
      </div>
    </Screen>
  );
}

export default function PaymentMethodsPage() {
  return (
    <RequireAuth>
      <PaymentMethods />
    </RequireAuth>
  );
}
