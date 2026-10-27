import Link from "next/link";
import { user } from "@/data/mock";
import { TabHeader } from "@/components/HeroHeader";
import { GearIcon, StarIcon, PencilIcon } from "@/components/Icons";

const MENU = [
  { label: "Payment methods", sub: "Cards & billing", href: "/profile/payment-methods" },
  { label: "Saved addresses", sub: "Home, work & more", href: "/profile/addresses" },
  { label: "Invoices", sub: "Receipts & ride history", href: "/profile/invoices" },
  { label: "Business account", sub: "Company travel & expensing", href: "/profile/business" },
  { label: "Settings", sub: "Notifications, language & app", href: "/profile/settings" },
  { label: "Help & support", sub: "Help center & live chat", href: "/profile/help" },
  { label: "Legal & privacy", sub: "Terms, policies & licenses", href: "/profile/legal" },
];

export default function Profile() {
  return (
    <>
      <TabHeader
        title="Profile"
        action={{ icon: <GearIcon className="w-[22px] h-[22px]" />, label: "Settings", href: "/profile/settings" }}
      />
      <div className="flex-1 bg-ground px-4 pt-1 pb-6 flex flex-col gap-3">
        <div className="bg-surface border border-line shadow-sm rounded-[24px] p-4 flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-full bg-navy-2 flex items-center justify-center text-xl font-extrabold text-acc flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[22px] font-bold text-navy truncate" style={{ fontFamily: "var(--font-display)" }}>{user.name}</div>
            <div className="text-[13px] text-muted truncate">{user.email}</div>
            <div className="text-[13px] text-muted mt-0.5 flex items-center gap-1">
              <StarIcon className="w-[12px] h-[12px] text-acc" />
              {user.rating} · Member since {user.memberSince}
            </div>
          </div>
          <Link
            href="/profile/edit"
            aria-label="Edit profile"
            className="w-11 h-11 rounded-full bg-ground flex items-center justify-center flex-shrink-0"
          >
            <PencilIcon className="w-[18px] h-[18px] text-navy" />
          </Link>
        </div>

        <div className="bg-surface border border-line shadow-sm rounded-[24px] flex flex-col overflow-hidden">
          {MENU.map((m, i) => (
            <Link
              key={m.label}
              href={m.href}
              className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="flex-1">
                <div className="text-[16px] font-semibold text-navy">{m.label}</div>
                <div className="text-[13px] text-muted mt-0.5">{m.sub}</div>
              </div>
              <span className="text-muted text-lg">›</span>
            </Link>
          ))}
        </div>

        <Link
          href="/sign-in"
          className="text-center text-[16px] font-bold text-bad mt-1 py-3 border border-bad rounded-2xl"
        >
          Sign out
        </Link>
      </div>
    </>
  );
}
