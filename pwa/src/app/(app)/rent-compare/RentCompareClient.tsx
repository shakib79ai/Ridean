"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { rentalSuppliers } from "@/data/mock";

const FILTERS = ["All", "Economy", "SUV", "Luxury"];

const BRAND_BG: Record<string, string> = {
  ENTERPRISE: "bg-[#C8102E]",
  ALAMO: "bg-[#0B4F8A]",
  SIXT: "bg-navy",
};

export default function RentCompareClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [filter, setFilter] = useState("All");

  const [pickupLocation, setPickupLocation] = useState(params.get("pickup") || "LaGuardia Airport (LGA)");
  const [pickupDate, setPickupDate] = useState(params.get("date") || "2026-10-20");
  const [returnDate, setReturnDate] = useState(params.get("returnDate") || "2026-10-23");
  const [differentDropoff, setDifferentDropoff] = useState(false);
  const [dropoffLocation, setDropoffLocation] = useState("JFK Airport (JFK)");
  const [searched, setSearched] = useState(() => {
    const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const p = params.get("pickup") || "LaGuardia Airport (LGA)";
    const d1 = params.get("date") || "2026-10-20";
    const d2 = params.get("returnDate") || "2026-10-23";
    return {
      location: p,
      range: `${fmt(d1)}–${fmt(d2).split(" ")[1] ?? fmt(d2)}`,
      dropoff: "",
    };
  });

  const rows = rentalSuppliers.filter(
    (s) => filter === "All" || s.spec.toLowerCase().includes(filter.toLowerCase())
  );

  function runSearch() {
    const fmt = (iso: string) =>
      new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setSearched({
      location: pickupLocation,
      range: `${fmt(pickupDate)}–${fmt(returnDate).split(" ")[1] ?? fmt(returnDate)}`,
      dropoff: differentDropoff ? dropoffLocation : "",
    });
  }

  return (
    <>
      <HeroHeader title="Compare rentals" subtitle={`${searched.location} · ${searched.range}`} />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-3.5">
        <div className="border border-line rounded-[14px] p-3.5 flex flex-col gap-2.5 bg-ground">
          <Field label="Pickup location" value={pickupLocation} onChange={setPickupLocation} />

          <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={differentDropoff}
              onChange={(e) => setDifferentDropoff(e.target.checked)}
              className="w-4 h-4 accent-navy"
            />
            <span className="text-[12.5px] font-semibold text-navy">Return to a different location</span>
          </label>

          {differentDropoff && (
            <Field label="Drop-off location" value={dropoffLocation} onChange={setDropoffLocation} />
          )}

          <div className="flex gap-2.5">
            <div className="flex-1">
              <Field label="Pickup date" value={pickupDate} onChange={setPickupDate} type="date" />
            </div>
            <div className="flex-1">
              <Field label="Return date" value={returnDate} onChange={setReturnDate} type="date" />
            </div>
          </div>
          <button
            onClick={runSearch}
            className="bg-navy text-white font-bold text-[13.5px] py-2.5 rounded-[10px] mt-1"
          >
            Search rentals
          </button>
        </div>

        {searched.dropoff && (
          <div className="text-[12px] text-muted -mt-1">
            Returning to <span className="font-semibold text-navy">{searched.dropoff}</span> (one-way fee may apply)
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold ${
                f === filter ? "bg-navy text-white" : "bg-ground border border-line text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {rows.map((s) => (
            <button
              key={s.id}
              onClick={() =>
                router.push(
                  `/booking-review?service=${encodeURIComponent("Car Rental")}&vehicle=${encodeURIComponent(
                    `${s.name} · ${s.code}`
                  )}&from=${encodeURIComponent(searched.location)}&to=${encodeURIComponent(
                    searched.dropoff || "Returned same location"
                  )}&date=${encodeURIComponent(searched.range)}&price=${s.pricePerDay}&tripId=t3`
                )
              }
              className={`text-left rounded-[14px] p-3.5 border ${
                s.best ? "border-2 border-acc" : "border-line"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[8.5px] font-extrabold ${
                    BRAND_BG[s.code] ?? "bg-navy"
                  } ${s.code === "SIXT" ? "text-acc" : "text-white"}`}
                >
                  {s.code}
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-bold text-navy">{s.name}</div>
                  <div className="text-[11px] text-muted">{s.spec}</div>
                </div>
              </div>
              <div className="h-px bg-line my-2.5" />
              <div className="flex items-center justify-between">
                {s.best ? (
                  <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-bold bg-ok-bg text-ok">
                    Best price
                  </span>
                ) : (
                  <span />
                )}
                <div className="font-extrabold text-navy text-[15px]">
                  ${s.pricePerDay}
                  <span className="text-[11px] font-semibold text-muted">/day</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-[11px] text-muted pt-1">
          Prices include taxes &amp; supplier fees · sorted by best price
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date";
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-bold text-muted uppercase tracking-wide">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line rounded-[10px] px-3 py-2.5 bg-surface text-[13.5px] font-semibold text-navy outline-none focus:border-navy-3"
      />
    </div>
  );
}
