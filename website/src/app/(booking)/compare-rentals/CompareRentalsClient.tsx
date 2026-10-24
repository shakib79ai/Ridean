"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { rentalSuppliers } from "@/data/booking-mock";

const FILTERS = ["All", "Economy", "SUV", "Luxury"];
const CAR_TYPES = ["All", "Economy", "SUV", "Luxury"];

function daysBetween(start: string, end: string) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(1, Math.round((b - a) / 86400000));
}

export default function CompareRentalsClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [pickupLocation, setPickupLocation] = useState(params.get("pickup") || "LaGuardia Airport (LGA)");
  const [differentDropoff, setDifferentDropoff] = useState(!!params.get("dropoff"));
  const [dropoffLocation, setDropoffLocation] = useState(params.get("dropoff") || "");
  const [pickupDate, setPickupDate] = useState(params.get("date") || "2026-10-20");
  const [returnDate, setReturnDate] = useState(params.get("returnDate") || "2026-10-23");
  const [carType, setCarType] = useState("All");
  const [filter, setFilter] = useState("All");
  const [searchSummary, setSearchSummary] = useState(() => {
    const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const p = params.get("pickup") || "LaGuardia Airport (LGA)";
    const d1 = params.get("date") || "2026-10-20";
    const d2 = params.get("returnDate") || "2026-10-23";
    return `${p} · ${fmt(d1)}–${fmt(d2)}`;
  });

  const days = daysBetween(pickupDate, returnDate);
  const rows = rentalSuppliers.filter((s) => filter === "All" || s.spec.toLowerCase().includes(filter.toLowerCase()));

  function handleSearch() {
    setFilter(carType);
    const fmt = (d: string) =>
      new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setSearchSummary(`${pickupLocation} · ${fmt(pickupDate)}–${fmt(returnDate)} · ${days} day${days > 1 ? "s" : ""}`);
  }

  function handleSelect(supplier: (typeof rentalSuppliers)[number]) {
    const p = new URLSearchParams({
      service: "Car Rental",
      vehicle: supplier.name,
      price: `$${(supplier.pricePerDay * days).toFixed(2)} total (${days} day${days > 1 ? "s" : ""})`,
      from: pickupLocation,
      to: differentDropoff && dropoffLocation ? dropoffLocation : "Returned to same location",
      meta: searchSummary,
    });
    router.push(`/booking-review?${p.toString()}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-[22px] font-extrabold text-navy">Compare Rentals</div>

      <div className="bg-surface border border-line rounded-2xl p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label="Pickup location">
            <input
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="text-sm font-semibold text-navy bg-transparent outline-none w-full"
            />
          </Field>
          <Field label="Pickup date">
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="text-sm font-semibold text-navy bg-transparent outline-none w-full"
            />
          </Field>
          <Field label="Return date">
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="text-sm font-semibold text-navy bg-transparent outline-none w-full"
            />
          </Field>
          <Field label="Car type">
            <select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              className="text-sm font-semibold text-navy bg-transparent outline-none w-full"
            >
              {CAR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-navy cursor-pointer select-none">
          <input
            type="checkbox"
            checked={differentDropoff}
            onChange={(e) => setDifferentDropoff(e.target.checked)}
            className="w-4 h-4 accent-navy"
          />
          Return to a different location
        </label>

        {differentDropoff && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Field label="Drop-off location">
              <input
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="e.g. JFK Airport (JFK)"
                className="text-sm font-semibold text-navy bg-transparent outline-none w-full placeholder:text-muted placeholder:font-normal"
              />
            </Field>
          </div>
        )}

        <button
          onClick={handleSearch}
          className="self-start bg-navy text-white font-extrabold text-sm px-6 py-3 rounded-xl hover:brightness-110 transition"
        >
          Search rentals
        </button>
      </div>

      <div className="text-xs text-muted">
        Showing results for <span className="font-bold text-navy">{searchSummary}</span>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${
              filter === f ? "bg-navy text-white border-navy" : "bg-surface text-muted border-line"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s)}
            className="flex items-center justify-between bg-surface border border-line rounded-xl p-4 text-left hover:border-navy transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-navy flex items-center justify-center text-acc font-extrabold text-[11px]">
                {s.code.slice(0, 4)}
              </div>
              <div>
                <div className="text-sm font-bold text-navy">{s.name}</div>
                <div className="text-xs text-muted">
                  {s.spec} · {s.code}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {s.best && <span className="text-[11px] font-extrabold text-ok bg-ok-bg px-2.5 py-1 rounded-full">Best price</span>}
              <div className="text-sm font-extrabold text-navy">${s.pricePerDay}/day</div>
            </div>
          </button>
        ))}
      </div>
      <div className="text-xs text-muted">Prices include taxes and fees. Compared live across SIXT, Enterprise and Alamo.</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-ground border border-line rounded-xl px-4 py-2.5">
      <div className="text-[10.5px] font-bold text-muted uppercase">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
