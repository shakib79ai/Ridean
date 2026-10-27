"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { chauffeurVehicles } from "@/data/mock";
import { StarIcon, CarIcon } from "@/components/Icons";

const DURATIONS = [3, 4, 6, 8];

export default function HourlyChauffeurClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "432 Park Ave, Manhattan";
  const initialHours = Number(params.get("hours")) || 4;
  const passengers = Number(params.get("passengers")) || 1;

  const [duration, setDuration] = useState(initialHours);
  const [selected, setSelected] = useState(chauffeurVehicles[0].id);
  const vehicle = chauffeurVehicles.find((v) => v.id === selected)!;
  const estimate = duration * vehicle.pricePerHr;

  return (
    <>
      <HeroHeader title="Hourly Chauffeur" subtitle="Reserve a vehicle and driver by the hour." />
      <div className="flex-1 bg-ground px-5 pt-5 pb-6 flex flex-col gap-3.5">
        <div className="text-[11px] font-bold text-muted uppercase tracking-wide">Duration</div>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 rounded-[10px] py-2.5 text-[13px] font-bold ${
                d === duration ? "bg-navy text-white" : "bg-ground border border-line text-navy"
              }`}
            >
              {d} hrs
            </button>
          ))}
        </div>

        <Field label="Pickup" value={pickup} dot="bg-ok" />
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Field label="Date" value="Oct 22, 2026" />
          </div>
          <div className="flex-1">
            <Field label="Start time" value="2:00 PM" />
          </div>
        </div>
        <Field label="Passengers" value={String(passengers)} />

        <div className="text-[15px] font-extrabold text-navy pt-1">Choose a vehicle</div>
        <div className="flex flex-col gap-2">
          {chauffeurVehicles.map((v) => {
            const active = v.id === selected;
            const isUnavailable = v.id === "c3";
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`flex flex-col gap-1.5 rounded-[14px] p-3 text-left ${
                  active ? "border-2 border-acc bg-white" : "border border-line"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-[10px] bg-navy flex items-center justify-center">
                    {v.id === "c3" ? (
                      <StarIcon className="w-[18px] h-[18px] text-acc" />
                    ) : (
                      <CarIcon className="w-[18px] h-[18px] text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-navy">{v.name}</span>
                      {v.id === "c2" && (
                        <span className="bg-acc text-navy text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-muted">
                      {v.seats} seats · {v.desc}
                    </div>
                  </div>
                  <div className="font-extrabold text-navy text-[13.5px]">${v.pricePerHr}/hr</div>
                </div>
                {isUnavailable && (
                  <div className="text-[10.5px] text-muted font-semibold pl-[54px]">
                    Limited availability this evening
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-ground border border-line rounded-[10px] p-3.5 flex items-center justify-between">
          <span className="text-[12.5px] text-muted font-semibold">
            {duration} hrs × ${vehicle.pricePerHr}/hr
          </span>
          <span className="text-base font-extrabold text-navy">${estimate.toFixed(2)} est.</span>
        </div>

        <button
          onClick={() =>
            router.push(
              `/booking-review?service=${encodeURIComponent("Hourly Chauffeur")}&vehicle=${encodeURIComponent(
                `${vehicle.name} · ${duration} hrs`
              )}&from=${encodeURIComponent(pickup)}&date=${encodeURIComponent(
                "Oct 22, 2026"
              )}&time=${encodeURIComponent("2:00 PM")}&price=${estimate.toFixed(
                2
              )}&tripId=t2&passengers=${encodeURIComponent(String(passengers))}`
            )
          }
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-auto"
        >
          Reserve chauffeur
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
