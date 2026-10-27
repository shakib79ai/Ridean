"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TabKey = "ride" | "airport" | "hourly" | "luxury" | "rentals";

function TabIcon({ k }: { k: TabKey }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k === "ride") return <svg {...common}><path d="M13 3L5 14h6l-1 7 8-11h-6z" /></svg>;
  if (k === "airport") return <svg {...common}><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6" /></svg>;
  if (k === "hourly") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (k === "luxury") return <svg {...common}><rect x="4" y="9" width="16" height="9" rx="2" /><path d="M7 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" /></svg>;
  return <svg {...common}><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" /><path d="M20 4v4h-4" /><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" /><path d="M4 20v-4h4" /></svg>;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "ride", label: "Ride Now" },
  { key: "airport", label: "Airport Transfer" },
  { key: "hourly", label: "Hourly Chauffeur" },
  { key: "luxury", label: "Luxury Chauffeur" },
  { key: "rentals", label: "Compare Rentals" },
];

export function HomeSearchWidget() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("ride");

  const [pickup, setPickup] = useState("Current location");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState("2026-10-21");
  const [time, setTime] = useState("15:40");
  const [returnDate, setReturnDate] = useState("2026-10-24");
  const [hours, setHours] = useState(4);
  const [rideWhen, setRideWhen] = useState<"now" | "schedule">("now");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [carryOn, setCarryOn] = useState(1);

  function handleSearch() {
    const qs = (obj: Record<string, string>) => new URLSearchParams(obj).toString();

    if (tab === "ride") {
      router.push(
        `/ride-now?${qs({
          pickup,
          dest: dest || "Where to?",
          passengers: String(passengers),
          ...(rideWhen === "schedule" ? { date, time } : {}),
        })}`
      );
    } else if (tab === "airport") {
      router.push(
        `/airport-transfer?${qs({
          pickup: pickup || "JFK Airport, Terminal 4",
          dest: dest || "432 Park Ave, Manhattan",
          date,
          time,
          passengers: String(passengers),
          luggage: String(luggage),
          carryOn: String(carryOn),
        })}`
      );
    } else if (tab === "hourly") {
      router.push(`/hourly-chauffeur?${qs({ pickup, hours: String(hours), passengers: String(passengers) })}`);
    } else if (tab === "luxury") {
      router.push(`/luxury-chauffeur?${qs({ pickup, dest: dest || "Your destination", passengers: String(passengers) })}`);
    } else {
      router.push(`/compare-rentals?${qs({ pickup: pickup || "LaGuardia Airport (LGA)", date, returnDate })}`);
    }
  }

  return (
    <div className="w-full max-w-[1040px] mx-auto -mt-10 md:-mt-14 relative z-10 px-4">
      <div className="bg-surface rounded-[24px] shadow-[0_10px_30px_rgba(10,31,68,0.10)] border border-line overflow-hidden">
        {/* Service tabs — segmented pill */}
        <div className="p-4 pb-0">
          <div className="flex gap-1 bg-chip-track rounded-2xl p-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-colors shrink-0 ${
                  tab === t.key ? "bg-navy text-white" : "text-navy hover:bg-white/60"
                }`}
              >
                <TabIcon k={t.key} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="p-5 md:p-6 flex flex-col md:flex-row gap-3 items-stretch">
          <div className="flex-1 flex flex-col gap-3">
            {tab === "ride" && (
              <div className="flex gap-1 bg-chip-track rounded-2xl p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setRideWhen("now")}
                  className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold transition ${
                    rideWhen === "now" ? "bg-navy text-white" : "text-muted"
                  }`}
                >
                  Ride now
                </button>
                <button
                  type="button"
                  onClick={() => setRideWhen("schedule")}
                  className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold transition ${
                    rideWhen === "schedule" ? "bg-navy text-white" : "text-muted"
                  }`}
                >
                  Schedule for later
                </button>
              </div>
            )}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={tab === "rentals" ? "Pickup location" : "Pickup"}>
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter an address or airport"
                className="w-full bg-transparent outline-none text-sm font-semibold text-navy placeholder:text-muted placeholder:font-normal"
              />
            </Field>

            {(tab === "ride" || tab === "airport" || tab === "luxury") && (
              <Field label="Destination">
                <input
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder="Where to?"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-navy placeholder:text-muted placeholder:font-normal"
                />
              </Field>
            )}

            {tab === "airport" && (
              <>
                <Field label="Pickup date">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-navy"
                  />
                </Field>
                <Field label="Pickup time">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-navy"
                  />
                </Field>
              </>
            )}

            {tab === "hourly" && (
              <Field label="Duration">
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-transparent outline-none text-sm font-semibold text-navy"
                >
                  {[2, 3, 4, 6, 8].map((h) => (
                    <option key={h} value={h}>
                      {h} hours
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {tab === "ride" && rideWhen === "schedule" && (
              <>
                <Field label="Pickup date">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-navy"
                  />
                </Field>
                <Field label="Pickup time">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-navy"
                  />
                </Field>
              </>
            )}

            {(tab === "ride" || tab === "airport" || tab === "hourly" || tab === "luxury") && (
              <Field label="Passengers">
                <Stepper value={passengers} onChange={setPassengers} min={1} max={6} />
              </Field>
            )}

            {tab === "airport" && (
              <>
                <Field label="Checked bags">
                  <Stepper value={luggage} onChange={setLuggage} min={0} max={6} />
                </Field>
                <Field label="Carry-on bags">
                  <Stepper value={carryOn} onChange={setCarryOn} min={0} max={6} />
                </Field>
              </>
            )}

            {tab === "rentals" && (
              <>
                <Field label="Pickup date">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-navy"
                  />
                </Field>
                <Field label="Return date">
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-semibold text-navy"
                  />
                </Field>
              </>
            )}
          </div>
          </div>

          <button
            onClick={handleSearch}
            className="bg-acc text-navy font-extrabold text-[15px] px-8 py-4 rounded-2xl border border-[rgba(10,31,68,0.12)] shadow-[0_6px_16px_rgba(244,176,0,0.38)] hover:brightness-95 transition shrink-0 self-end md:self-auto"
          >
            {tab === "rentals" ? "Search rentals" : "See rates"}
          </button>
        </div>
      </div>
      <div className="text-center mt-3">
        <span className="text-[11.5px] text-muted-on-dark font-semibold">
          No account needed to search — sign in only when you&apos;re ready to book.
        </span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-2xl px-4 py-2.5">
      <div className="text-[10px] font-bold text-muted uppercase tracking-wide">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 0,
  max = 6,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
        className="w-6 h-6 flex items-center justify-center rounded-lg border border-line bg-surface text-navy font-extrabold text-sm leading-none disabled:opacity-40 disabled:cursor-not-allowed"
      >
        −
      </button>
      <span className="text-sm font-semibold text-navy">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase"
        className="w-6 h-6 flex items-center justify-center rounded-lg border border-line bg-surface text-navy font-extrabold text-sm leading-none disabled:opacity-40 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
