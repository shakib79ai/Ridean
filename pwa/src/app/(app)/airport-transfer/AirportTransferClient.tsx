"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";

export default function AirportTransferClient() {
  const router = useRouter();
  const params = useSearchParams();
  const pickup = params.get("pickup") || "432 Park Ave, Manhattan";
  const dest = params.get("dest") || "JFK Airport, Terminal 4";
  const passengers = Number(params.get("passengers")) || 1;
  const luggage = Number(params.get("luggage")) || 1;
  const carryOn = Number(params.get("carryOn")) || 1;
  const [roundTrip, setRoundTrip] = useState(false);

  return (
    <>
      <HeroHeader title="Airport Transfer" subtitle="Flight-synced pickup, with live tracking." />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-3.5">
        <Field label="Pickup" value={pickup} dot="bg-ok" />
        <Field label="Drop-off" value={dest} dot="bg-bad" dotShape="square" />
        <Field label="Flight number" value="DL 1942" />
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Field label="Passengers" value={String(passengers)} />
          </div>
          <div className="flex-1">
            <Field label="Checked bags" value={String(luggage)} />
          </div>
          <div className="flex-1">
            <Field label="Carry-on" value={String(carryOn)} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-sm font-bold text-navy">Round trip</div>
            <div className="text-[12.5px] text-muted">Add a return transfer</div>
          </div>
          <button
            type="button"
            aria-pressed={roundTrip}
            onClick={() => setRoundTrip((v) => !v)}
            className={`w-11 h-6 rounded-full relative transition-colors ${roundTrip ? "bg-acc" : "bg-line"}`}
          >
            <span
              className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-surface transition-all ${
                roundTrip ? "left-[21px]" : "left-[3px]"
              }`}
            />
          </button>
        </div>

        <div className="pt-2">
          <div className="text-lg font-extrabold text-navy">Business</div>
          <div className="text-[12.5px] text-muted mt-1">Toyota Camry · meet &amp; greet included</div>
        </div>

        <button
          onClick={() =>
            router.push(
              `/booking-review?service=${encodeURIComponent("Airport Transfer")}&vehicle=${encodeURIComponent(
                "Business · Toyota Camry"
              )}&from=${encodeURIComponent(pickup)}&to=${encodeURIComponent(
                dest
              )}&price=74.00&tripId=t1&passengers=${encodeURIComponent(
                String(passengers)
              )}&luggage=${encodeURIComponent(String(luggage))}&carryOn=${encodeURIComponent(
                String(carryOn)
              )}`
            )
          }
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-auto"
        >
          Book transfer · $74.00
        </button>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  dot,
  dotShape = "circle",
}: {
  label: string;
  value: string;
  dot?: string;
  dotShape?: "circle" | "square";
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-bold text-muted uppercase tracking-wide">{label}</div>
      <div className="flex items-center gap-2 border border-line rounded-[10px] px-3 py-2.5 bg-ground">
        {dot && <div className={`w-2 h-2 ${dotShape === "circle" ? "rounded-full" : "rounded-sm"} ${dot}`} />}
        <span className="text-[13.5px] font-semibold text-navy">{value}</span>
      </div>
    </div>
  );
}
