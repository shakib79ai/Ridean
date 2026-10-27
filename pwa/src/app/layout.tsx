import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ridean",
  description:
    "Ride Now, airport transfers, hourly & luxury chauffeurs, and car rentals in one installable app.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ridean",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1F44",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
