"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { VehicleArt } from "@/components/VehicleArt";
import { vehicleCategories } from "@/data/mock";

export default function RideNowClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "Current location";
  const dest = params.get("dest") || "Where to?";
  const passengers = Number(params.get("passengers")) || 1;
  const timing = params.get("timing") === "schedule" ? "schedule" : "now";
  const scheduleDate = params.get("scheduleDate");
  const scheduleTime = params.get("scheduleTime");
  const [selected, setSelected] = useState(vehicleCategories[0].id);
  const vehicle = vehicleCategories.find((v) => v.id === selected)!;
  const POPULAR_ID = "comfort";
  const UNAVAILABLE_ID = "black";

  return (
    <>
      <HeroHeader title="Ride Now" />
      <div className="flex-1 bg-ground px-5 pt-5 pb-6 flex flex-col gap-4">
        <div className="bg-ground border border-line rounded-2xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-ok" />
            <span className="text-[13.5px] font-semibold text-navy">
              {pickup}
            </span>
          </div>
          <div className="h-px bg-line ml-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-sm bg-bad" />
            <span className="text-[13.5px] text-muted-on-dark">
              {dest}
            </span>
          </div>
          <div className="h-px bg-line ml-1" />
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-muted">Passengers</span>
            <span className="text-[13.5px] font-bold text-navy">{passengers}</span>
          </div>
          {timing === "schedule" && (
            <>
              <div className="h-px bg-line ml-1" />
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-muted">Scheduled for</span>
                <span className="text-[13.5px] font-bold text-navy">
                  {scheduleDate || "Oct 22, 2026"} · {scheduleTime || "6:00 PM"}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="text-[15px] font-bold text-navy" style={{ fontFamily: "var(--font-display)" }}>
          Choose a ride
        </div>
        <div className="flex flex-col gap-2.5">
          {vehicleCategories.map((v) => {
            const active = v.id === selected;
            const isUnavailable = v.id === UNAVAILABLE_ID;
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`relative flex items-center gap-3 rounded-[20px] p-3.5 text-left bg-white shadow-[0_2px_12px_rgba(10,31,68,0.06)] ${
                  active ? "shadow-[inset_0_0_0_2px_var(--navy)]" : "shadow-[inset_0_0_0_1px_var(--line)]"
                } ${isUnavailable ? "opacity-55" : ""}`}
              >
                {v.id === POPULAR_ID && (
                  <span className="absolute top-2.5 right-2.5 bg-acc text-navy text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide">
                    POPULAR
                  </span>
                )}
                <VehicleArt tier={v.id} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-bold text-navy">{v.name}</div>
                  <div className="text-[11.5px] text-muted">{v.desc}</div>
                  <div className="text-[11.5px] font-semibold text-navy mt-0.5">
                    {v.seats} seats · {v.eta} away
                  </div>
                </div>
                <div
                  className="font-bold text-navy text-[16px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {v.price}
                </div>
                {isUnavailable && (
                  <div className="absolute -bottom-5 left-0 right-0 text-[10.5px] text-muted font-semibold">
                    High demand nearby — longer wait than usual
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() =>
            router.push(
              `/booking-review?service=${encodeURIComponent("Ride Now")}&vehicle=${encodeURIComponent(
                vehicle.name
              )}&from=${encodeURIComponent(pickup)}&to=${encodeURIComponent(
                dest
              )}&price=${encodeURIComponent(
                vehicle.price.replace("$", "")
              )}&tripId=t2&passengers=${encodeURIComponent(String(passengers))}`
            )
          }
          className="bg-acc text-navy font-bold text-[16px] py-3.5 rounded-[16px] mt-auto shadow-[0_6px_16px_rgba(244,176,0,0.38)]"
        >
          Confirm {vehicle.name}
        </button>
      </div>
    </>
  );
}
