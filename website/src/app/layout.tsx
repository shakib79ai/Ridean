import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ridean — Mobility, on your terms.",
  description:
    "Ride Now, airport transfers, hourly & luxury chauffeurs, and car rentals — compared across trusted suppliers and booked in one app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
