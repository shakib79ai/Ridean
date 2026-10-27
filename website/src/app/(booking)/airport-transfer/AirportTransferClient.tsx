"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { vehicleCategories } from "@/data/booking-mock";

export default function AirportTransferClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "JFK Airport, Terminal 4";
  const dest = params.get("dest") || "432 Park Ave, Manhattan";
  const date = params.get("date");
  const time = params.get("time");
  const pickupTimeLabel = date && time ? `${date}, ${time}` : "Today, 3:40 PM";
  const passengers = Number(params.get("passengers")) || 1;
  const luggage = params.get("luggage") !== null ? Number(params.get("luggage")) : 1;
  const carryOn = params.get("carryOn") !== null ? Number(params.get("carryOn")) : 1;

  const [roundTrip, setRoundTrip] = useState(false);
  const [selected, setSelected] = useState(vehicleCategories[3].id);
  const vehicle = vehicleCategories.find((v) => v.id === selected)!;

  function handleConfirm() {
    const p = new URLSearchParams({
      service: "Airport Transfer",
      vehicle: vehicle.name,
      price: vehicle.price,
      from: pickup,
      to: dest,
      meta: `Flight DL 1842 · ${roundTrip ? "Round trip" : "One way"} · Pickup ${pickupTimeLabel} · ${passengers} passenger${passengers === 1 ? "" : "s"} · ${luggage} bag${luggage === 1 ? "" : "s"} · ${carryOn} carry-on${carryOn === 1 ? "" : "s"}`,
    });
    router.push(`/booking-review?${p.toString()}`);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-5">
        <div className="font-display text-[22px] font-extrabold text-navy">Airport Transfer</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" value={pickup} />
          <Field label="To" value={dest} />
          <Field label="Flight number" value="DL 1842" />
          <Field label="Pickup time" value={pickupTimeLabel} />
          <Field label="Passengers" value={String(passengers)} />
          <Field label="Checked bags" value={String(luggage)} />
          <Field label="Carry-on bags" value={String(carryOn)} />
        </div>
        <button
          onClick={() => setRoundTrip((v) => !v)}
          className="flex items-center justify-between bg-surface border border-line rounded-xl p-4"
        >
          <div className="text-left">
            <div className="text-sm font-bold text-navy">Round trip</div>
            <div className="text-xs text-muted">Add a return pickup</div>
          </div>
          <div className={`w-[42px] h-6 rounded-full relative transition-colors ${roundTrip ? "bg-acc" : "bg-line"}`}>
            <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-surface transition-all ${roundTrip ? "left-[21px]" : "left-[3px]"}`} />
          </div>
        </button>
        <div className="flex flex-col gap-3">
          {vehicleCategories.slice(2).map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                selected === v.id ? "border-navy bg-navy/[0.03]" : "border-line bg-surface"
              }`}
            >
              <div>
                <div className="text-sm font-bold text-navy">{v.name}</div>
                <div className="text-xs text-muted">{v.seats} seats · {v.desc}</div>
              </div>
              <div className="text-sm font-extrabold text-navy">{v.price}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-[340px] flex flex-col gap-4">
        <div className="bg-surface border border-line rounded-2xl p-5">
          <div className="text-sm font-bold text-navy mb-2">Live flight tracking</div>
          <div className="text-xs text-muted">Your driver adjusts pickup automatically if DL 1842 is delayed.</div>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-acc text-navy font-extrabold text-sm py-3.5 rounded-xl hover:brightness-95 transition"
        >
          Confirm transfer
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-line rounded-xl px-4 py-3">
      <div className="text-[10.5px] font-bold text-muted uppercase">{label}</div>
      <div className="text-sm font-semibold text-navy mt-0.5">{value}</div>
    </div>
  );
}
