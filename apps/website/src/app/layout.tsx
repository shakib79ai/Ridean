import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@ridean/web-core/src/styles.css';
import './globals.css';
import './design.css';
import { ToastProvider } from '@/components/site/ui';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'Ridean — Arrive exceptionally', template: '%s · Ridean' },
  description: 'Premium mobility for wherever life takes you — rides, airport transfers, hourly and luxury chauffeurs, and car rentals in one place.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: { title: 'Ridean — Arrive exceptionally', description: 'Ride | Transfer | Rent — worldwide.' },
};

export const viewport: Viewport = { themeColor: '#071A14', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="dz">
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
