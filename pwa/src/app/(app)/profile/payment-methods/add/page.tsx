"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";

export default function AddPaymentMethod() {
  const router = useRouter();
  const [tab, setTab] = useState<"card" | "paypal">("card");
  const [connected, setConnected] = useState(false);

  return (
    <>
      <HeroHeader title="Add payment method" />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-4">
        <div className="flex border border-line rounded-[12px] p-1">
          <button
            onClick={() => setTab("card")}
            className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-bold ${
              tab === "card" ? "bg-navy text-white" : "text-muted"
            }`}
          >
            Card
          </button>
          <button
            onClick={() => setTab("paypal")}
            className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-bold ${
              tab === "paypal" ? "bg-navy text-white" : "text-muted"
            }`}
          >
            PayPal
          </button>
        </div>

        {tab === "card" ? (
          <>
            <Field label="Card number" placeholder="1234 5678 9012 3456" />
            <div className="flex gap-3">
              <div className="flex-1">
                <Field label="Expiry" placeholder="MM/YY" />
              </div>
              <div className="flex-1">
                <Field label="CVV" placeholder="123" />
              </div>
            </div>
            <Field label="Name on card" placeholder="Shakib Rahman" />
            <Field label="Billing ZIP code" placeholder="10013" />
            <button
              onClick={() => router.push("/profile/payment-methods")}
              className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-2"
            >
              Save card
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-14 h-14 rounded-full bg-[#003087] flex items-center justify-center text-white font-extrabold text-sm italic">
              PP
            </div>
            <div className="text-center text-[13px] text-muted px-4">
              You&apos;ll be redirected to PayPal to securely connect your account. No card details are shared with Ridean.
            </div>
            {!connected ? (
              <button
                onClick={() => setConnected(true)}
                className="bg-[#003087] text-white font-extrabold text-[15px] py-3.5 px-8 rounded-[14px]"
              >
                Connect PayPal
              </button>
            ) : (
              <>
                <div className="bg-ok-bg text-ok text-[12.5px] font-bold rounded-[10px] px-3.5 py-2.5">
                  PayPal connected
                </div>
                <button
                  onClick={() => router.push("/profile/payment-methods")}
                  className="bg-acc text-navy font-extrabold text-[15px] py-3.5 px-8 rounded-[14px]"
                >
                  Done
                </button>
              </>
            )}
          </div>
        )}

        <button onClick={() => router.back()} className="text-center text-sm font-bold text-navy-3 mt-auto py-3">
          Cancel
        </button>
      </div>
    </>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-muted uppercase mb-1.5">{label}</div>
      <input
        placeholder={placeholder}
        className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3 text-sm font-semibold text-navy outline-none focus:border-navy-3 placeholder:text-muted-on-dark placeholder:font-normal"
      />
    </div>
  );
}
