import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 240 240" className="shrink-0">
        <rect width="240" height="240" rx="54" fill="#F4B000" />
        <g transform="rotate(-25 120 120)">
          <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" opacity="0.22" transform="translate(16 14)" />
          <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" />
        </g>
      </svg>
      <span className="text-[19px] font-extrabold text-navy">
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
