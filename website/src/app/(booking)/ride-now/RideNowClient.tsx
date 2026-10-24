"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { vehicleCategories } from "@/data/booking-mock";

export default function RideNowClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "Current location";
  const dest = params.get("dest") || "Where to?";
  const passengers = Number(params.get("passengers")) || 1;
  const [selected, setSelected] = useState(vehicleCategories[0].id);
  const vehicle = vehicleCategories.find((v) => v.id === selected)!;

  function handleConfirm() {
    const p = new URLSearchParams({
      service: "Ride Now",
      vehicle: vehicle.name,
      price: vehicle.price,
      from: pickup,
      to: dest,
      meta: `${vehicle.eta} away · ${vehicle.seats} seats · ${passengers} passenger${passengers === 1 ? "" : "s"}`,
    });
    router.push(`/booking-review?${p.toString()}`);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-5">
        <div className="text-[22px] font-extrabold text-navy">Ride Now</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pickup" value={pickup} />
          <Field label="Destination" value={dest} />
          <Field label="Passengers" value={String(passengers)} />
        </div>
        <div className="flex flex-col gap-3">
          {vehicleCategories.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                selected === v.id ? "border-navy bg-navy/[0.03]" : "border-line bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-navy">{v.name}</div>
                  {v.popular && (
                    <span className="text-[10px] font-extrabold text-navy bg-acc px-2 py-0.5 rounded-full">POPULAR</span>
                  )}
                </div>
                <div className="text-xs text-muted">
                  {v.seats} seats · {v.eta} away · {v.desc}
                </div>
                {v.unavailable && (
                  <div className="text-[11px] text-muted italic mt-0.5">{v.unavailable}</div>
                )}
              </div>
              <div className="text-sm font-extrabold text-navy">{v.price}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[340px] flex flex-col gap-4">
        <div className="bg-surface border border-line rounded-2xl p-5">
          <div className="text-sm font-bold text-navy mb-2">Trip estimate</div>
          <div className="flex justify-between text-xs text-muted py-1">
            <span>{vehicle.name}</span>
            <span className="font-bold text-navy">{vehicle.price}</span>
          </div>
          <div className="flex justify-between text-xs text-muted py-1">
            <span>Arrives in</span>
            <span className="font-bold text-navy">{vehicle.eta}</span>
          </div>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-acc text-navy font-extrabold text-sm py-3.5 rounded-xl hover:brightness-95 transition"
        >
          Confirm {vehicle.name}
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
