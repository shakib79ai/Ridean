"use client";

import { usePathname } from "next/navigation";

const TITLES: { prefix: string; title: string }[] = [
  { prefix: "/dashboard", title: "Dashboard" },
  { prefix: "/ride-now", title: "Ride Now" },
  { prefix: "/airport-transfer", title: "Airport Transfer" },
  { prefix: "/hourly-chauffeur", title: "Hourly Chauffeur" },
  { prefix: "/luxury-chauffeur", title: "Luxury Chauffeur" },
  { prefix: "/compare-rentals", title: "Rent" },
  { prefix: "/trips", title: "Trips" },
  { prefix: "/wallet", title: "Billing" },
  { prefix: "/payment", title: "Billing" },
  { prefix: "/booking-review", title: "Book a ride" },
  { prefix: "/booking", title: "Trips" },
  { prefix: "/profile/help", title: "Support" },
  { prefix: "/profile/business", title: "Business" },
  { prefix: "/profile", title: "Profile" },
];

function titleFor(pathname: string) {
  const match = TITLES.find((t) => pathname === t.prefix || pathname.startsWith(t.prefix + "/"));
  return match ? match.title : "Ridean";
}

export default function BookingHeader() {
  const pathname = usePathname() || "/dashboard";
  const title = titleFor(pathname);

  return (
    <header className="h-[72px] shrink-0 bg-surface border-b border-line flex items-center justify-between px-8">
      <h1 className="m-0 font-display text-[26px] leading-[34px] font-bold tracking-tight text-navy">{title}</h1>
      <div className="flex items-center gap-3.5">
        <label className="hidden md:flex items-center gap-2.5 w-80 h-11 px-3.5 border border-line rounded-[14px] bg-ground focus-within:ring-2 focus-within:ring-navy">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5D78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-4.5-4.5" />
          </svg>
          <input
            type="text"
            placeholder="Search trips, invoices, help"
            aria-label="Search"
            className="border-0 outline-none bg-transparent w-full text-[15px] text-navy placeholder:text-placeholder"
          />
        </label>
        <button
          type="button"
          aria-label="Notifications"
          className="w-11 h-11 rounded-full bg-surface text-navy border border-line flex items-center justify-center shrink-0"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
            <path d="M10 21h4" />
          </svg>
        </button>
      </div>
    </header>
  );
}
