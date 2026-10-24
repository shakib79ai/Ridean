"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
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
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-4">
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

        <div className="text-[15px] font-extrabold text-navy">
          Choose a ride
        </div>
        <div className="flex flex-col gap-2">
          {vehicleCategories.map((v) => {
            const active = v.id === selected;
            const isUnavailable = v.id === UNAVAILABLE_ID;
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`flex flex-col gap-1.5 rounded-[14px] p-3 text-left ${
                  active ? "border-2 border-acc bg-white" : "border border-line"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[22px]">{v.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-bold text-navy">{v.name}</span>
                      {v.id === POPULAR_ID && (
                        <span className="bg-acc text-navy text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted">
                      {v.eta} away · {v.seats} seats
                    </div>
                  </div>
                  <div className="font-extrabold text-navy">{v.price}</div>
                </div>
                {isUnavailable && (
                  <div className="text-[10.5px] text-muted font-semibold pl-[34px]">
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
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-auto"
        >
          Confirm {vehicle.name}
        </button>
      </div>
    </>
  );
}
