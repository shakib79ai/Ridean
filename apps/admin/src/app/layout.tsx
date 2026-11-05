import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@ridean/web-core/src/styles.css';
import './globals.css';
import { Providers } from './providers';
import { Shell } from '@/components/Shell';

export const metadata: Metadata = { title: { default: 'Ridean Admin', template: '%s · Ridean Admin' }, robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
