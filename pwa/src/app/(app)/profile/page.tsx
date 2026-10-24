import Link from "next/link";
import { user } from "@/data/mock";
import { CheckeredFlag } from "@/components/HeroHeader";
import { PencilIcon, StarIcon } from "@/components/Icons";

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
      <div className="flex-shrink-0">
        <CheckeredFlag />
        <div className="bg-navy px-5 pt-4 pb-6 flex items-center justify-between">
          <span className="text-[21px] font-extrabold text-white">Profile</span>
          <Link
            href="/profile/edit"
            aria-label="Edit profile"
            className="w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center"
          >
            <PencilIcon className="w-[15px] h-[15px] text-acc" />
          </Link>
        </div>
      </div>
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-2.5">
        <div className="bg-[#F3F8FD] border border-line rounded-[18px] p-4 flex items-center gap-3 mb-1">
          <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center text-xl font-extrabold text-acc flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-bold text-navy truncate">{user.name}</div>
            <div className="text-[12.5px] text-muted truncate">{user.email}</div>
            <div className="text-[12.5px] text-muted mt-0.5 flex items-center gap-1">
              <StarIcon className="w-[11px] h-[11px] text-acc" />
              {user.rating} · Member since {user.memberSince}
            </div>
          </div>
        </div>

        {MENU.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="flex items-center gap-3 bg-surface border border-line rounded-[14px] p-3.5"
          >
            <div className="flex-1">
              <div className="text-[14.5px] font-bold text-navy">{m.label}</div>
              <div className="text-xs text-muted mt-0.5">{m.sub}</div>
            </div>
            <span className="text-muted text-lg">›</span>
          </Link>
        ))}

        <Link
          href="/sign-in"
          className="text-center text-sm font-bold text-bad mt-2 py-3 border border-line rounded-[14px]"
        >
          Sign out
        </Link>
      </div>
    </>
  );
}
