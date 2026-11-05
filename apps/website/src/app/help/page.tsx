import { StaticPage } from '@/components/StaticPage';

export const metadata = { title: 'Help centre' };

const FAQ: [string, string][] = [
  ['How is the price calculated?', 'We compare our partners and show a single upfront price including taxes and fees. It will not change after you book unless you change the trip.'],
  ['How does Meet & Greet work?', 'Add your flight number when you book. Your chauffeur tracks the flight and waits in arrivals with a name sign. Waiting time after landing is included.'],
  ['Can I cancel?', 'Most bookings can be cancelled free of charge up to 1 hour before pickup. The exact policy is shown on each quote before you pay.'],
  ['When am I charged?', 'Your card is authorised when you book and charged once the partner confirms. For some partners you pay them directly — this is shown at checkout.'],
  ['Can I return a rental car somewhere else?', 'Yes. Untick “Return to same location” in the search and enter the return location. Fees may apply depending on the partner.'],
  ['How do I use my wallet?', 'Top up your Ridean wallet from your account and choose “Wallet” at checkout.'],
];

export default function HelpPage() {
  return (
    <StaticPage eyebrow="Help centre" title="How can we help?">
      {FAQ.map(([q, a]) => (
        <details key={q} className="rd-card" style={{ padding: '16px 20px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{q}</summary>
          <p className="rd-muted" style={{ margin: '10px 0 0', lineHeight: 1.6 }}>{a}</p>
        </details>
      ))}
    </StaticPage>
  );
}
