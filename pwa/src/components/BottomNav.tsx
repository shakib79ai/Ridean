"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, TripsIcon, WalletIcon, HelpIcon, PersonIcon } from "./Icons";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/trips", label: "Trips", icon: TripsIcon },
  { href: "/wallet", label: "Wallet", icon: WalletIcon },
  { href: "/profile/help", label: "Help", icon: HelpIcon },
  { href: "/profile", label: "Profile", icon: PersonIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="sticky bottom-0 inset-x-0 h-[68px] bg-surface border-t border-line flex items-center justify-around flex-shrink-0 z-10">
      {TABS.map((t) => {
        const active = pathname === t.href;
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="flex flex-col items-center gap-1 flex-1 h-full justify-center"
          >
            <div
              className={
                active
                  ? "bg-acc rounded-2xl px-3.5 py-1.5 flex items-center justify-center"
                  : "px-3.5 py-1.5 flex items-center justify-center"
              }
            >
              <Icon className={`w-[19px] h-[19px] ${active ? "text-navy" : "text-muted-on-dark"}`} />
            </div>
            <span
              className={`text-[10px] font-bold ${
                active ? "text-navy" : "text-muted-on-dark"
              }`}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
