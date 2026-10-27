import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[11px] bg-acc shrink-0 flex items-center justify-center shadow-[0_4px_12px_rgba(244,176,0,0.35)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A1F44" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 15l1.6-4.6A2 2 0 0 1 6.5 9h11a2 2 0 0 1 1.9 1.4L21 15v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
          <circle cx="7.5" cy="13" r="1" />
          <circle cx="16.5" cy="13" r="1" />
        </svg>
      </div>
      <span className="font-display text-[22px] font-extrabold text-navy">
        Ride<span className="text-acc">an</span>
      </span>
    </Link>
  );
}

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#business", label: "Business" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <div className="flex items-center justify-between px-8 md:px-16 py-5 border-b border-line">
      <Logo />
      <div className="hidden lg:flex gap-9 items-center flex-1 justify-center">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm font-bold text-navy-2 hover:text-navy transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex gap-3 items-center">
        <Link href="/sign-in" className="text-sm font-bold text-navy px-3 py-2.5 hidden sm:inline-block">
          Sign in
        </Link>
        <Link
          href="/create-account"
          className="bg-acc text-navy font-extrabold text-sm px-5 py-2.5 rounded-[10px] hover:brightness-95 transition"
        >
          Get the app
        </Link>
      </div>
    </div>
  );
}
