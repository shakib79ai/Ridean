import type { ReactNode } from 'react';
import { AccountShell } from '@/components/site/AccountShell';

export const metadata = { title: 'Your account' };

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
