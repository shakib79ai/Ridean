"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentMethods } from "@/data/booking-mock";
import { hasSession } from "@/lib/session";

export default function PaymentClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [selected, setSelected] = useState(paymentMethods.find((p) => p.isDefault)?.id ?? paymentMethods[0]?.id);

  useEffect(() => {
    if (!hasSession()) {
      const returnUrl = `/payment?${params.toString()}`;
      router.replace(`/sign-in?return=${encodeURIComponent(returnUrl)}`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheckingSession(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const service = params.get("service") ?? "Ride Now";
  const vehicle = params.get("vehicle") ?? "Sedan";
  const price = params.get("price") ?? "$0.00";
  const from = params.get("from") ?? "Current location";
  const to = params.get("to") ?? "Your destination";
  const meta = params.get("meta") ?? "";
  const email = params.get("email") ?? "";

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="text-sm font-semibold text-muted">Redirecting to sign in to finish booking…</div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex flex-col gap-6 max-w-[560px]">
        <div className="w-14 h-14 rounded-full bg-ok-bg flex items-center justify-center text-2xl">✓</div>
        <div>
          <div className="font-display text-[22px] font-extrabold text-navy">Booking confirmed</div>
          <div className="text-sm text-muted mt-1">
            Your {service.toLowerCase()} is booked and paid. A receipt has been sent to {email || "your email"}.
          </div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-3">
          <Row label="Service" value={`${service} · ${vehicle}`} />
          <Row label="Pickup" value={from} />
          <Row label="Drop-off" value={to} />
          {meta && <Row label="Details" value={meta} />}
          <div className="border-t border-line pt-3 flex justify-between">
            <span className="text-sm text-muted">Total charged</span>
            <span className="text-sm font-extrabold text-navy">{price}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/trips" className="flex-1 text-center bg-navy text-white font-bold text-sm py-3 rounded-xl hover:brightness-110 transition">
            View my trips
          </Link>
          <Link href="/dashboard" className="flex-1 text-center bg-surface border border-line text-navy font-bold text-sm py-3 rounded-xl hover:bg-ground transition">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <div>
        <div className="font-display text-[22px] font-extrabold text-navy">Payment</div>
        <div className="text-sm text-muted mt-1">Choose how you&apos;d like to pay for this booking.</div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-3">
        <div className="text-[11px] font-bold text-muted uppercase mb-1">Order summary</div>
        <div className="flex justify-between">
          <span className="text-sm text-navy font-semibold">
            {service} · {vehicle}
          </span>
          <span className="text-sm font-extrabold text-navy">{price}</span>
        </div>
        {meta && <div className="text-xs text-muted">{meta}</div>}
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-[11px] font-bold text-muted uppercase">Payment method</div>
        {paymentMethods.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`flex items-center justify-between bg-surface border rounded-xl p-4 text-left transition ${
              selected === m.id ? "border-navy ring-1 ring-navy" : "border-line hover:border-navy/40"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-7 rounded-md bg-navy flex items-center justify-center text-acc font-extrabold text-[10px]">
                {m.brand.slice(0, 4).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-navy">
                  {m.brand} •••• {m.last4}
                </div>
                <div className="text-xs text-muted">Expires {m.expiry}</div>
              </div>
            </div>
            {m.isDefault && <span className="text-[11px] font-extrabold text-info bg-info-bg px-2.5 py-1 rounded-full">Default</span>}
          </button>
        ))}
        <button className="flex items-center gap-3 border border-dashed border-line rounded-xl p-4 text-left text-muted hover:border-navy/40 transition">
          <span className="w-11 h-7 rounded-md border border-line flex items-center justify-center text-navy text-lg leading-none">+</span>
          <span className="text-sm font-semibold">Add new card</span>
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setConfirmed(true)}
          className="flex-1 bg-acc text-navy font-extrabold text-sm py-3.5 rounded-xl hover:brightness-95 transition"
        >
          Pay &amp; confirm {price}
        </button>
        <Link
          href="/dashboard"
          className="flex-1 text-center bg-surface border border-line text-navy font-bold text-sm py-3.5 rounded-xl hover:bg-ground transition"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-semibold text-navy text-right">{value}</span>
    </div>
  );
}
