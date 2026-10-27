"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { luxuryVehicles } from "@/data/booking-mock";
import { TierCarIcon } from "@/components/VehicleTier";

const SEGMENTS = ["Business", "Airport", "Event"];

export default function LuxuryChauffeurClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "Current location";
  const dest = params.get("dest") || "Your destination";
  const passengers = Number(params.get("passengers")) || 1;

  const [segment, setSegment] = useState("Business");
  const [selected, setSelected] = useState(luxuryVehicles[0].id);
  const vehicle = luxuryVehicles.find((v) => v.id === selected)!;

  function handleConfirm() {
    const p = new URLSearchParams({
      service: "Luxury Chauffeur",
      vehicle: vehicle.name,
      price: `$${vehicle.price.toFixed(2)}`,
      from: pickup,
      to: dest,
      meta: `${segment} travel · ${vehicle.desc} · ${passengers} passenger${passengers === 1 ? "" : "s"}`,
    });
    router.push(`/booking-review?${p.toString()}`);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-5">
        <div className="font-display text-[22px] font-extrabold text-navy">Luxury Chauffeur</div>
        <div className="flex gap-2 bg-surface border border-line rounded-full p-1 w-fit">
          {SEGMENTS.map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                segment === s ? "bg-navy text-white" : "text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pickup" value={pickup} />
          <Field label="Destination" value={dest} />
          <Field label="Passengers" value={String(passengers)} />
        </div>
        <div className="flex flex-col gap-3">
          {luxuryVehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className={`relative flex items-center gap-4 rounded-2xl p-4 text-left transition bg-surface ${
                selected === v.id ? "shadow-[inset_0_0_0_2px_#0A1F44]" : "shadow-[inset_0_0_0_1px_#DCE6F2]"
              }`}
            >
              <span className="absolute top-3 right-3 flex gap-1.5">
                {v.badge && <span className="text-[10px] font-extrabold text-acc bg-navy px-2 py-0.5 rounded-full tracking-wide">{v.badge}</span>}
                {v.popular && (
                  <span className="text-[10px] font-extrabold text-navy bg-acc px-2 py-0.5 rounded-full tracking-wide">POPULAR</span>
                )}
              </span>
              <TierCarIcon id={v.id} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-navy">{v.name}</div>
                <div className="text-xs text-muted">{v.seats} seats · {v.desc}</div>
                {v.unavailable && (
                  <div className="text-[11px] text-muted italic mt-0.5">{v.unavailable}</div>
                )}
              </div>
              <div className="font-display text-base font-bold text-navy">${v.price}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-[340px] flex flex-col gap-4">
        <div className="bg-surface border border-line rounded-2xl p-5">
          <div className="text-sm font-bold text-navy mb-2">Booking for</div>
          <div className="text-xs text-muted">{segment} travel</div>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-acc text-navy font-extrabold text-sm py-3.5 rounded-xl hover:brightness-95 transition"
        >
          Book luxury chauffeur
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
