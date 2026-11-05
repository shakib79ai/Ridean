'use client';

// Commercial terms editor (inventory type, commission, markup, payment flow, cycle, terms) — Supplier accounts design.
import { useEffect, useState } from 'react';
import { toMinor, type PaymentFlow, type SupplierCommercialTerms } from '@ridean/shared';
import { Field, Icon, Seg } from '@/components/ui';

export const ADAPTERS = ['generic_http', 'curb', 'sixt', 'hertz', 'priceline', 'mozio'];

export const FLOW_OPTIONS: { value: PaymentFlow; title: string; desc: string; icon: string }[] = [
  { value: 'corporate_card', title: 'Corporate credit card', desc: 'We pay the supplier with our company card at booking or on their invoice.', icon: 'card' },
  { value: 'ach_debit', title: 'ACH bank debit', desc: 'The supplier debits our bank account on each settlement cycle.', icon: 'bank' },
  { value: 'supplier_collects', title: 'Supplier charges the customer', desc: 'The customer’s card is charged on the supplier’s merchant account. The supplier owes us commission + markup.', icon: 'swap' },
];

export const FLOW_ICON: Record<string, string> = { corporate_card: 'card', ach_debit: 'bank', supplier_collects: 'swap' };

/** Numeric input that keeps the user's text while typing and reports a number. */
function NumInput({ value, onChange, affix, label, disabled, step = '0.01', max }: { value: number; onChange: (n: number) => void; affix: string; label: string; disabled?: boolean; step?: string; max?: number }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (Number(text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="az-in-affix">
      {affix === '$' && <span className="affix">$</span>}
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step={step}
        aria-label={label}
        disabled={disabled}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
      />
      {affix === '%' && <span className="affix">%</span>}
    </div>
  );
}

export function TermsFields({ terms: t, onChange, disabled }: { terms: SupplierCommercialTerms; onChange: (patch: Partial<SupplierCommercialTerms>) => void; disabled?: boolean }) {
  const gross = t.inventoryType === 'gross';
  return (
    <>
      <div className="az-field">
        <span>Inventory type</span>
        <Seg
          label="Inventory type"
          value={t.inventoryType}
          onChange={(v) => !disabled && onChange({ inventoryType: v })}
          options={[['net', 'Net rate (supplier cost)'], ['gross', 'Gross rate (with commission)']] as const}
        />
      </div>
      <div className="az-grid" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${gross ? 180 : 220}px, 1fr))`, gap: 12 }}>
        {gross && (
          <Field label="Commission from supplier">
            <NumInput label="Commission percent" affix="%" max={100} step="0.1" value={t.commissionPct} disabled={disabled} onChange={(n) => onChange({ commissionPct: Math.min(100, n) })} />
          </Field>
        )}
        <div className="az-field">
          <span>Markup type</span>
          <Seg
            label="Markup type"
            value={t.markupType}
            onChange={(v) => {
              if (disabled || v === t.markupType) return;
              onChange({ markupType: v, markupValue: 0 });
            }}
            options={[['percent', 'Percent'], ['fixed', 'Fixed $']] as const}
          />
        </div>
        <Field label="Markup value">
          {t.markupType === 'percent' ? (
            <NumInput label="Markup percent" affix="%" step="0.1" value={t.markupValue} disabled={disabled} onChange={(n) => onChange({ markupValue: n })} />
          ) : (
            <NumInput label="Markup amount" affix="$" value={t.markupValue / 100} disabled={disabled} onChange={(n) => onChange({ markupValue: toMinor(n) })} />
          )}
        </Field>
      </div>
      <div className="az-muted" style={{ fontSize: 13, marginTop: 4 }}>How we pay or collect</div>
      <div className="az-stack" style={{ gap: 10 }} role="radiogroup" aria-label="How we pay or collect">
        {FLOW_OPTIONS.map((o) => {
          const on = t.paymentFlow === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              className="az-opt"
              style={{ alignItems: 'flex-start', ...(on ? { borderColor: 'var(--gold)', background: 'var(--on)' } : null), ...(disabled ? { cursor: 'not-allowed', opacity: on ? 1 : 0.7 } : null) }}
              disabled={disabled}
              onClick={() => onChange({ paymentFlow: o.value })}
            >
              <div className="az-ic" style={{ width: 40, height: 40, borderRadius: 10 }}><Icon name={o.icon} size={18} /></div>
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 15 }}>{o.title}</div>
                <div className="az-muted" style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 3, whiteSpace: 'normal' }}>{o.desc}</div>
              </div>
              <span className={`az-radio ${on ? 'on' : ''}`} />
            </button>
          );
        })}
      </div>
      <div className="az-form" style={{ gap: 12 }}>
        <Field label="Settlement cycle">
          <select className="az-in" value={t.settlementCycle} disabled={disabled} onChange={(e) => onChange({ settlementCycle: e.target.value as SupplierCommercialTerms['settlementCycle'] })}>
            <option value="per_booking">Per booking</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Payment terms">
          <input className="az-in" maxLength={100} value={t.paymentTerms ?? ''} disabled={disabled} placeholder="e.g. Net 15" onChange={(e) => onChange({ paymentTerms: e.target.value })} />
        </Field>
      </div>
    </>
  );
}

/** Adapter + JSON config editor, collapsed by default. */
export function IntegrationFields({ adapter, config, onAdapter, onConfig, disabled, code }: { adapter: string; config: string; onAdapter: (a: string) => void; onConfig: (c: string) => void; disabled?: boolean; code?: string }) {
  const list = ADAPTERS.includes(adapter) ? ADAPTERS : [adapter, ...ADAPTERS];
  return (
    <div className="az-stack" style={{ gap: 14 }}>
      <div className="az-form" style={{ gap: 12 }}>
        <Field label="API adapter">
          <select className="az-in" value={adapter} disabled={disabled} onChange={(e) => onAdapter(e.target.value)}>
            {list.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        {code && (
          <Field label="Credentials">
            <input className="az-in" readOnly value={`SUPPLIER_${code.toUpperCase()}_*`} aria-readonly="true" />
          </Field>
        )}
      </div>
      <Field label="Adapter config (JSON — endpoints and field mappings for generic_http; credentials stay in environment variables)">
        <textarea className="az-in" rows={7} value={config} disabled={disabled} spellCheck={false} onChange={(e) => onConfig(e.target.value)} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 }} />
      </Field>
    </div>
  );
}

/** Parse the JSON textarea; throws a readable error. */
export function parseConfig(text: string): Record<string, unknown> {
  if (!text.trim()) return {};
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new Error('Adapter config must be valid JSON.');
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Adapter config must be a JSON object.');
  return v as Record<string, unknown>;
}
