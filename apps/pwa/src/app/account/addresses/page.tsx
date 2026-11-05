'use client';

import { useState, type FormEvent } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { SavedAddress } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { ConfirmStrip, EmptyCard, ErrorNote, Icon, InputField, S, Screen, ScreenHead, errMsg, useLoad, type IconName } from '@/components/account/kit';

const LABELS = ['Home', 'Work', 'Other'] as const;

function labelIcon(label: string): IconName {
  const l = label.trim().toLowerCase();
  if (l === 'home') return 'home';
  if (l === 'work' || l === 'office') return 'briefcase';
  if (/airport|terminal/i.test(label)) return 'plane';
  return 'star';
}

function SavedAddresses() {
  const { api } = useRidean();
  const toast = useToast();
  const list = useLoad(() => api.addresses(), [api]);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<(typeof LABELS)[number]>('Home');
  const [custom, setCustom] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmId, setConfirmId] = useState('');
  const [error, setError] = useState('');

  const items = (list.data ?? []).filter((a) => {
    const s = q.trim().toLowerCase();
    return !s || a.label.toLowerCase().includes(s) || a.address.toLowerCase().includes(s);
  });

  async function add(e: FormEvent) {
    e.preventDefault();
    const label = kind === 'Other' ? custom.trim() : kind;
    if (!label) return setError('Give this place a name, e.g. “Gym”.');
    if (address.trim().length < 3) return setError('Please enter the full address.');
    setError('');
    setBusy('add');
    try {
      await api.addAddress({ label, address: address.trim() });
      await list.reload();
      setAdding(false);
      setAddress('');
      setCustom('');
      toast('Address saved');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy('');
    }
  }

  async function remove(a: SavedAddress) {
    setError('');
    setBusy(a.id);
    try {
      await api.deleteAddress(a.id);
      setConfirmId('');
      list.setData((list.data ?? []).filter((x) => x.id !== a.id));
      toast('Address removed');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy('');
    }
  }

  return (
    <Screen>
      <ScreenHead title="Saved addresses" fallback="/account" />
      <div style={S.body}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #1F4537', background: '#0E2A22' }}>
          <Icon name="search" color={C.muted} />
          <input type="search" aria-label="Search saved addresses" placeholder="Search your saved addresses" value={q} onChange={(e) => setQ(e.target.value)} style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: '14.5px', color: '#F3EEDF' }} />
        </label>

        {list.error && <ErrorNote>{list.error}</ErrorNote>}
        {list.loading && !list.data ? (
          <Skeleton h={240} />
        ) : list.data && list.data.length === 0 ? (
          <EmptyCard text="No saved places yet. Add home or work for faster booking." />
        ) : list.data && items.length === 0 ? (
          <EmptyCard text={`No saved address matches “${q}”.`} />
        ) : list.data ? (
          <div style={S.list}>
            {items.map((a, i) => (
              <div key={a.id} style={{ borderBottom: i === items.length - 1 ? undefined : '1px solid #1F4537' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px' }}>
                  <div style={S.iconBox}><Icon name={labelIcon(a.label)} /></div>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF', overflowWrap: 'anywhere' }}>{a.label}</div>
                    <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px', overflowWrap: 'anywhere' }}>{a.address}</div>
                  </div>
                  <button type="button" aria-label={`Delete ${a.label}`} className="pa-link" disabled={!!busy} onClick={() => setConfirmId(confirmId === a.id ? '' : a.id)} style={{ padding: 4 }}>
                    <Icon name="trash" size={17} color={C.muted} />
                  </button>
                </div>
                {confirmId === a.id && (
                  <ConfirmStrip label="Delete address" text={`Delete “${a.label}”?`} confirmLabel="Delete" busyLabel="Deleting…" busy={busy === a.id} onCancel={() => setConfirmId('')} onConfirm={() => remove(a)} />
                )}
              </div>
            ))}
          </div>
        ) : null}

        {adding ? (
          <form onSubmit={add} noValidate style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="radiogroup" aria-label="Label">
              {LABELS.map((l) => (
                <button key={l} type="button" role="radio" aria-checked={kind === l} className={`dz-chip ${kind === l ? 'on' : ''}`} onClick={() => setKind(l)}>{l}</button>
              ))}
            </div>
            {kind === 'Other' && (
              <InputField icon="star" label="Name">
                <input type="text" placeholder="e.g. Gym, Mum’s place" maxLength={60} value={custom} onChange={(e) => setCustom(e.target.value)} style={S.input} />
              </InputField>
            )}
            <InputField icon="pin" label="Address">
              <input type="text" autoComplete="street-address" placeholder="Street, city, postcode" value={address} onChange={(e) => setAddress(e.target.value)} style={S.input} autoFocus />
            </InputField>
            {error && <ErrorNote>{error}</ErrorNote>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setAdding(false); setError(''); }} style={S.plain}>Cancel</button>
              <button type="submit" className="dz-cta" disabled={busy === 'add'} style={{ ...S.cta, flex: 1, height: 50, fontSize: 16 }}>{busy === 'add' ? 'Saving…' : 'Save address'}</button>
            </div>
          </form>
        ) : (
          <>
            {error && <ErrorNote>{error}</ErrorNote>}
            <button type="button" className="dz-cta" onClick={() => { setAdding(true); setError(''); }} style={S.cta}><span>Add new address</span></button>
          </>
        )}
      </div>
    </Screen>
  );
}

export default function SavedAddressesPage() {
  return (
    <RequireAuth>
      <SavedAddresses />
    </RequireAuth>
  );
}
