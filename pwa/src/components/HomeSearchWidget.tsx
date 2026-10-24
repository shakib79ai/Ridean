"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoltIcon, FlightIcon, ScheduleIcon, CarIcon, CompareArrowsIcon } from "@/components/Icons";

type TabKey = "ride" | "airport" | "hourly" | "luxury" | "rentals";

const TABS: { key: TabKey; label: string; icon: (p: { className?: string }) => React.JSX.Element }[] = [
  { key: "ride", label: "Ride", icon: BoltIcon },
  { key: "airport", label: "Airport", icon: FlightIcon },
  { key: "hourly", label: "Hourly", icon: ScheduleIcon },
  { key: "luxury", label: "Luxury", icon: CarIcon },
  { key: "rentals", label: "Rentals", icon: CompareArrowsIcon },
];

export function HomeSearchWidget() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("ride");

  const [pickup, setPickup] = useState("Current location");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState("2026-10-21");
  const [returnDate, setReturnDate] = useState("2026-10-24");
  const [hours, setHours] = useState(4);
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [carryOn, setCarryOn] = useState(1);
  const [rideTiming, setRideTiming] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState("2026-10-22");
  const [scheduleTime, setScheduleTime] = useState("18:00");

  function handleSearch() {
    const qs = (obj: Record<string, string>) => new URLSearchParams(obj).toString();

    if (tab === "ride") {
      router.push(
        `/ride-now?${qs({
          pickup,
          dest: dest || "Where to?",
          passengers: String(passengers),
          timing: rideTiming,
          ...(rideTiming === "schedule" ? { scheduleDate, scheduleTime } : {}),
        })}`
      );
    } else if (tab === "airport") {
      router.push(
        `/airport-transfer?${qs({
          pickup: pickup || "JFK Airport, Terminal 4",
          dest: dest || "432 Park Ave, Manhattan",
          passengers: String(passengers),
          luggage: String(luggage),
          carryOn: String(carryOn),
        })}`
      );
    } else if (tab === "hourly") {
      router.push(
        `/hourly-chauffeur?${qs({ pickup, hours: String(hours), passengers: String(passengers) })}`
      );
    } else if (tab === "luxury") {
      router.push(
        `/luxury-chauffeur?${qs({
          pickup,
          dest: dest || "Your destination",
          passengers: String(passengers),
        })}`
      );
    } else {
      router.push(
        `/rent-compare?${qs({ pickup: pickup || "LaGuardia Airport (LGA)", date, returnDate })}`
      );
    }
  }

  return (
    <div className="bg-surface rounded-[22px] p-4 flex flex-col gap-4 shadow-[0_12px_32px_rgba(10,31,68,0.14)] border border-line/60">
      {/* Service tabs */}
      <div className="grid grid-cols-5 gap-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-[14px] transition-colors ${
                active ? "bg-acc" : "bg-ground"
              }`}
            >
              <Icon className={`w-[16px] h-[16px] ${active ? "text-navy" : "text-muted"}`} />
              <span
                className={`text-[9.5px] font-bold leading-none text-center ${
                  active ? "text-navy" : "text-muted"
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-2.5">
        {tab === "ride" && (
          <div className="flex p-1 bg-ground border border-line rounded-full">
            <button
              type="button"
              onClick={() => setRideTiming("now")}
              className={`flex-1 rounded-full py-1.5 text-[11.5px] font-bold ${
                rideTiming === "now" ? "bg-navy text-white" : "text-muted"
              }`}
            >
              Ride now
            </button>
            <button
              type="button"
              onClick={() => setRideTiming("schedule")}
              className={`flex-1 rounded-full py-1.5 text-[11.5px] font-bold ${
                rideTiming === "schedule" ? "bg-navy text-white" : "text-muted"
              }`}
            >
              Schedule
            </button>
          </div>
        )}

        <div className="flex items-center gap-2.5 border border-line rounded-[10px] px-3 py-2.5 bg-ground">
          <div className="w-2 h-2 rounded-full bg-ok shrink-0" />
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Pickup location"
            className="flex-1 bg-transparent outline-none text-[13.5px] font-semibold text-navy placeholder:text-muted placeholder:font-normal"
          />
        </div>

        {(tab === "ride" || tab === "airport" || tab === "luxury") && (
          <>
            <div className="h-px bg-line ml-1" />
            <div className="flex items-center gap-2.5 border border-line rounded-[10px] px-3 py-2.5 bg-ground">
              <div className="w-2 h-2 rounded-sm bg-bad shrink-0" />
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="Where to?"
                className="flex-1 bg-transparent outline-none text-[13.5px] font-semibold text-navy placeholder:text-muted placeholder:font-normal"
              />
            </div>
          </>
        )}

        {tab === "ride" && rideTiming === "schedule" && (
          <div className="flex gap-2.5">
            <div className="flex-1 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wide pl-1">Date</div>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="border border-line rounded-[10px] px-3 py-2.5 bg-ground text-[12.5px] font-semibold text-navy outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wide pl-1">Time</div>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="border border-line rounded-[10px] px-3 py-2.5 bg-ground text-[12.5px] font-semibold text-navy outline-none"
              />
            </div>
          </div>
        )}

        {tab === "hourly" && (
          <div className="flex gap-2">
            {[2, 3, 4, 6, 8].map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`flex-1 rounded-[10px] py-2 text-[12.5px] font-bold ${
                  h === hours ? "bg-navy text-white" : "bg-ground border border-line text-navy"
                }`}
              >
                {h} hrs
              </button>
            ))}
          </div>
        )}

        {(tab === "ride" || tab === "airport" || tab === "hourly" || tab === "luxury") && (
          <Stepper label="Passengers" value={passengers} onChange={setPassengers} min={1} max={6} />
        )}

        {tab === "airport" && (
          <>
            <Stepper label="Checked bags" value={luggage} onChange={setLuggage} min={0} max={6} />
            <Stepper label="Carry-on" value={carryOn} onChange={setCarryOn} min={0} max={6} />
          </>
        )}

        {tab === "rentals" && (
          <div className="flex gap-2.5">
            <div className="flex-1 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wide pl-1">Pickup</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-line rounded-[10px] px-3 py-2.5 bg-ground text-[12.5px] font-semibold text-navy outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wide pl-1">Return</div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="border border-line rounded-[10px] px-3 py-2.5 bg-ground text-[12.5px] font-semibold text-navy outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        className="bg-acc text-navy font-extrabold text-[14px] py-3 rounded-[12px]"
      >
        {tab === "rentals" ? "Search rentals" : "See rates"}
      </button>
      <div className="text-center text-[10.5px] text-muted font-semibold -mt-1">
        No account needed to search rates
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 border border-line rounded-[10px] px-3 py-2 bg-ground">
      <span className="text-[12.5px] font-semibold text-navy">{label}</span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-6 h-6 shrink-0 rounded-full bg-surface border border-line text-navy font-bold text-[13px] leading-none flex items-center justify-center disabled:opacity-40"
        >
          −
        </button>
        <span className="w-4 text-center text-[13px] font-extrabold text-navy tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-6 h-6 shrink-0 rounded-full bg-surface border border-line text-navy font-bold text-[13px] leading-none flex items-center justify-center disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
