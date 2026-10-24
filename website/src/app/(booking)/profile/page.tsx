import Link from "next/link";
import { rUser } from "@/data/booking-mock";

const MENU = [
  { href: "/profile/edit", label: "Edit profile" },
  { href: "/trips", label: "Trip history" },
  { href: "/profile/payment-methods", label: "Payment methods" },
  { href: "/profile/addresses", label: "Saved addresses" },
  { href: "/profile/invoices", label: "Invoices" },
  { href: "/profile/business", label: "Business account" },
  { href: "/profile/help", label: "Help & support" },
  { href: "/profile/settings", label: "Settings" },
  { href: "/profile/legal", label: "Legal & privacy" },
];

export default function Profile() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-acc font-extrabold text-xl">SR</div>
        <div>
          <div className="text-lg font-extrabold text-navy">{rUser.name}</div>
          <div className="text-sm text-muted">{rUser.email}</div>
          <div className="text-xs text-muted mt-0.5">★ {rUser.rating} · Member since {rUser.memberSince}</div>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {MENU.map((m) => (
          <Link key={m.label} href={m.href} className="flex items-center justify-between px-5 py-4 border-b border-line last:border-b-0 hover:bg-ground transition">
            <span className="text-sm font-semibold text-navy">{m.label}</span>
            <span className="text-muted">→</span>
          </Link>
        ))}
      </div>

      <button className="text-left text-sm font-bold text-bad px-5">Sign out</button>
    </div>
  );
}
