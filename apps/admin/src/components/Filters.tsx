'use client';

import { SERVICE_LIST, type Supplier } from '@ridean/shared';

export function SupplierSelect({ suppliers, value, onChange, all = 'All suppliers' }: { suppliers: Supplier[]; value: string; onChange: (v: string) => void; all?: string }) {
  return (
    <select className="inp" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{all}</option>
      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}

export function ServiceSelect({ value, onChange, all = 'All services' }: { value: string; onChange: (v: string) => void; all?: string }) {
  return (
    <select className="inp" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{all}</option>
      {SERVICE_LIST.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
    </select>
  );
}
