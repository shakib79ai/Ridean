'use client';

import { useState, type FormEvent } from 'react';
import { RequireAuth, useRidean } from '@ridean/web-core';
import type { BusinessAccount, BusinessMember, BusinessPolicy } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { ConfirmStrip, ErrorNote, Icon, InputField, ListRow, Muted, RowChevron, S, Screen, ScreenHead, SectionHead, ToggleRow, errMsg, money, useLoad } from '@/components/account/kit';

/** "Approval over $200" ↔ policy.approvalOver in minor units. */
const APPROVAL_LIMIT = 20000;

const memberInitials = (m: BusinessMember) => {
  const src = (m.name || m.email.split('@')[0]).trim();
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

function SetupPanel({ onCreated }: { onCreated: (b: BusinessAccount) => void }) {
  const { api, user } = useRidean();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Please enter your company name.');
    const dollars = budget.trim() ? Number(budget.replace(/[,$\s]/g, '')) : undefined;
    if (dollars !== undefined && (!Number.isFinite(dollars) || dollars < 0)) return setError('Please enter a valid monthly budget.');
    setError('');
    setBusy(true);
    try {
      onCreated(await api.createBusiness({ name: name.trim(), monthlyBudget: dollars !== undefined ? Math.round(dollars * 100) : undefined, billingEmail: email.trim() || undefined }));
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={S.iconBox}><Icon name="briefcase" /></div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600 }}>Set up Ridean Business</div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Bill team trips to one account, set a monthly budget and a simple travel policy.</p>
        </div>
      </div>
      <InputField icon="briefcase" label="Company name">
        <input type="text" autoComplete="organization" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your company" style={S.input} />
      </InputField>
      <InputField icon="tag" label="Monthly budget (USD, optional)">
        <input type="text" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="5,000" style={S.input} />
      </InputField>
      <InputField icon="mail" label="Billing email">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@company.com" style={S.input} />
      </InputField>
      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className="dz-cta" disabled={busy} style={S.cta}><span>{busy ? 'Creating…' : 'Create business account'}</span></button>
    </form>
  );
}

function Business() {
  const { api, user } = useRidean();
  const toast = useToast();
  const biz = useLoad(() => api.business(), [api]);
  const [inviting, setInviting] = useState(false);
  const [inv, setInv] = useState<{ email: string; name: string; role: 'admin' | 'member' }>({ email: '', name: '', role: 'member' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState('');

  const b = biz.data;
  const admin = b?.role === 'admin';

  async function setPolicy(patch: Partial<BusinessPolicy>) {
    if (!b || !admin) return;
    const prev = b;
    biz.setData({ ...b, policy: { ...b.policy, ...patch } });
    try {
      biz.setData(await api.updateBusiness({ policy: patch }));
      toast('Policy updated');
    } catch (e) {
      biz.setData(prev);
      toast(errMsg(e, 'Couldn’t update the policy'));
    }
  }

  async function invite(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(inv.email.trim())) return setError('Please enter a valid email address.');
    setError('');
    setBusy('invite');
    try {
      biz.setData(await api.inviteBusinessMember({ email: inv.email.trim(), name: inv.name.trim() || undefined, role: inv.role }));
      setInv({ email: '', name: '', role: 'member' });
      setInviting(false);
      toast('Invitation added');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy('');
    }
  }

  async function remove(m: BusinessMember) {
    setError('');
    setBusy(m.id);
    try {
      biz.setData(await api.removeBusinessMember(m.id));
      setConfirmId('');
      toast('Member removed');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy('');
    }
  }

  if (biz.loading && !b) {
    return (
      <Screen>
        <ScreenHead title="Business account" fallback="/account" />
        <div style={S.body}><Skeleton h={130} /><Skeleton h={180} /></div>
      </Screen>
    );
  }

  if (biz.error) {
    return (
      <Screen>
        <ScreenHead title="Business account" fallback="/account" />
        <div style={S.body}><ErrorNote>{biz.error}</ErrorNote></div>
      </Screen>
    );
  }

  if (!b) {
    return (
      <Screen>
        <ScreenHead title="Business account" sub="Travel for work, billed in one place" fallback="/account" />
        <div style={S.body}>
          <SetupPanel onCreated={(nb) => { biz.setData(nb); toast('Business account created'); }} />
        </div>
      </Screen>
    );
  }

  const pct = b.monthlyBudget > 0 ? Math.min(100, Math.round((b.spendThisMonth / b.monthlyBudget) * 100)) : 0;
  const me = (user?.email ?? '').toLowerCase();

  return (
    <Screen>
      <ScreenHead title="Business account" sub={b.name} fallback="/account" />
      <div style={S.body}>
        <div style={{ ...S.panel, padding: '16px' }}>
          <div style={{ fontSize: '12.5px', color: '#9FB2A6' }}>Spend this month</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '32px', fontWeight: 600 }}>{money(b.spendThisMonth, b.currency)}</span>
            <span style={{ fontSize: '13px', color: '#9FB2A6' }}>{b.monthlyBudget > 0 ? `of ${money(b.monthlyBudget, b.currency)} budget` : 'no budget set'}</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: '#12352B', marginTop: '12px', overflow: 'hidden' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Budget used">
            <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? C.bad : 'linear-gradient(90deg,#F2D27A,#F6C428)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: '12px', color: '#9FB2A6', marginTop: '8px', flexWrap: 'wrap' }}>
            <span>{b.tripsThisMonth} trip{b.tripsThisMonth === 1 ? '' : 's'}</span>
            {b.billingEmail && <span style={{ overflowWrap: 'anywhere' }}>Billing · {b.billingEmail}</span>}
          </div>
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        <SectionHead
          title="Team"
          link={admin && !inviting ? <button type="button" className="pa-link" onClick={() => { setInviting(true); setError(''); }} style={S.goldLink}>Invite</button> : undefined}
        />

        {inviting && (
          <form onSubmit={invite} noValidate style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InputField icon="mail" label="Email">
              <input type="email" required value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} placeholder="colleague@company.com" style={S.input} autoFocus />
            </InputField>
            <InputField icon="user" label="Name (optional)">
              <input type="text" value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} style={S.input} />
            </InputField>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }} role="radiogroup" aria-label="Role">
              <span style={{ fontSize: 13, color: C.muted, marginRight: 4 }}>Role</span>
              {(['member', 'admin'] as const).map((r) => (
                <button key={r} type="button" role="radio" aria-checked={inv.role === r} className={`dz-chip ${inv.role === r ? 'on' : ''}`} onClick={() => setInv({ ...inv, role: r })}>{r === 'admin' ? 'Admin' : 'Member'}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setInviting(false); setError(''); }} style={S.plain}>Cancel</button>
              <button type="submit" className="dz-cta" disabled={busy === 'invite'} style={{ ...S.cta, flex: 1, height: 50, fontSize: 16 }}>{busy === 'invite' ? 'Inviting…' : 'Invite member'}</button>
            </div>
            <Muted>They’ll join the account when they sign in to Ridean with this email.</Muted>
          </form>
        )}

        <div style={S.list}>
          {b.members.map((m, i) => {
            const self = m.email.toLowerCase() === me;
            const canRemove = admin && !self;
            return (
              <div key={m.id} style={{ borderBottom: i === b.members.length - 1 ? undefined : '1px solid #1F4537' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '19px', background: '#12352B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '14px', color: '#D9A94F', flexShrink: 0 }}>{memberInitials(m)}</div>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '14.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.name || m.email}{self && <span style={{ color: C.muted }}> (you)</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{m.role === 'admin' ? 'Admin' : 'Member'} · {m.tripsThisMonth} trip{m.tripsThisMonth === 1 ? '' : 's'} · {money(m.spendThisMonth, b.currency)}</span>
                      {m.status === 'invited' && <span style={{ padding: '2px 7px', borderRadius: 999, background: 'rgba(217,169,79,.14)', color: C.gold, fontSize: 11, fontWeight: 600 }}>Invited</span>}
                    </div>
                  </div>
                  {canRemove && (
                    <button type="button" aria-label={`Remove ${m.name || m.email}`} className="pa-link" disabled={!!busy} onClick={() => setConfirmId(confirmId === m.id ? '' : m.id)} style={{ padding: 4 }}>
                      <Icon name="trash" size={17} color={C.muted} />
                    </button>
                  )}
                </div>
                {confirmId === m.id && (
                  <ConfirmStrip label="Remove member" text={`Remove ${m.name || m.email} from ${b.name}?`} confirmLabel="Remove" busyLabel="Removing…" busy={busy === m.id} onCancel={() => setConfirmId('')} onConfirm={() => remove(m)} />
                )}
              </div>
            );
          })}
          {b.members.length === 0 && <p style={{ margin: 0, padding: '14px 0', fontSize: 14, color: C.muted }}>No team members yet.</p>}
        </div>

        <SectionHead title="Travel policy" />
        <div style={S.list}>
          <ToggleRow title="Require trip purpose" on={b.policy.requirePurpose} disabled={!admin} onChange={(v) => setPolicy({ requirePurpose: v })} />
          <ToggleRow title="Business class and above" sub="Allow premium vehicles" on={b.policy.businessClassOnly} disabled={!admin} onChange={(v) => setPolicy({ businessClassOnly: v })} />
          <ToggleRow title="Approval over $200" sub="An account admin approves large bookings" on={b.policy.approvalOver > 0} disabled={!admin} onChange={(v) => setPolicy({ approvalOver: v ? APPROVAL_LIMIT : 0 })} last />
        </div>
        {!admin && <Muted>Only account admins can change the travel policy.</Muted>}

        <div style={S.list}>
          <ListRow href="/account/invoices" icon="doc" title="Monthly statements" sub="Your business trips are on your invoices" right={<RowChevron />} last />
        </div>
      </div>
    </Screen>
  );
}

export default function BusinessAccountPage() {
  return (
    <RequireAuth>
      <Business />
    </RequireAuth>
  );
}
