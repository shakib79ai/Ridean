import type { ReactNode } from 'react';
import { TabBar } from '@/components/site/TabBar';

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="pw-tabbed">{children}</div>
      <TabBar />
    </>
  );
}
