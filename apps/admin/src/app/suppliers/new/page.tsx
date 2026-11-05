'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SERVICE_LIST, type ServiceKey, type SupplierCommercialTerms } from '@ridean/shared';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Btn, Card, Empty, ErrorText, Field, Icon, Loading, PageHead, ToggleRow, useToast } from '@/components/ui';
import { useStaff } from '@/components/partners/shared';
import { IntegrationFields, TermsFields, parseConfig } from '@/components/partners/TermsFields';
import { useLoad } from '@/lib/useLoad';

const FALLBACK_TERMS: SupplierCommercialTerms = {
  inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 10, paymentFlow: 'ach_debit', settlementCycle: 'weekly', paymentTerms: 'Net 7',
};

export default function NewSupplierPage() {
  const { api } = useRidean();
  const { isAdmin } = useStaff();
  const settings = useLoad(() => api.admin.settings(), [api]);

  return (
    <>
      <PageHead title="Add supplier" sub="Connect a new API partner and set its commercial terms" />
      <Link href="/suppliers" className="az-a" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
        <Icon name="chevronLeft" size={16} /> Supplier accounts
      </Link>
      {!isAdmin ? (
        <Card><Empty title="Admins only">Only admin staff can add suppliers.</Empty></Card>
      ) : !settings.data && !settings.error ? (
        <Loading height={420} />
      ) : (
        <NewSupplierForm
          defaults={settings.data ? { ...FALLBACK_TERMS, ...settings.data.supplierDefaults } : FALLBACK_TERMS}
          defaultsNote={settings.error ? `Couldn’t load the platform defaults (${settings.error}) — using standard terms.` : null}
        />
      )}
    </>
  );
}

function NewSupplierForm({ defaults, defaultsNote }: { defaults: SupplierCommercialTerms; defaultsNote: string | null }) {
  const { api } = useRidean();
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [adapter, setAdapter] = useState('generic_http');
  const [svcs, setSvcs] = useState<ServiceKey[]>([]);
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);
  const [terms, setTerms] = useState<SupplierCommercialTerms>(defaults);
  const [config, setConfig] = useState('{}');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Suggest a code from the name until the user edits it
  useEffect(() => {
    if (!codeTouched) setCode(name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30));
  }, [name, codeTouched]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^[a-z0-9_]{2,30}$/.test(code)) return setErr('Code must be 2–30 lowercase letters, numbers or underscores.');
    if (svcs.length === 0) return setErr('Pick at least one service.');
    let parsed: Record<string, unknown>;
    try {
      parsed = parseConfig(config);
    } catch (e2) {
      return setErr((e2 as Error).message);
    }
    setBusy(true);
    try {
      const input = {
        code,
        name: name.trim(),
        adapter,
        services: svcs,
        active,
        contactEmail: email.trim() || undefined,
        terms: { ...terms, paymentTerms: terms.paymentTerms?.trim() || undefined },
        config: parsed,
      };
      const s = await api.admin.createSupplier(input as Parameters<typeof api.admin.createSupplier>[0]);
      toast(`${s.name} added`);
      router.push(`/suppliers/${s.id}`);
    } catch (e2) {
      setErr((e2 as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="az-stack" style={{ gap: 20, maxWidth: 860 }}>
      <Card title="Supplier">
        <div className="az-stack" style={{ gap: 14, marginTop: 14 }}>
          <div className="az-form">
            <Field label="Name">
              <input className="az-in" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. City Chauffeurs NYC" />
            </Field>
            <Field label="Code (lowercase, numbers, _)">
              <input
                className="az-in"
                required
                pattern="[a-z0-9_]{2,30}"
                value={code}
                onChange={(e) => {
                  setCodeTouched(true);
                  setCode(e.target.value);
                }}
              />
            </Field>
            <Field label="Contact email">
              <input className="az-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partners@supplier.com" />
            </Field>
            <div style={{ alignSelf: 'end' }}>
              <ToggleRow title="Accepting bookings" desc="Route new bookings to this supplier" checked={active} onChange={setActive} />
            </div>
          </div>
          <div className="az-field">
            <span>Services</span>
            <div className="az-chips" role="group" aria-label="Services">
              {SERVICE_LIST.map((s) => {
                const on = svcs.includes(s.key);
                return (
                  <button key={s.key} type="button" className="az-chip" aria-pressed={on} onClick={() => setSvcs(on ? svcs.filter((x) => x !== s.key) : [...svcs, s.key])}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Commercial settings" desc="Pre-filled from the platform’s supplier defaults.">
        <div className="az-stack" style={{ gap: 14, marginTop: 14 }}>
          {defaultsNote && <div className="az-note">{defaultsNote}</div>}
          <TermsFields terms={terms} onChange={(p) => setTerms((t) => ({ ...t, ...p }))} />
        </div>
      </Card>

      <section className="az-card">
        <details>
          <summary className="az-between" style={{ cursor: 'pointer', listStyle: 'none' }}>
            <div>
              <h2>Integration</h2>
              <p className="desc">API adapter and config. Credentials go in SUPPLIER_{(code || 'code').toUpperCase()}_* environment variables on the API server.</p>
            </div>
            <Icon name="chevronDown" size={18} className="az-muted" />
          </summary>
          <div style={{ marginTop: 16 }}>
            <IntegrationFields adapter={adapter} config={config} onAdapter={setAdapter} onConfig={setConfig} />
          </div>
        </details>
      </section>

      <ErrorText>{err}</ErrorText>
      <div className="az-row" style={{ justifyContent: 'flex-end' }}>
        <Btn kind="o" onClick={() => router.push('/suppliers')}>Cancel</Btn>
        <Btn kind="y" type="submit" icon="check" disabled={busy}>{busy ? 'Creating…' : 'Create supplier'}</Btn>
      </div>
    </form>
  );
}
