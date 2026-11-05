'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRidean } from '@ridean/web-core/src/api-context';
import { PageHead } from '@/components/Shell';
import { EMPTY_SUPPLIER, SupplierForm } from '@/components/SupplierForm';

export default function NewSupplier() {
  const { api } = useRidean();
  const router = useRouter();
  return (
    <>
      <Link href="/suppliers" className="rd-link" style={{ fontSize: 14 }}>← Supplier accounts</Link>
      <PageHead title="Add supplier" sub="Connect a new API partner. Add its credentials as SUPPLIER_<CODE>_* environment variables on the API server." />
      <div className="rd-card">
        <SupplierForm isNew initial={EMPTY_SUPPLIER} onSave={async (v) => { const s = await api.admin.createSupplier(v); router.push(`/suppliers/${s.id}`); }} />
      </div>
    </>
  );
}
