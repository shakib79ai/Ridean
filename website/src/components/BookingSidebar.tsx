"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CHECKER_SQUARES: { x: number; y: number }[] = [];
for (let x = 0; x < 264; x += 16) CHECKER_SQUARES.push({ x, y: 0 });
for (let x = 8; x < 264; x += 16) CHECKER_SQUARES.push({ x, y: 8 });

function Checkerboard() {
  return (
    <div className="absolute top-0 left-0 right-0">
      <svg width="264" height="16" viewBox="0 0 264 16" aria-hidden="true" className="block">
        <rect width="264" height="16" fill="#12305F" />
        {CHECKER_SQUARES.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width="8" height="8" fill="#F4B000" />
        ))}
      </svg>
    </div>
  );
}

const NAV_ITEMS: { key: string; label: string; href: string; path: React.ReactNode }[] = [
  {
    key: "home",
    label: "Book a ride",
    href: "/ride-now",
    path: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />,
  },
  {
    key: "airport",
    label: "Airport Transfer",
    href: "/airport-transfer",
    path: (
      <>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6" />
      </>
    ),
  },
  {
    key: "rent",
    label: "Rent",
    href: "/compare-rentals",
    path: (
      <>
        <circle cx="8" cy="15" r="4" />
        <path d="M11 12l9-9M16 7l3 3" />
      </>
    ),
  },
  {
    key: "trips",
    label: "Trips",
    href: "/trips",
    path: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </>
    ),
  },
  {
    key: "billing",
    label: "Billing",
    href: "/wallet",
    path: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h13v4" />
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <circle cx="16.5" cy="13.5" r="1.2" />
      </>
    ),
  },
  {
    key: "support",
    label: "Support",
    href: "/profile/help",
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8" />
        <path d="M12 17h.01" />
      </>
    ),
  },
  {
    key: "business",
    label: "Business",
    href: "/profile/business",
    path: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="1" />
        <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
      </>
    ),
  },
  {
    key: "profile",
    label: "Profile",
    href: "/profile",
    path: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/profile") return pathname === "/profile" || pathname.startsWith("/profile/edit") || pathname.startsWith("/profile/addresses") || pathname.startsWith("/profile/settings") || pathname.startsWith("/profile/invoices") || pathname.startsWith("/profile/payment-methods") || pathname.startsWith("/profile/legal");
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BookingSidebar() {
  const pathname = usePathname() || "/dashboard";

  return (
    <aside className="relative w-[264px] shrink-0 bg-navy text-white flex flex-col px-4 pt-11 pb-6 min-h-screen">
      <Checkerboard />
      <Link href="/dashboard" className="flex items-center gap-2.5 h-11 px-1.5">
        <div className="w-9 h-9 rounded-[11px] bg-acc shrink-0 flex items-center justify-center shadow-[0_4px_12px_rgba(244,176,0,0.35)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A1F44" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 15l1.6-4.6A2 2 0 0 1 6.5 9h11a2 2 0 0 1 1.9 1.4L21 15v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
            <circle cx="7.5" cy="13" r="1" />
            <circle cx="16.5" cy="13" r="1" />
          </svg>
        </div>
        <span className="font-display text-[28px] font-extrabold tracking-tight text-white">
          Ride<span className="text-acc">an</span>
        </span>
      </Link>
      <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 h-12 px-3.5 rounded-[14px] text-[15px] font-semibold transition-colors ${
                active ? "bg-navy-2 text-white" : "text-sidebar-muted hover:bg-navy-2/60"
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={active ? "#F4B000" : "#B5C8E6"}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.path}
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-3.5">
        <div className="bg-navy-2 rounded-[18px] p-4 flex flex-col gap-2">
          <div className="text-[15px] leading-tight font-bold">Install Ridean</div>
          <div className="text-[13px] leading-tight text-sidebar-muted">
            Use it like an app, with trip details and receipts offline.
          </div>
          <button type="button" className="h-10 rounded-xl bg-acc text-navy text-sm font-bold">
            Install app
          </button>
        </div>
        <Link href="/profile" className="flex items-center gap-3 px-1.5">
          <div className="w-11 h-11 rounded-full bg-navy-2 text-acc flex items-center justify-center font-display font-bold text-base shrink-0">
            SR
          </div>
          <div>
            <div className="text-[15px] leading-tight font-bold">Shakib Rahman</div>
            <div className="text-[13px] leading-tight text-sidebar-muted">Personal profile</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
