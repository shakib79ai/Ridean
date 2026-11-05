'use client';

import { useState, type FormEvent } from 'react';
import { useRidean } from '@ridean/web-core';
import type { BusinessAccount, BusinessMember, BusinessPolicy } from '@ridean/shared';
import { C, Skeleton, useToast } from '@/components/site/ui';
import { ErrorNote, Icon, InputField, Muted, PageHead, S, SectionHead, ToggleRow, errMsg, money, useLoad } from '@/components/account/kit';

const inputStyle = { all: 'unset', boxSizing: 'border-box', width: '100%', fontSize: 14.5, color: C.cream, marginTop: 2 } as const;
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
    <form onSubmit={submit} style={{ ...S.panel, padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={S.iconBox}><Icon name="briefcase" /></div>
          <div>
            <SectionHead title="Set up Ridean Business" size={20} />
            <p style={{ margin: '4px 0 0', fontSize: 14, color: C.muted, lineHeight: 1.5 }}>Bill team trips to one account, set a monthly budget and a simple travel policy.</p>
          </div>
        </div>
        <InputField icon="briefcase" label="Company name">
          <input type="text" autoComplete="organization" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your company" style={inputStyle} />
        </InputField>
        <div className="dz-split" style={{ gap: 12 }}>
          <InputField icon="tag" label="Monthly budget (USD, optional)">
            <input type="text" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="5,000" style={inputStyle} />
          </InputField>
          <InputField icon="mail" label="Billing email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@company.com" style={inputStyle} />
          </InputField>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 260, maxWidth: '100%' }}>
            <button type="submit" className="dz-cta" disabled={busy} style={S.cta}>{busy ? 'Creating…' : 'Create business account'}</button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function BusinessAccountPage() {
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
      <div style={S.page}>
        <PageHead title="Business account" />
        <div className="dz-split" style={{ gap: 20 }}><Skeleton h={200} /><Skeleton h={200} /></div>
      </div>
    );
  }

  if (biz.error) {
    return (
      <div style={S.page}>
        <PageHead title="Business account" />
        <ErrorNote>{biz.error}</ErrorNote>
      </div>
    );
  }

  if (!b) {
    return (
      <div style={S.page}>
        <PageHead title="Business account" sub="Travel for work, billed in one place." />
        <SetupPanel onCreated={(nb) => { biz.setData(nb); toast('Business account created'); }} />
      </div>
    );
  }

  const pct = b.monthlyBudget > 0 ? Math.min(100, Math.round((b.spendThisMonth / b.monthlyBudget) * 100)) : 0;
  const me = (user?.email ?? '').toLowerCase();

  return (
    <div style={S.page}>
      <PageHead title="Business account" sub={`${b.name} · ${b.members.length} member${b.members.length === 1 ? '' : 's'}`} />
      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="dz-split" style={{ gap: 20 }}>
        <div style={{ ...S.panel, padding: 24 }}>
          <div style={{ fontSize: 13, color: C.muted }}>Spend this month</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 40, fontWeight: 600 }}>{money(b.spendThisMonth, b.currency)}</span>
            <span style={{ fontSize: 14, color: C.muted }}>{b.monthlyBudget > 0 ? `of ${money(b.monthlyBudget, b.currency)} budget` : 'no budget set'}</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: C.panel2, marginTop: 14, overflow: 'hidden' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Budget used">
            <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? C.bad : 'linear-gradient(90deg,#F2D27A,#F6C428)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: C.muted, marginTop: 10, flexWrap: 'wrap' }}>
            <span>{b.tripsThisMonth} trip{b.tripsThisMonth === 1 ? '' : 's'}</span>
            {b.billingEmail && <span style={{ overflowWrap: 'anywhere' }}>Billing · {b.billingEmail}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <SectionHead title="Travel policy" size={20} />
          <div style={S.list}>
            <ToggleRow title="Require trip purpose" on={b.policy.requirePurpose} disabled={!admin} onChange={(v) => setPolicy({ requirePurpose: v })} />
            <ToggleRow title="Business class and above" sub="Allow premium vehicles" on={b.policy.businessClassOnly} disabled={!admin} onChange={(v) => setPolicy({ businessClassOnly: v })} />
            <ToggleRow title="Approval over $200" sub="An account admin approves large bookings" on={b.policy.approvalOver > 0} disabled={!admin} onChange={(v) => setPolicy({ approvalOver: v ? APPROVAL_LIMIT : 0 })} last />
          </div>
          {!admin && <Muted>Only account admins can change the travel policy.</Muted>}
        </div>
      </div>

      <SectionHead
        title="Team"
        size={24}
        link={admin && !inviting ? <button type="button" className="dz-acct-link" onClick={() => setInviting(true)} style={S.goldLink}>Invite member</button> : undefined}
      />

      {inviting && (
        <form onSubmit={invite} style={{ ...S.panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="dz-split" style={{ gap: 12 }}>
            <InputField icon="mail" label="Email">
              <input type="email" required value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} placeholder="colleague@company.com" style={inputStyle} autoFocus />
            </InputField>
            <InputField icon="user" label="Name (optional)">
              <input type="text" value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} style={inputStyle} />
            </InputField>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }} role="radiogroup" aria-label="Role">
            <span style={{ fontSize: 13, color: C.muted, marginRight: 4 }}>Role</span>
            {(['member', 'admin'] as const).map((r) => (
              <button key={r} type="button" role="radio" aria-checked={inv.role === r} className={`dz-chip ${inv.role === r ? 'on' : ''}`} onClick={() => setInv({ ...inv, role: r })}>{r === 'admin' ? 'Admin' : 'Member'}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => { setInviting(false); setError(''); }} style={S.plain}>Cancel</button>
            <button type="submit" className="dz-cta" disabled={busy === 'invite'} style={{ ...S.cta, flex: 1, height: 50 }}>{busy === 'invite' ? 'Inviting…' : 'Invite member'}</button>
          </div>
          <Muted>They’ll join the account when they sign in to Ridean with this email.</Muted>
        </form>
      )}

      <div style={{ ...S.panel, padding: '6px 20px' }}>
        {b.members.map((m, i) => {
          const self = m.email.toLowerCase() === me;
          const canRemove = admin && !self;
          return (
            <div key={m.id} style={{ borderBottom: i === b.members.length - 1 ? undefined : `1px solid ${C.line}` }}>
              <div className="dz-acct-team-row" style={{ padding: '13px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: C.gold, flexShrink: 0 }}>
                    {memberInitials(m)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.name || m.email}{self && <span style={{ color: C.muted }}> (you)</span>}
                    </div>
                    {m.name && <div style={{ fontSize: 12.5, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>}
                  </div>
                </div>
                <span style={{ fontSize: 14, color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {m.role === 'admin' ? 'Admin' : 'Member'}
                  {m.status === 'invited' && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(217,169,79,.14)', color: C.gold, fontSize: 11.5, fontWeight: 600 }}>Invited</span>}
                </span>
                <span style={{ fontSize: 14, color: C.muted }}>{m.tripsThisMonth} trip{m.tripsThisMonth === 1 ? '' : 's'} · {money(m.spendThisMonth, b.currency)}</span>
                {canRemove ? (
                  <button type="button" aria-label={`Remove ${m.name || m.email}`} className="dz-acct-link" disabled={!!busy} onClick={() => setConfirmId(confirmId === m.id ? '' : m.id)} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Icon name="trash" size={17} color={C.muted} />
                  </button>
                ) : <span />}
              </div>
              {confirmId === m.id && (
                <div role="alertdialog" aria-label="Remove member" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 13px', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 160, fontSize: 14, color: C.soft }}>Remove {m.name || m.email} from {b.name}?</span>
                  <button type="button" className="dz-acct-link" onClick={() => setConfirmId('')} style={{ fontSize: 14, color: C.muted }}>Keep</button>
                  <button type="button" className="dz-acct-link" disabled={busy === m.id} onClick={() => remove(m)} style={{ fontSize: 14, fontWeight: 600, color: C.bad }}>{busy === m.id ? 'Removing…' : 'Remove'}</button>
                </div>
              )}
            </div>
          );
        })}
        {b.members.length === 0 && <p style={{ margin: 0, padding: '14px 0', fontSize: 14, color: C.muted }}>No team members yet.</p>}
      </div>
      <Muted>Trips this month are counted from the 1st. “Spend” covers trips billed to this business account.</Muted>
    </div>
  );
}
