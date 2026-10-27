"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddPaymentMethod() {
  const [tab, setTab] = useState<"card" | "paypal">("card");
  const [connected, setConnected] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-[560px]">
      <Link href="/profile/payment-methods" className="text-sm font-bold text-navy-3">← Payment methods</Link>
      <div className="font-display text-[22px] font-extrabold text-navy">Add payment method</div>

      <div className="flex gap-2 bg-ground border border-line rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("card")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${tab === "card" ? "bg-surface text-navy shadow-sm" : "text-muted"}`}
        >
          Card
        </button>
        <button
          onClick={() => setTab("paypal")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${tab === "paypal" ? "bg-surface text-navy shadow-sm" : "text-muted"}`}
        >
          PayPal
        </button>
      </div>

      {tab === "card" ? (
        <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted uppercase">Card number</span>
            <input placeholder="1234 1234 1234 1234" className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted uppercase">Expiry</span>
              <input placeholder="MM/YY" className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted uppercase">CVV</span>
              <input placeholder="•••" className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted uppercase">Name on card</span>
            <input placeholder="Shakib Rahman" className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted uppercase">Billing ZIP</span>
            <input placeholder="10022" className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3 max-w-[160px]" />
          </label>
          <button
            onClick={() => setSaved(true)}
            className="self-start bg-acc text-navy font-extrabold text-sm px-6 py-3 rounded-xl hover:brightness-105 transition"
          >
            Save card
          </button>
          {saved && <div className="text-sm font-semibold text-ok">Card saved.</div>}
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-4 items-start">
          <div className="text-sm text-muted">Securely connect your PayPal account to pay for rides with it.</div>
          {!connected ? (
            <button
              onClick={() => setConnected(true)}
              className="bg-[#003087] text-white font-extrabold text-sm px-6 py-3 rounded-xl hover:brightness-110 transition"
            >
              Connect PayPal
            </button>
          ) : (
            <div className="text-sm font-semibold text-ok">PayPal connected successfully.</div>
          )}
        </div>
      )}
    </div>
  );
}
