import { InfoGrid, StaticPage } from '@/components/StaticPage';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <StaticPage eyebrow="About Ridean" title="Premium mobility, one search away" intro="We bring together rides, airport transfers, car rental and chauffeurs from vetted partners, so you can compare and book in one place.">
      <InfoGrid items={[
        ['Upfront prices', 'The price you see is the price you pay. No surge, no surprises.'],
        ['Vetted partners', 'Every supplier is licensed, insured and reviewed before joining Ridean.'],
        ['One account', 'All your trips, receipts and payment methods in one place.'],
        ['Real support', 'Our team is available 24/7 whenever you need help.'],
      ]} />
    </StaticPage>
  );
}
