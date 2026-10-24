import Link from "next/link";
import { trips, walletBalance } from "@/data/booking-mock";

const MODES = [
  { href: "/ride-now", label: "Ride Now", desc: "On-demand rides", icon: "🚕", active: true },
  { href: "/airport-transfer", label: "Airport Transfer", desc: "Flight-synced pickup", icon: "✈️" },
  { href: "/hourly-chauffeur", label: "Hourly Chauffeur", desc: "By the hour", icon: "🕐" },
  { href: "/luxury-chauffeur", label: "Luxury Chauffeur", desc: "Premium & events", icon: "🚘" },
  { href: "/compare-rentals", label: "Car Rentals", desc: "Compare suppliers", icon: "🔑" },
];

const LIVE_STATUS: Record<string, string> = {
  "Airport Transfer": "Flight synced",
  "Ride Now": "Driver en route",
  "Rent": "Reservation confirmed",
};

export default function Dashboard() {
  const upcoming = trips.find((t) => t.status === "upcoming");
  const recent = trips.filter((t) => t.status !== "upcoming").slice(0, 4);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="text-[26px] font-extrabold text-navy">Where to next?</div>
        <div className="text-sm text-muted mt-1">Welcome back, Shakib.</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`rounded-2xl border p-5 flex flex-col gap-2 transition hover:-translate-y-0.5 ${
              m.active ? "bg-acc border-acc" : "bg-surface border-line"
            }`}
          >
            <div className="text-2xl">{m.icon}</div>
            <div className={`text-sm font-extrabold ${m.active ? "text-navy" : "text-navy"}`}>{m.label}</div>
            <div className={`text-xs ${m.active ? "text-navy/70" : "text-muted"}`}>{m.desc}</div>
          </Link>
        ))}
      </div>

      {upcoming && (
        <div className="bg-navy rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-muted-on-dark font-bold tracking-wide">UPCOMING TRIP · {upcoming.mode.toUpperCase()}</span>
                <span className="text-[10.5px] font-extrabold text-navy bg-acc px-2 py-0.5 rounded-full">
                  {LIVE_STATUS[upcoming.mode] ?? "On the way"}
                </span>
              </div>
              <div className="text-white font-bold mt-1.5">
                {upcoming.from} → {upcoming.to}
              </div>
              <div className="text-[12.5px] text-muted-on-dark mt-1">
                {upcoming.car} · {upcoming.date}, {upcoming.time}
                {upcoming.mode === "Airport Transfer" && " · 2 checked bags, 1 carry-on"}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-1 border-t border-navy-2">
            <Link href={`/booking/${upcoming.id}`} className="text-acc font-extrabold text-sm pt-3">
              Trip details →
            </Link>
            <Link href={`/booking/${upcoming.id}/contact-driver`} className="text-white/80 font-bold text-sm pt-3 hover:text-white">
              Contact driver
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-line rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold text-navy">Ridean+ membership</div>
            <div className="text-xs text-muted mt-1">Priority pickups, lower fares, no booking fees.</div>
          </div>
          <div className="bg-acc text-navy font-extrabold text-xs px-4 py-2.5 rounded-[10px] shrink-0">Upgrade</div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold text-navy">Ridean Business</div>
            <div className="text-xs text-muted mt-1">Centralized billing and travel policies for your team.</div>
          </div>
          <div className="bg-navy text-white font-extrabold text-xs px-4 py-2.5 rounded-[10px] shrink-0">Get started</div>
        </div>
      </div>

      <div className="text-xs text-muted">
        Wallet balance: <span className="font-bold text-navy">${walletBalance.toFixed(2)}</span>
      </div>

      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold text-navy">Recent trips</div>
            <Link href="/trips" className="text-[12.5px] font-bold text-info">See all →</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {recent.map((t) => (
              <Link
                key={t.id}
                href={`/booking/${t.id}`}
                className="flex items-center justify-between bg-ground border border-line rounded-xl px-4 py-3 hover:border-navy-3 transition"
              >
                <div>
                  <div className="text-[13px] font-bold text-navy">
                    {t.from} → {t.to}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {t.date} · {t.car} · {t.distance}
                  </div>
                </div>
                <div className="text-[13px] font-extrabold text-navy">{t.price}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
