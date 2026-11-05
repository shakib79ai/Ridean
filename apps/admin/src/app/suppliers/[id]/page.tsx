'use client';

import { use } from 'react';
import { SupplierAccounts } from '@/components/partners/SupplierAccounts';

export default function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <SupplierAccounts selectedId={id} />;
}
