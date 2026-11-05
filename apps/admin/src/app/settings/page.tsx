'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { PlatformSettings, StaffRole, TeamMember } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { ROLE_LABEL } from '@/components/Shell';
import { Avatar, Btn, Card, Empty, Field, Icon, Loading, Modal, PageHead, Seg, useToast } from '@/components/ui';
import { useLoad } from '@/lib/useLoad';

type Draft = Pick<PlatformSettings, 'general' | 'supplierDefaults'>;
const STAFF_ROLES: StaffRole[] = ['ops', 'finance', 'admin'];
const plain: React.CSSProperties = { border: 0, padding: 0, margin: 0, minWidth: 0 };

/** Fixed markup is stored in minor units; the form edits dollars. */
const toForm = (s: PlatformSettings): Draft => ({ general: { ...s.general }, supplierDefaults: { ...s.supplierDefaults } });

export default function SettingsPage() {
  const { api, user } = useRidean();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const settings = useLoad(() => api.admin.settings(), [api]);
  const team = useLoad(() => api.admin.team(), [api]);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [markupText, setMarkupText] = useState('');
  const [saving, setSaving] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [remove, setRemove] = useState<TeamMember | null>(null);
  const [roleBusy, setRoleBusy] = useState<string | null>(null);

  const s = settings.data;
  useEffect(() => {
    if (!s) return;
    setDraft(toForm(s));
    const d = s.supplierDefaults;
    setMarkupText(String(d.markupType === 'fixed' ? d.markupValue / 100 : d.markupValue));
  }, [s]);

  const markupValue = (() => {
    const n = Number(markupText);
    if (!draft || !Number.isFinite(n)) return NaN;
    return draft.supplierDefaults.markupType === 'fixed' ? Math.round(n * 100) : n;
  })();
  const next: Draft | null = draft && { ...draft, supplierDefaults: { ...draft.supplierDefaults, markupValue } };
  const dirty = !!s && !!next && JSON.stringify(next) !== JSON.stringify(toForm(s));

  const setGeneral = (k: keyof Draft['general'], v: string) => draft && setDraft({ ...draft, general: { ...draft.general, [k]: v } });
  const setDefaults = (patch: Partial<Draft['supplierDefaults']>) => draft && setDraft({ ...draft, supplierDefaults: { ...draft.supplierDefaults, ...patch } });

  async function save() {
    if (!next) return;
    const d = next.supplierDefaults;
    if (!Number.isFinite(d.markupValue) || d.markupValue < 0 || (d.markupType === 'percent' && d.markupValue > 100)) return toast('Enter a valid markup');
    if (!Number.isFinite(d.commissionPct) || d.commissionPct < 0 || d.commissionPct > 100) return toast('Commission must be between 0 and 100%');
    setSaving(true);
    try {
      settings.setData(await api.admin.updateSettings(next));
      toast('Settings saved');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePause() {
    if (!s) return;
    setPausing(true);
    try {
      const updated = await api.admin.updateSettings({ bookingsPaused: !s.bookingsPaused });
      settings.setData(updated);
      toast(updated.bookingsPaused ? 'New bookings paused' : 'Bookings resumed');
      setPauseOpen(false);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setPausing(false);
    }
  }

  async function setRole(email: string, role: StaffRole | 'customer') {
    setRoleBusy(email);
    try {
      team.setData(await api.admin.setTeamRole({ email, role }));
      toast(role === 'customer' ? 'Access removed' : `Role changed to ${ROLE_LABEL[role]}`);
      return true;
    } catch (e) {
      toast((e as Error).message);
      return false;
    } finally {
      setRoleBusy(null);
    }
  }

  return (
    <>
      <PageHead
        title="Settings"
        sub="Platform configuration"
        searchPlaceholder="Search bookings, users, drivers…"
        actions={isAdmin ? <Btn kind="y" icon="check" onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</Btn> : undefined}
      />

      {s?.bookingsPaused && (
        <div className="az-alert az-row" role="status" style={{ flexWrap: 'nowrap', gap: 12 }}>
          <Icon name="alert" size={20} />
          <span><strong>New bookings are paused.</strong> Customers can’t get quotes or book until you resume bookings below. Existing trips continue.</span>
        </div>
      )}
      {!isAdmin && <div className="az-note">Only administrators can change platform settings and team roles. You can view them here.</div>}

      {!s || !draft ? (
        <Loading error={settings.error} onRetry={settings.reload} height={380} />
      ) : (
        <div className="az-grid az-g2" style={{ alignItems: 'start' }}>
          <div className="az-stack">
            <Card title="General" desc="Core platform identity and support contact">
              <fieldset disabled={!isAdmin} style={plain}>
                <div className="az-form" style={{ marginTop: 16 }}>
                  <Field label="Platform name"><input className="az-in" value={draft.general.platformName} maxLength={60} onChange={(e) => setGeneral('platformName', e.target.value)} /></Field>
                  <Field label="Operating company"><input className="az-in" value={draft.general.company} maxLength={120} onChange={(e) => setGeneral('company', e.target.value)} /></Field>
                  <Field label="Support email"><input className="az-in" type="email" value={draft.general.supportEmail} onChange={(e) => setGeneral('supportEmail', e.target.value)} /></Field>
                  <Field label="Launch market"><input className="az-in" value={draft.general.market} maxLength={120} onChange={(e) => setGeneral('market', e.target.value)} /></Field>
                </div>
              </fieldset>
            </Card>

            <Card title="Defaults for new suppliers" desc="Commercial terms pre-filled when a supplier is added — each supplier’s own terms are set under Supplier accounts">
              <fieldset disabled={!isAdmin} style={plain}>
                <div className="az-form" style={{ marginTop: 16 }}>
                  <div className="az-field full">
                    <span>Inventory type</span>
                    <Seg label="Inventory type" options={[['net', 'Net rate'], ['gross', 'Gross rate']]} value={draft.supplierDefaults.inventoryType} onChange={(v) => setDefaults({ inventoryType: v })} />
                  </div>
                  <label className="az-field">
                    <span>Commission from supplier</span>
                    <div className="az-in-affix" style={draft.supplierDefaults.inventoryType === 'net' ? { opacity: 0.55 } : undefined}>
                      <input type="number" min={0} max={100} step="0.1" value={draft.supplierDefaults.commissionPct} disabled={draft.supplierDefaults.inventoryType === 'net'} onChange={(e) => setDefaults({ commissionPct: Number(e.target.value) })} />
                      <span className="affix">%</span>
                    </div>
                  </label>
                  <div className="az-field">
                    <span>Our markup</span>
                    <div className="az-row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                      <Seg
                        label="Markup type"
                        style={{ width: 120, flexShrink: 0 }}
                        options={[['percent', '%'], ['fixed', '$']]}
                        value={draft.supplierDefaults.markupType}
                        onChange={(v) => setDefaults({ markupType: v })}
                      />
                      <div className="az-in-affix" style={{ flex: 1, minWidth: 0 }}>
                        {draft.supplierDefaults.markupType === 'fixed' && <span className="affix">$</span>}
                        <input aria-label="Markup value" inputMode="decimal" value={markupText} onChange={(e) => setMarkupText(e.target.value)} />
                        {draft.supplierDefaults.markupType === 'percent' && <span className="affix">%</span>}
                      </div>
                    </div>
                  </div>
                </div>
                {draft.supplierDefaults.inventoryType === 'net' && <p className="az-muted" style={{ fontSize: 12.5, margin: '12px 0 0' }}>Net-rate suppliers don’t pay commission — Ridean earns the markup only.</p>}
              </fieldset>
            </Card>
          </div>

          <Card
            title="Team & roles"
            desc="Staff with access to this panel"
            action={isAdmin ? <Btn kind="g" size="sm" icon="plus" onClick={() => setAddOpen(true)}>Add teammate</Btn> : undefined}
          >
            {!team.data ? (
              <div style={{ marginTop: 14 }}><Loading error={team.error} onRetry={team.reload} height={160} /></div>
            ) : team.data.length === 0 ? (
              <Empty title="No staff yet" />
            ) : (
              <div style={{ marginTop: 6 }}>
                {team.data.map((t) => {
                  const name = `${t.firstName} ${t.lastName}`.trim() || t.email;
                  const self = t.id === user?.id;
                  return (
                    <div key={t.id} className="az-list-row" style={{ gap: 12, padding: '12px 0' }}>
                      <Avatar name={name} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15 }}>{name}{self && <span className="az-muted" style={{ fontSize: 12.5 }}> · you</span>}</div>
                        <div className="az-muted" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.email}</div>
                      </div>
                      <select
                        className="az-in"
                        aria-label={`Role for ${name}`}
                        value={t.role}
                        disabled={!isAdmin || self || roleBusy === t.email}
                        title={self ? 'You can’t change your own role' : undefined}
                        onChange={(e) => {
                          const v = e.target.value as StaffRole | 'customer';
                          if (v === 'customer') setRemove(t);
                          else void setRole(t.email, v);
                        }}
                        style={{ width: 'auto', minWidth: 150, height: 36, borderRadius: 10, fontSize: 13.5, fontWeight: 600, backgroundColor: 'var(--card)' }}
                      >
                        {STAFF_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                        <option value="customer">Remove access</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {s && (
        <div className="az-card" style={{ borderColor: 'rgba(229,100,90,.35)' }}>
          <div className="az-row" style={{ gap: 16 }}>
            <div className="az-ic" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(229,100,90,.14)', color: 'var(--bad)' }}><Icon name="alert" size={20} /></div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="az-bad" style={{ fontSize: 16, fontWeight: 600 }}>Danger zone</div>
              <div className="az-muted" style={{ fontSize: 13.5, marginTop: 3 }}>
                {s.bookingsPaused ? 'New bookings are paused platform-wide. Resume to let customers book again.' : 'Pause new bookings platform-wide — existing trips are not affected.'}
              </div>
            </div>
            {isAdmin && (
              <Btn kind={s.bookingsPaused ? 'y' : 'danger'} onClick={() => setPauseOpen(true)}>{s.bookingsPaused ? 'Resume bookings' : 'Pause bookings'}</Btn>
            )}
          </div>
        </div>
      )}

      {pauseOpen && s && (
        <Modal title={s.bookingsPaused ? 'Resume bookings?' : 'Pause bookings?'} onClose={() => !pausing && setPauseOpen(false)}>
          <p className="az-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
            {s.bookingsPaused
              ? 'Customers will be able to search for quotes and make new bookings again on the website, app and this panel.'
              : 'Quote search and new bookings will be refused everywhere — website, app and this panel — until you resume. Trips already booked continue as normal.'}
          </p>
          <div className="az-row" style={{ justifyContent: 'flex-end' }}>
            <Btn onClick={() => setPauseOpen(false)} disabled={pausing}>Cancel</Btn>
            <Btn kind={s.bookingsPaused ? 'y' : 'danger'} onClick={togglePause} disabled={pausing}>
              {pausing ? 'Saving…' : s.bookingsPaused ? 'Resume bookings' : 'Pause bookings'}
            </Btn>
          </div>
        </Modal>
      )}

      {remove && (
        <Modal title="Remove access?" onClose={() => roleBusy || setRemove(null)}>
          <p className="az-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
            {`${remove.firstName} ${remove.lastName}`.trim() || remove.email} will lose access to the admin panel. Their Ridean customer account stays, so you can add them back later.
          </p>
          <div className="az-row" style={{ justifyContent: 'flex-end' }}>
            <Btn onClick={() => setRemove(null)} disabled={!!roleBusy}>Cancel</Btn>
            <Btn kind="danger" disabled={!!roleBusy} onClick={async () => { if (await setRole(remove.email, 'customer')) setRemove(null); }}>
              {roleBusy ? 'Removing…' : 'Remove access'}
            </Btn>
          </div>
        </Modal>
      )}

      {addOpen && <AddTeammate onClose={() => setAddOpen(false)} onAdded={(list) => { team.setData(list); setAddOpen(false); }} />}
    </>
  );
}

function AddTeammate({ onClose, onAdded }: { onClose: () => void; onAdded: (t: TeamMember[]) => void }) {
  const { api } = useRidean();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('ops');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onAdded(await api.admin.setTeamRole({ email: email.trim(), role }));
      toast(`${email.trim()} added as ${ROLE_LABEL[role]}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Add teammate" onClose={() => !busy && onClose()}>
      <form onSubmit={submit} className="az-stack" style={{ gap: 14 }}>
        <div className="az-note">Your teammate needs a Ridean account first — ask them to sign up on the Ridean website or app with their work email, then enter that email here.</div>
        <Field label="Email of their Ridean account"><input className="az-in" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></Field>
        <Field label="Role">
          <select className="az-in" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            {STAFF_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </Field>
        <p className="az-muted" style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5 }}>Operations can create and manage bookings. Finance can record supplier payments and adjustments and edit supplier terms. Administrators can do everything, including settings, adding suppliers and team roles.</p>
        {error && <div className="az-alert" role="alert">{error}</div>}
        <div className="az-row" style={{ justifyContent: 'flex-end' }}>
          <Btn onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn kind="y" type="submit" disabled={busy || !email.trim()}>{busy ? 'Adding…' : 'Add teammate'}</Btn>
        </div>
      </form>
    </Modal>
  );
}
