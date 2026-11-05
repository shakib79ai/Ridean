'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useRidean } from '@ridean/web-core/src/api-context';
import { Card, Icon, PageHead } from '@/components/ui';
import { useLoad } from '@/lib/useLoad';

const DOCS_URL = 'https://github.com/shakib79ai/Ridean/blob/main/docs/ARCHITECTURE.md';

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'How do I process a supplier settlement?',
    a: (
      <>Go to <Link href="/settlements" className="az-a">Settlements</Link>, find the supplier and select Pay. This records a payment on the supplier’s ledger and lowers what we owe them — it doesn’t move money itself, so record it once you’ve paid them by card, ACH or bank transfer. Only Finance users and Administrators can record payments.</>
    ),
  },
  {
    q: 'How do I suspend a driver?',
    a: (
      <>Drivers are managed by our supply partners, not by Ridean. <Link href="/drivers" className="az-a">Drivers & Suppliers</Link> shows the chauffeurs partners have assigned to our bookings. To stop working with a driver, contact their partner. To stop all new bookings from a partner, pause the supplier under <Link href="/suppliers" className="az-a">Supplier accounts</Link>.</>
    ),
  },
  {
    q: 'How do I resolve a supplier dispute?',
    a: (
      <>Open the supplier under <Link href="/suppliers" className="az-a">Supplier accounts</Link> and check its ledger against their statement. If an amount is wrong, a Finance user or Administrator can record an adjustment with a note — the running balance updates straight away. The <Link href="/reports" className="az-a">Transaction report</Link> lists every booking behind the totals.</>
    ),
  },
  {
    q: 'Can I change platform commission rates?',
    a: (
      <>Commission and markup are set per supplier: open the supplier under <Link href="/suppliers" className="az-a">Supplier accounts</Link> and edit its commercial terms. New suppliers start from the defaults in <Link href="/settings" className="az-a">Settings</Link> → Defaults for new suppliers. Changes apply to new quotes; existing bookings keep the price they were booked at.</>
    ),
  },
  {
    q: 'How do I add another admin teammate?',
    a: (
      <>An Administrator can add them under <Link href="/settings" className="az-a">Settings</Link> → Team & roles → Add teammate. They need a Ridean account first — ask them to sign up on the Ridean website or app, then enter that email and choose Operations, Finance or Administrator.</>
    ),
  },
  {
    q: 'How do I pause bookings?',
    a: (
      <>An Administrator can go to <Link href="/settings" className="az-a">Settings</Link> → Danger zone → Pause bookings. Quote search and new bookings are refused on the website, app and this panel until you resume; trips already booked continue as normal.</>
    ),
  },
  {
    q: 'How do I book for a customer?',
    a: (
      <>Use <Link href="/bookings/new" className="az-a">New booking</Link>: search for a quote, choose a vehicle, enter the passenger’s details and pick how they pay — their saved card, or an invoice collected outside the app. If the email has no Ridean account yet, one is created for their trips. You need the Operations or Administrator role.</>
    ),
  },
];

function HelpCard({ icon, title, sub, href, external }: { icon: string; title: string; sub: string; href?: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="az-card az-row"
      style={{ flexWrap: 'nowrap', gap: 16, padding: 20 }}
    >
      <div className="az-ic" style={{ width: 44, height: 44, borderRadius: 12 }}><Icon name={icon} size={20} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div className="az-muted" style={{ fontSize: 13.5, marginTop: 3 }}>{sub}</div>
      </div>
      <Icon name={external ? 'external' : 'chevronRight'} size={17} style={{ color: 'var(--muted)' }} />
    </a>
  );
}

export default function HelpPage() {
  const { api } = useRidean();
  const settings = useLoad(() => api.admin.settings(), [api]);
  const support = settings.data?.general.supportEmail;
  const platform = settings.data?.general.platformName ?? 'Ridean';

  return (
    <>
      <PageHead title="Help & support" sub="Answers for the admin panel" searchPlaceholder="Search bookings, customers…" />

      <div className="az-grid az-g-main" style={{ alignItems: 'start' }}>
        <Card title="Frequently asked questions" desc="Common operations tasks, answered">
          <div style={{ marginTop: 8 }}>
            {FAQ.map((f, i) => (
              <details key={f.q} className="az-faq" open={i === 0} style={i === FAQ.length - 1 ? { borderBottom: 'none' } : undefined}>
                <summary>
                  {f.q}
                  <Icon name="chevronDown" size={18} style={{ color: 'var(--muted)' }} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Card>

        <div className="az-stack" style={{ gap: 16 }}>
          {settings.error && !support ? (
            <div className="az-alert" role="alert">
              Couldn’t load the support contact. <button type="button" className="az-a" onClick={settings.reload}>Try again</button>
            </div>
          ) : (
            <HelpCard icon="chat" title="Contact platform support" sub={support ? `Email the ${platform} platform team · ${support}` : 'Loading support contact…'} href={support ? `mailto:${support}` : undefined} />
          )}
          <HelpCard icon="file" title="Documentation" sub="Architecture and admin guide on GitHub" href={DOCS_URL} external />
          {support && (
            <HelpCard icon="alert" title="Report an incident" sub="Payments, outages or safety issues" href={`mailto:${support}?subject=${encodeURIComponent('Incident')}`} />
          )}
        </div>
      </div>
    </>
  );
}
