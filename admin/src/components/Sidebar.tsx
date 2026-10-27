"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GridIcon,
  CalendarIcon,
  CarIcon,
  UsersIcon,
  CreditCardIcon,
  GearIcon,
  HelpCircleIcon,
  LogoutIcon,
} from "./icons";
import { admin } from "@/data/mock";

const NAV = [
  { href: "/", label: "Dashboard", icon: GridIcon },
  { href: "/bookings", label: "Bookings", icon: CalendarIcon },
  { href: "/drivers", label: "Drivers & Suppliers", icon: CarIcon },
  { href: "/users", label: "Users", icon: UsersIcon },
  { href: "/settlements", label: "Settlements", icon: CreditCardIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
  { href: "/help", label: "Help & Support", icon: HelpCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const squares = Array.from({ length: 60 }, (_, i) => {
    const col = i % 30;
    const row = Math.floor(i / 30);
    if ((col + row) % 2 !== 0) return null;
    return <rect key={i} x={col * 8} y={row * 8} width={8} height={8} fill="#F4B000" />;
  });

  return (
    <div className="relative w-60 min-w-60 bg-navy flex flex-col sticky top-0 h-screen pt-6">
      <svg width="240" height="16" viewBox="0 0 240 16" className="absolute top-0 left-0 right-0" aria-hidden="true">
        <rect width="240" height="16" fill="#12305F" />
        {squares}
      </svg>

      <div className="flex items-center gap-2.5 px-5 pb-5">
        <div className="w-9 h-9 rounded-[11px] bg-acc flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(244,176,0,.35)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A1F44" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 15l1.6-4.6A2 2 0 0 1 6.5 9h11a2 2 0 0 1 1.9 1.4L21 15v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
            <circle cx="7.5" cy="13" r="1" />
            <circle cx="16.5" cy="13" r="1" />
          </svg>
        </div>
        <div>
          <div className="font-display text-white text-[19px] font-extrabold leading-tight">
            Ride<span className="text-acc">an</span>
          </div>
          <div className="text-muted-on-dark text-[10px] font-semibold tracking-wide">ADMIN PANEL</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-11 px-4 rounded-[14px] text-[13.5px] font-semibold transition-colors ${
                active ? "bg-navy-2 text-white" : "text-muted-on-dark hover:bg-navy-2/60 hover:text-white"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? "text-acc" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-grow" />

      <Link
        href="/profile"
        className="m-4 p-3.5 bg-navy-2 rounded-[18px] flex items-center gap-2.5 hover:bg-navy-3/40 transition-colors"
      >
        <div className="font-display w-[34px] h-[34px] rounded-full bg-navy-3 flex items-center justify-center text-white font-bold text-[13px]">
          {admin.initials}
        </div>
        <div className="flex-grow min-w-0">
          <div className="text-white text-[12.5px] font-bold truncate">{admin.name}</div>
          <div className="text-muted-on-dark text-[10.5px] truncate">{admin.role}</div>
        </div>
        <LogoutIcon className="w-[18px] h-[18px] text-muted-on-dark" />
      </Link>
    </div>
  );
}
