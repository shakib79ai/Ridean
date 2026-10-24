"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { chauffeurVehicles } from "@/data/booking-mock";

const DURATIONS = [3, 4, 6, 8];

export default function HourlyChauffeurClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "Current location";
  const initialHours = Number(params.get("hours")) || 4;
  const passengers = Number(params.get("passengers")) || 1;

  const [hours, setHours] = useState(initialHours);
  const [selected, setSelected] = useState(chauffeurVehicles[0].id);
  const vehicle = chauffeurVehicles.find((v) => v.id === selected)!;
  const total = vehicle.pricePerHr * hours;

  function handleConfirm() {
    const p = new URLSearchParams({
      service: "Hourly Chauffeur",
      vehicle: vehicle.name,
      price: `$${total.toFixed(2)}`,
      from: pickup,
      to: "Flexible itinerary",
      meta: `${hours} hrs · ${vehicle.desc} · ${passengers} passenger${passengers === 1 ? "" : "s"}`,
    });
    router.push(`/booking-review?${p.toString()}`);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-5">
        <div className="text-[22px] font-extrabold text-navy">Hourly Chauffeur</div>
        <div className="flex gap-2">
          {DURATIONS.map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`px-4 py-2 rounded-full text-sm font-bold border ${
                hours === h ? "bg-navy text-white border-navy" : "bg-surface text-muted border-line"
              }`}
            >
              {h} hrs
            </button>
          ))}
        </div>
        <Field label="Pickup" value={pickup} />
        <Field label="Passengers" value={String(passengers)} />
        <div className="flex flex-col gap-3">
          {chauffeurVehicles.map((v) => (
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
                <div className="text-xs text-muted">{v.seats} seats · {v.desc}</div>
                {v.unavailable && (
                  <div className="text-[11px] text-muted italic mt-0.5">{v.unavailable}</div>
                )}
              </div>
              <div className="text-sm font-extrabold text-navy">${v.pricePerHr}/hr</div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-[340px] flex flex-col gap-4">
        <div className="bg-surface border border-line rounded-2xl p-5">
          <div className="text-sm font-bold text-navy mb-2">Estimate</div>
          <div className="flex justify-between text-xs text-muted py-1">
            <span>{vehicle.name} × {hours} hrs</span>
            <span className="font-bold text-navy">${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-acc text-navy font-extrabold text-sm py-3.5 rounded-xl hover:brightness-95 transition"
        >
          Reserve chauffeur
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
