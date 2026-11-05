'use client';

import { useState, type FormEvent } from 'react';
import { useRidean } from '@ridean/web-core';
import type { SavedAddress } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { EmptyCard, ErrorNote, Icon, InputField, PageHead, S, errMsg, useLoad, type IconName } from '@/components/account/kit';

const LABELS = ['Home', 'Work', 'Other'] as const;
const inputStyle = { all: 'unset', boxSizing: 'border-box', width: '100%', fontSize: 14.5, color: C.cream, marginTop: 2 } as const;

function labelIcon(label: string): IconName {
  const l = label.trim().toLowerCase();
  if (l === 'home') return 'home';
  if (l === 'work' || l === 'office') return 'briefcase';
  if (/airport|terminal/i.test(label)) return 'plane';
  return 'star';
}

export default function SavedAddressesPage() {
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
    <div style={S.page}>
      <PageHead title="Saved addresses" />
      <div className="dz-split" style={{ gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 16px', borderRadius: 12, border: `1px solid ${C.line}`, background: C.panel }}>
            <Icon name="search" color={C.muted} />
            <input type="search" aria-label="Search saved addresses" placeholder="Search your saved addresses" value={q} onChange={(e) => setQ(e.target.value)} style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: 15, color: C.cream }} />
          </label>

          {list.error && <ErrorNote>{list.error}</ErrorNote>}
          {list.loading && !list.data ? (
            <Skeleton h={260} />
          ) : list.data && list.data.length === 0 ? (
            <EmptyCard text="No saved places yet. Add home or work for faster booking." />
          ) : list.data && items.length === 0 ? (
            <EmptyCard text={`No saved address matches “${q}”.`} />
          ) : list.data ? (
            <div style={S.list}>
              {items.map((a, i) => (
                <div key={a.id} style={{ borderBottom: i === items.length - 1 ? undefined : `1px solid ${C.line}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px' }}>
                    <div style={S.iconBox}><Icon name={labelIcon(a.label)} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: C.cream }}>{a.label}</div>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, overflowWrap: 'anywhere' }}>{a.address}</div>
                    </div>
                    <button type="button" aria-label={`Delete ${a.label}`} className="dz-acct-link" disabled={!!busy} onClick={() => setConfirmId(confirmId === a.id ? '' : a.id)} style={{ padding: 4 }}>
                      <Icon name="trash" size={17} color={C.muted} />
                    </button>
                  </div>
                  {confirmId === a.id && (
                    <div role="alertdialog" aria-label="Delete address" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 2px 14px', flexWrap: 'wrap' }}>
                      <span style={{ flex: 1, minWidth: 140, fontSize: 14, color: C.soft }}>Delete “{a.label}”?</span>
                      <button type="button" className="dz-acct-link" onClick={() => setConfirmId('')} style={{ fontSize: 14, color: C.muted }}>Keep</button>
                      <button type="button" className="dz-acct-link" disabled={busy === a.id} onClick={() => remove(a)} style={{ fontSize: 14, fontWeight: 600, color: C.bad }}>{busy === a.id ? 'Deleting…' : 'Delete'}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {adding ? (
            <form onSubmit={add} style={{ ...S.panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="radiogroup" aria-label="Label">
                {LABELS.map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={kind === l} className={`dz-chip ${kind === l ? 'on' : ''}`} onClick={() => setKind(l)}>{l}</button>
                ))}
              </div>
              {kind === 'Other' && (
                <InputField icon="star" label="Name">
                  <input type="text" placeholder="e.g. Gym, Mum’s place" maxLength={60} value={custom} onChange={(e) => setCustom(e.target.value)} style={inputStyle} />
                </InputField>
              )}
              <InputField icon="pin" label="Address">
                <input type="text" autoComplete="street-address" placeholder="Street, city, postcode" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} autoFocus />
              </InputField>
              {error && <ErrorNote>{error}</ErrorNote>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => { setAdding(false); setError(''); }} style={S.plain}>Cancel</button>
                <button type="submit" className="dz-cta" disabled={busy === 'add'} style={{ ...S.cta, flex: 1, height: 50 }}>{busy === 'add' ? 'Saving…' : 'Save address'}</button>
              </div>
            </form>
          ) : (
            <>
              {error && <ErrorNote>{error}</ErrorNote>}
              <button type="button" className="dz-cta" onClick={() => setAdding(true)} style={S.cta}><span>Add new address</span></button>
            </>
          )}
        </div>

        <div className="dz-hide-sm" style={{ position: 'relative', height: 380, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}`, background: '#0A2019' }}>
          <svg width="100%" height="100%" viewBox="0 0 500 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="500" height="380" fill="#0A2019" />
            <g stroke="#143A2E" strokeWidth="12" fill="none">
              <path d="M-10 114 L510 84" />
              <path d="M-10 285 L510 323" />
              <path d="M129 -10 L171 390" />
              <path d="M357 -10 L329 390" />
            </g>
            <g stroke="#10302A" strokeWidth="6" fill="none">
              <path d="M-10 198 L510 190" />
              <path d="M243 -10 L257 390" />
              <path d="M443 -10 L429 390" />
              <path d="M43 -10 L71 390" />
              <path d="M300 -10 L293 390" />
            </g>
            <rect x="193" y="220" width="70" height="34" rx="5" fill="#123A2A" />
            <rect x="271" y="38" width="60" height="40" rx="5" fill="#123A2A" />
            <rect x="57" y="30" width="54" height="36" rx="5" fill="#123A2A" />
            <path d="M100 274 C 200 258, 214 160, 286 137 S 386 91, 407 76" stroke="#D9A94F" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="274" r="9" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
            <circle cx="407" cy="76" r="10" fill="#F6C428" />
            <circle cx="407" cy="76" r="4" fill="#071A14" />
          </svg>
        </div>
      </div>
    </div>
  );
}
