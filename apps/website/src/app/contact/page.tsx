import { InfoGrid, StaticPage } from '@/components/StaticPage';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <StaticPage eyebrow="Contact" title="We're here to help" intro="Reach our team any time, day or night.">
      <InfoGrid items={[
        ['Email', 'support@ridean.com'],
        ['Business enquiries', 'business@ridean.com'],
        ['Partners & suppliers', 'partners@ridean.com'],
        ['Press', 'press@ridean.com'],
      ]} />
    </StaticPage>
  );
}
