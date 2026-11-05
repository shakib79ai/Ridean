import Link from 'next/link';
import { InfoGrid, StaticPage } from '@/components/StaticPage';

export const metadata = { title: 'Ridean for Business' };

export default function BusinessPage() {
  return (
    <StaticPage eyebrow="Ridean for Business" title="Ground travel for your whole team" intro="Centralised billing, travel policies and reporting for companies of every size.">
      <InfoGrid items={[
        ['Monthly invoicing', 'One consolidated invoice instead of dozens of receipts.'],
        ['Travel policies', 'Set allowed classes, hours and spending limits.'],
        ['Reporting', 'Export trip data by team, cost centre or project.'],
        ['Dedicated account manager', 'A named contact for onboarding and support.'],
      ]} />
      <div><Link href="/contact" className="rd-btn">Talk to sales</Link></div>
    </StaticPage>
  );
}
