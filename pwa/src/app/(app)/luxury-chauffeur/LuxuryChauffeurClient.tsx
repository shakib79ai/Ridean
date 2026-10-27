"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { luxuryVehicles } from "@/data/mock";
import { CarIcon } from "@/components/Icons";

const TYPES = ["Business", "Airport", "Event"];

export default function LuxuryChauffeurClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "One Vanderbilt, Manhattan";
  const dest = params.get("dest") || "JFK Airport, Terminal 4";
  const passengers = Number(params.get("passengers")) || 1;

  const [tripType, setTripType] = useState(0);
  const [selected, setSelected] = useState(luxuryVehicles[0].id);
  const vehicle = luxuryVehicles.find((v) => v.id === selected)!;

  return (
    <>
      <HeroHeader title="Luxury Chauffeur" subtitle="Premium vehicles for business, airport & events." />
      <div className="flex-1 bg-ground px-5 pt-5 pb-6 flex flex-col gap-3.5">
        <div className="flex p-1 bg-ground border border-line rounded-full">
          {TYPES.map((t, i) => (
            <button
              key={t}
              onClick={() => setTripType(i)}
              className={`flex-1 rounded-full py-2 text-xs font-bold ${
                i === tripType ? "bg-navy text-white" : "text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Field label="Pickup" value={pickup} dot="bg-ok" />
        <Field label="Destination" value={dest} dot="bg-bad" />
        <Field label="Passengers" value={String(passengers)} />

        <div className="text-[15px] font-extrabold text-navy pt-1">Select your vehicle</div>
        <div className="flex flex-col gap-2">
          {luxuryVehicles.map((v) => {
            const active = v.id === selected;
            const isUnavailable = v.id === "l3";
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`flex flex-col gap-1.5 rounded-[14px] p-3 text-left ${
                  active ? "border-2 border-acc bg-white" : "border border-line"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-[46px] h-[46px] rounded-[10px] bg-navy flex items-center justify-center">
                    <CarIcon className="w-[20px] h-[20px] text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14.5px] font-bold text-navy">{v.name}</span>
                      {v.badge && (
                        <span className="bg-warn-bg text-warn text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                          {v.badge}
                        </span>
                      )}
                      {v.id === "l2" && (
                        <span className="bg-acc text-navy text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-muted mt-0.5">
                      {v.seats} seats · {v.desc}
                    </div>
                  </div>
                  <div className="font-extrabold text-navy text-sm">${v.price}</div>
                </div>
                {isUnavailable && (
                  <div className="text-[10.5px] text-muted font-semibold pl-[58px]">
                    Not available for same-day booking
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() =>
            router.push(
              `/booking-review?service=${encodeURIComponent("Luxury Chauffeur")}&vehicle=${encodeURIComponent(
                vehicle.name
              )}&from=${encodeURIComponent(pickup)}&to=${encodeURIComponent(
                dest
              )}&price=${vehicle.price}&tripId=t2&passengers=${encodeURIComponent(String(passengers))}`
            )
          }
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-auto"
        >
          Book luxury chauffeur
        </button>
      </div>
    </>
  );
}

function Field({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-bold text-muted uppercase tracking-wide">{label}</div>
      <div className="flex items-center gap-2 border border-line rounded-[10px] px-3 py-2.5 bg-ground">
        {dot && <div className={`w-2 h-2 rounded-full ${dot}`} />}
        <span className="text-[13.5px] font-semibold text-navy">{value}</span>
      </div>
    </div>
  );
}
