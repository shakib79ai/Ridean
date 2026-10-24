"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasSession } from "@/lib/session";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ride-now", label: "Ride Now" },
  { href: "/trips", label: "Trips" },
  { href: "/wallet", label: "Wallet" },
];

export default function BookingTopNav() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignedIn(hasSession());
  }, []);

  return (
    <div className="h-16 border-b border-line bg-surface flex items-center justify-between px-8">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 240 240" className="shrink-0">
            <rect width="240" height="240" rx="54" fill="#F4B000" />
            <g transform="rotate(-25 120 120)">
              <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" opacity="0.22" transform="translate(16 14)" />
              <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" />
            </g>
          </svg>
          <span className="text-base font-extrabold text-navy">Ridean</span>
        </Link>
        <div className="hidden md:flex gap-6">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-bold text-navy-2 hover:text-navy transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {signedIn ? (
          <Link href="/profile" className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-acc font-bold text-sm">
            SR
          </Link>
        ) : (
          <Link
            href={`/sign-in?return=${encodeURIComponent(pathname || "/dashboard")}`}
            className="bg-acc text-navy font-extrabold text-sm px-4 py-2 rounded-[10px] hover:brightness-95 transition"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
