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

  return (
    <div className="w-60 min-w-60 bg-navy flex flex-col sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <svg width="32" height="32" viewBox="0 0 240 240" className="shrink-0">
          <rect width="240" height="240" rx="54" fill="#F4B000" />
          <g transform="rotate(-25 120 120)">
            <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" opacity="0.22" transform="translate(16 14)" />
            <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" />
          </g>
        </svg>
        <div>
          <div className="text-white text-[14.5px] font-extrabold leading-tight">Ridean</div>
          <div className="text-muted-on-dark text-[10.5px] font-semibold tracking-wide">ADMIN PANEL</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-11 px-4 rounded-[10px] text-[13.5px] font-semibold transition-colors ${
                active ? "bg-navy-2 text-white" : "text-muted-on-dark hover:bg-navy-2/60 hover:text-white"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-grow" />

      <Link
        href="/profile"
        className="m-4 p-3.5 bg-navy-2 rounded-xl flex items-center gap-2.5 hover:bg-navy-3/40 transition-colors"
      >
        <div className="w-[34px] h-[34px] rounded-full bg-navy-3 flex items-center justify-center text-white font-bold text-[13px]">
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
