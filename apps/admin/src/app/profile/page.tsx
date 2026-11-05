'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useRidean } from '@ridean/web-core/src/api-context';
import { ROLE_LABEL } from '@/components/Shell';
import { Avatar, Btn, Card, Field, Loading, Modal, PageHead, useToast } from '@/components/ui';

export default function ProfilePage() {
  const { api, user, refresh, logout } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(`${user.firstName} ${user.lastName}`.trim());
    setPhone(user.phone ?? '');
  }, [user]);

  if (!user) return <Loading />;

  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ');
  const dirty = firstName !== user.firstName || lastName !== user.lastName || phone.trim() !== (user.phone ?? '');
  const display = name.trim() || `${user.firstName} ${user.lastName}`;

  async function save() {
    if (!firstName || !lastName) return toast('Enter your first and last name');
    setSaving(true);
    try {
      await api.updateMe({ firstName, lastName, phone: phone.trim() });
      await refresh();
      toast('Profile saved');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHead
        title="Edit profile"
        sub="Your admin account details"
        searchPlaceholder="Search bookings, users, drivers…"
        actions={<Btn kind="y" icon="check" onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</Btn>}
      />

      <div className="az-grid az-g-main" style={{ alignItems: 'start' }}>
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); if (dirty) void save(); }}>
            <div className="az-row" style={{ gap: 18, marginBottom: 22 }}>
              <Avatar name={display} size={84} />
              <div>
                <div className="az-serif" style={{ fontSize: 20, fontWeight: 600 }}>{display}</div>
                <div className="az-muted" style={{ fontSize: 13, marginTop: 3 }}>{ROLE_LABEL[user.role] ?? user.role} · member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
            <div className="az-form">
              <Field label="Full name"><input className="az-in" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></Field>
              <Field label="Email"><input className="az-in" value={user.email} readOnly aria-readonly="true" style={{ color: 'var(--soft)' }} title="Your sign-in email can’t be changed here" /></Field>
              <Field label="Phone"><input className="az-in" type="tel" value={phone} maxLength={32} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+1 (555) 000-0000" /></Field>
              <Field label="Role"><input className="az-in" value={`${ROLE_LABEL[user.role] ?? user.role} · set by an administrator`} readOnly aria-readonly="true" style={{ color: 'var(--soft)' }} /></Field>
            </div>
            <p className="az-muted" style={{ fontSize: 12.5, margin: '14px 0 0' }}>Your sign-in email can’t be changed here. Ask an administrator if your role should change.</p>
            <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
          </form>
        </Card>

        <Card title="Security" desc="Keep your admin account safe">
          <div className="az-stack" style={{ gap: 12, marginTop: 16 }}>
            <Btn icon="lock" block onClick={() => setPwOpen(true)} style={{ justifyContent: 'flex-start' }}>Change password</Btn>
            <Btn icon="logout" block onClick={() => { logout(); router.replace('/login'); }} style={{ justifyContent: 'flex-start' }}>Sign out of this device</Btn>
          </div>
        </Card>
      </div>

      {pwOpen && <ChangePassword onClose={() => setPwOpen(false)} />}
    </>
  );
}

function ChangePassword({ onClose }: { onClose: () => void }) {
  const { api } = useRidean();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError('The new password must be at least 8 characters.');
    if (next !== confirm) return setError('The new passwords don’t match.');
    setBusy(true);
    try {
      await api.changePassword(current, next);
      toast('Password changed');
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Change password" onClose={() => !busy && onClose()}>
      <form onSubmit={submit} className="az-stack" style={{ gap: 14 }}>
        <Field label="Current password"><input className="az-in" type="password" required autoFocus autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
        <Field label="New password"><input className="az-in" type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Field label="Confirm new password"><input className="az-in" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
        <p className="az-muted" style={{ margin: 0, fontSize: 12.5 }}>Use at least 8 characters.</p>
        {error && <div className="az-alert" role="alert">{error}</div>}
        <div className="az-row" style={{ justifyContent: 'flex-end' }}>
          <Btn onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn kind="y" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</Btn>
        </div>
      </form>
    </Modal>
  );
}
