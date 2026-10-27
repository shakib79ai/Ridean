import Link from "next/link";
import { trips } from "@/data/mock";
import { DiagonalFlag } from "@/components/HeroHeader";
import { BellIcon, PersonIcon, CompareArrowsIcon, CarIcon, BusinessIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { HomeSearchWidget } from "@/components/HomeSearchWidget";
import { InstallBanner } from "@/components/InstallBanner";

export default function Home() {
  const upcoming = trips.find((t) => t.status === "upcoming");
  const recent = trips.filter((t) => t.status !== "upcoming").slice(0, 3);

  return (
    <>
      <DiagonalFlag />
      <div className="bg-navy px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-5.5">
          <Logo />
          <div className="flex gap-2.5">
            <div className="relative w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center">
              <BellIcon className="w-[17px] h-[17px] text-white" />
              <div className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-acc border-2 border-navy-2" />
            </div>
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center"
            >
              <PersonIcon className="w-[17px] h-[17px] text-white" />
            </Link>
          </div>
        </div>
        <div
          className="text-[32px] leading-[38px] font-bold text-white tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Where to next?
        </div>
      </div>

      <InstallBanner />

      <div className="px-5 pt-4 pb-1 relative z-10">
        <HomeSearchWidget />
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {upcoming && (
          <div>
            <div className="text-sm font-extrabold text-navy mb-2">
              Upcoming trip
            </div>
            <div className="bg-navy rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="bg-warn-bg px-2.5 py-0.5 rounded-full">
                    <span className="text-[9.5px] font-bold text-warn">
                      {upcoming.mode}
                    </span>
                  </div>
                  <div className="bg-[#163562] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <div className="w-[5px] h-[5px] rounded-full bg-ok" />
                    <span className="text-[9.5px] font-bold text-white">
                      {upcoming.mode === "Airport Transfer" ? "Flight synced" : "Driver assigned"}
                    </span>
                  </div>
                </div>
                <span className="text-muted-on-dark text-[11px] font-bold">
                  {upcoming.date} · {upcoming.time}
                </span>
              </div>
              <div className="text-white text-[15px] font-bold">
                {upcoming.from} → {upcoming.to}
              </div>
              <div className="text-muted-on-dark text-xs">
                {upcoming.car} · {upcoming.distance}
                {upcoming.mode === "Airport Transfer" && " · 2 checked bags · 1 carry-on"}
              </div>
              <div className="flex gap-2 mt-1">
                <Link
                  href={`/booking/${upcoming.id}`}
                  className="flex-1 text-center bg-navy-2 text-white text-[12px] font-bold py-2 rounded-[10px]"
                >
                  Trip details
                </Link>
                <Link
                  href={`/booking/${upcoming.id}/contact-driver`}
                  className="flex-1 text-center bg-acc text-navy text-[12px] font-bold py-2 rounded-[10px]"
                >
                  Contact driver
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <div className="bg-[#FFF7E6] border border-[#F6DFA3] rounded-[14px] p-3.5 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-bold text-navy">Ridean+</div>
              <div className="text-[11.5px] text-muted mt-0.5">
                Priority pickups &amp; member pricing
              </div>
            </div>
            <div className="bg-navy text-white font-bold text-xs px-4 py-2 rounded-[10px]">
              Join
            </div>
          </div>
          <div className="bg-ground border border-line rounded-[14px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-navy flex items-center justify-center shrink-0">
              <BusinessIcon className="w-[17px] h-[17px] text-acc" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-navy">Ridean Business</div>
              <div className="text-[11.5px] text-muted mt-0.5">
                Centralized billing &amp; travel policies for your team
              </div>
            </div>
            <div className="bg-navy text-white font-bold text-xs px-4 py-2 rounded-[10px] shrink-0">
              Learn more
            </div>
          </div>
        </div>

        {recent.length > 0 && (
          <div>
            <div className="text-sm font-extrabold text-navy mb-2">Recent trips</div>
            <div className="flex flex-col gap-2">
              {recent.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-ground border border-line rounded-[14px] p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-navy truncate">
                      {t.from} → {t.to}
                    </div>
                    <div className="text-[10.5px] text-muted mt-0.5">
                      {t.date} · {t.car}
                      {t.distance !== "—" && ` · ${t.distance}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-[12.5px] font-extrabold text-navy">{t.price}</div>
                    {t.status === "cancelled" && (
                      <div className="text-[9.5px] font-bold text-bad">Cancelled</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm font-extrabold text-navy mb-2">
            More ways to ride
          </div>
          <div className="flex flex-col gap-2">
            <ServiceRow href="/luxury-chauffeur" icon={CarIcon} title="Luxury Chauffeur" desc="Premium vehicles for business & events" />
            <ServiceRow href="/rent-compare" icon={CompareArrowsIcon} title="Compare Rentals" desc="Best prices across SIXT, Enterprise & Alamo" />
          </div>
        </div>
      </div>
    </>
  );
}

function ServiceRow({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: (props: { className?: string }) => React.JSX.Element;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 bg-ground border border-line rounded-[14px] p-3">
      <div className="w-[38px] h-[38px] rounded-[10px] bg-surface flex items-center justify-center">
        <Icon className="w-[18px] h-[18px] text-navy" />
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-bold text-navy">{title}</div>
        <div className="text-[11px] text-muted">{desc}</div>
      </div>
      <span className="text-muted">›</span>
    </Link>
  );
}
