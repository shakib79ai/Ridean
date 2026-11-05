import { StaticPage } from '@/components/StaticPage';

export const metadata = { title: 'Terms & privacy' };

export default function LegalPage() {
  return (
    <StaticPage eyebrow="Legal" title="Terms & privacy" intro="Placeholder — replace with the terms and privacy policy approved by your legal counsel before launch.">
      <h2 className="rd-display" style={{ fontSize: 26 }}>Terms of service</h2>
      <p className="rd-muted">Ridean acts as a booking agent for independent transport and rental partners. Each booking is subject to the partner&apos;s conditions shown at checkout.</p>
      <h2 className="rd-display" style={{ fontSize: 26 }}>Privacy</h2>
      <p className="rd-muted">We share the details needed to fulfil a booking (name, phone, pickup details, flight number) with the partner handling your trip. Card details are processed by Stripe and never stored on our servers.</p>
    </StaticPage>
  );
}
