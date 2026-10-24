import Link from "next/link";

export function Footer() {
  return (
    <div className="bg-surface px-8 md:px-16 pt-14 pb-8 flex flex-col gap-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 240 240" className="shrink-0">
              <rect width="240" height="240" rx="54" fill="#F4B000" />
              <g transform="rotate(-25 120 120)">
                <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" opacity="0.22" transform="translate(16 14)" />
                <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" />
              </g>
            </svg>
            <span className="text-base font-extrabold text-navy">Ridean</span>
          </div>
          <p className="text-[12.5px] text-muted leading-relaxed max-w-[260px]">
            A Best My Flight Inc. company. Mobility across ride-hailing,
            chauffeur services and car rentals, in one marketplace.
          </p>
        </div>
        <FooterCol
          title="Services"
          links={[
            { href: "/services", label: "Ride Now" },
            { href: "/services", label: "Airport Transfers" },
            { href: "/services", label: "Hourly Chauffeur" },
            { href: "/services", label: "Car Rentals" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/#business", label: "Business accounts" },
            { href: "/contact", label: "Contact" },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { href: "/contact", label: "Help center" },
            { href: "/contact", label: "Safety" },
            { href: "#", label: "Terms & Privacy" },
          ]}
        />
      </div>
      <div className="border-t border-line pt-5 flex flex-wrap justify-between items-center gap-2">
        <span className="text-xs text-muted">
          © 2026 Best My Flight Inc. All rights reserved.
        </span>
        <span className="text-xs text-muted">New York, NY</span>
      </div>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-xs font-extrabold text-navy uppercase tracking-wide mb-1">
        {title}
      </div>
      {links.map((l, i) => (
        <Link key={i} href={l.href} className="text-[13px] text-muted hover:text-navy transition-colors">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
