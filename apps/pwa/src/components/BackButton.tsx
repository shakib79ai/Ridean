'use client';

import { useRouter } from 'next/navigation';
import { IconChevron } from '@ridean/web-core';

export function BackButton({ label = 'Back' }: { label?: string }) {
  const router = useRouter();
  return (
    <button className="app-back" onClick={() => router.back()}>
      <IconChevron size={18} style={{ transform: 'rotate(180deg)' }} /> {label}
    </button>
  );
}
