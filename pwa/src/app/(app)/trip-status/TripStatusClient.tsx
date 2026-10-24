"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { trips } from "@/data/mock";
import { CheckIcon } from "@/components/Icons";

export default function TripStatusClient() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? trips[0].id;
  const trip = trips.find((t) => t.id === id) ?? trips[0];

  return (
    <>
      <HeroHeader title="Trip confirmed" showBack={false} />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-6 pb-6 flex flex-col items-center gap-3.5 text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-ok-bg flex items-center justify-center">
          <CheckIcon className="w-[32px] h-[32px] text-ok" />
        </div>
        <div className="text-xl font-extrabold text-navy">You&apos;re all set!</div>
        <div className="text-[13px] text-muted">
          {trip.mode} · {trip.date} · {trip.time}
        </div>
        <div className="w-full border border-line rounded-[14px] p-3.5 text-left mt-1">
          <div className="text-[14.5px] font-bold text-navy">
            {trip.from} → {trip.to}
          </div>
          <div className="text-[12.5px] text-muted mt-1">
            {trip.car} · {trip.price}
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] w-full mt-3"
        >
          Back to home
        </button>
      </div>
    </>
  );
}
