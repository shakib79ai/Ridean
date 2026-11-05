import type { ReactNode } from 'react';

export function StaticPage({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="rd-container" style={{ maxWidth: 900 }}>
      <div className="page-head rd-stack" style={{ ['--gap' as string]: '10px' }}>
        {eyebrow && <span className="rd-eyebrow">{eyebrow}</span>}
        <h1 className="rd-display">{title}</h1>
        {intro && <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#c9d2cb' }}>{intro}</p>}
      </div>
      <div className="rd-stack prose" style={{ paddingBottom: 64, ['--gap' as string]: '16px' }}>{children}</div>
    </div>
  );
}

export function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="rd-grid-2">
      {items.map(([t, s]) => (
        <div key={t} className="rd-card" style={{ padding: 22 }}>
          <h3 className="rd-display" style={{ fontSize: 22, margin: '0 0 6px' }}>{t}</h3>
          <p className="rd-muted" style={{ margin: 0, lineHeight: 1.6 }}>{s}</p>
        </div>
      ))}
    </div>
  );
}
