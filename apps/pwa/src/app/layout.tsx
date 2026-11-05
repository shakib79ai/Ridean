import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import './design.css';
import { RegisterSW } from '@/components/RegisterSW';
import { ToastProvider } from '@/components/site/ui';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'Ridean', template: '%s · Ridean' },
  description: 'Rides, airport transfers, chauffeurs and car rental.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Ridean', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = { themeColor: '#071A14', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="dz" style={{ margin: 0, background: '#071A14', color: '#F3EEDF', fontFamily: "'Inter', sans-serif" }}>
        <Providers>
          <ToastProvider>
            <div className="pw-app" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>{children}</div>
          </ToastProvider>
        </Providers>
        <RegisterSW />
      </body>
    </html>
  );
}
