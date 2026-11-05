import { notFound } from 'next/navigation';
import { SERVICE_LIST, serviceBySlug, type CoreServiceKey } from '@ridean/shared';
import { BookingSearch } from '@ridean/web-core';
import { BackButton } from '@/components/BackButton';

export function generateStaticParams() {
  return SERVICE_LIST.map((s) => ({ service: s.slug }));
}

export default async function BookService({ params }: { params: Promise<{ service: string }> }) {
  const def = serviceBySlug((await params).service);
  if (!def) notFound();
  return (
    <div className="rd-stack" style={{ ['--gap' as string]: '14px' }}>
      <BackButton />
      <h1 className="app-title">{def.label}</h1>
      <p className="rd-muted" style={{ margin: 0 }}>{def.tagline}</p>
      <BookingSearch services={[def.key as CoreServiceKey]} hideTabs />
    </div>
  );
}
