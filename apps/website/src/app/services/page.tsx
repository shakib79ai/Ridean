import Link from 'next/link';
import { SERVICE_LIST } from '@ridean/shared';
import { StaticPage } from '@/components/StaticPage';

export const metadata = { title: 'Services' };

export default function ServicesPage() {
  return (
    <StaticPage eyebrow="Services" title="Every way to get there" intro="Ridean compares trusted partners for each journey and shows you one upfront price.">
      <div className="rd-grid-2">
        {SERVICE_LIST.map((s) => (
          <Link key={s.key} href={`/${s.slug}`} className="rd-card" style={{ padding: 22, display: 'block' }}>
            <h3 className="rd-display" style={{ fontSize: 26, margin: '0 0 6px' }}>{s.label}</h3>
            <p className="rd-muted" style={{ margin: 0 }}>{s.tagline}</p>
            <span className="rd-link" style={{ display: 'inline-block', marginTop: 12 }}>Book {s.label.toLowerCase()} →</span>
          </Link>
        ))}
      </div>
    </StaticPage>
  );
}
