"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { paymentMethods } from "@/data/mock";

export default function PaymentClient() {
  const router = useRouter();
  const params = useSearchParams();

  const service = params.get("service") ?? "Ride Now";
  const tripId = params.get("tripId") ?? "t2";
  const total = params.get("total") ?? "0.00";

  const [selected, setSelected] = useState(
    paymentMethods.find((p) => p.isDefault)?.id ?? paymentMethods[0]?.id
  );

  return (
    <>
      <HeroHeader title="Payment" subtitle={`${service} · $${total} due now`} />
      <div className="flex-1 bg-ground px-5 pt-5 pb-6 flex flex-col gap-3.5">
        <div className="text-[11px] font-bold text-muted uppercase tracking-wide">Payment method</div>

        <div className="flex flex-col gap-2.5">
          {paymentMethods.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setSelected(pm.id)}
              className={`flex items-center gap-3 rounded-[14px] p-3.5 border text-left ${
                selected === pm.id ? "border-2 border-acc" : "border-line"
              }`}
            >
              <div className="w-10 h-7 rounded-[6px] bg-navy flex items-center justify-center text-white text-[9px] font-extrabold">
                {pm.brand.slice(0, 4).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-navy">
                  {pm.brand} •••• {pm.last4}
                </div>
                <div className="text-[11px] text-muted">Expires {pm.expiry}</div>
              </div>
              {pm.isDefault && (
                <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold bg-info-bg text-info">
                  Default
                </span>
              )}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === pm.id ? "border-acc" : "border-line"
                }`}
              >
                {selected === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-acc" />}
              </div>
            </button>
          ))}

          <button className="flex items-center gap-3 rounded-[14px] p-3.5 border border-dashed border-line text-left">
            <div className="w-10 h-7 rounded-[6px] bg-ground border border-line flex items-center justify-center text-navy text-base">
              +
            </div>
            <div className="text-[13.5px] font-bold text-navy">Add new card</div>
          </button>
        </div>

        <div className="border border-line rounded-[14px] p-3.5 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">Total due now</span>
            <span className="text-[17px] font-extrabold text-navy">${total}</span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/trip-status?id=${tripId}`)}
          disabled={!selected}
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-auto disabled:opacity-50"
        >
          Pay &amp; confirm
        </button>
      </div>
    </>
  );
}
