"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rUser } from "@/data/booking-mock";

export default function BookingReviewClient() {
  const params = useSearchParams();
  const router = useRouter();

  const service = params.get("service") ?? "Ride Now";
  const vehicle = params.get("vehicle") ?? "Sedan";
  const price = params.get("price") ?? "$0.00";
  const from = params.get("from") ?? "Current location";
  const to = params.get("to") ?? "Your destination";
  const meta = params.get("meta") ?? "";

  const [name, setName] = useState(rUser.name);
  const [email, setEmail] = useState(rUser.email);
  const [phone, setPhone] = useState(rUser.phone);

  function handleContinue() {
    const next = new URLSearchParams({ service, vehicle, price, from, to, meta, name, email, phone });
    router.push(`/payment?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <div>
        <div className="text-[22px] font-extrabold text-navy">Review your booking</div>
        <div className="text-sm text-muted mt-1">Check the details below before you confirm.</div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-5">
        <div>
          <div className="text-[11px] font-bold text-muted uppercase mb-1">Service</div>
          <div className="text-sm font-bold text-navy">
            {service} · {vehicle}
          </div>
          {meta && <div className="text-xs text-muted mt-0.5">{meta}</div>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1">Pickup</div>
            <div className="text-sm font-semibold text-navy">{from}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1">Drop-off</div>
            <div className="text-sm font-semibold text-navy">{to}</div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-muted uppercase mb-2">Rider details</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Full name" value={name} onChange={setName} />
            <FormField label="Email" value={email} onChange={setEmail} type="email" />
            <FormField label="Phone" value={phone} onChange={setPhone} type="tel" />
          </div>
        </div>

        <div className="border-t border-line pt-4 flex justify-between">
          <span className="text-sm text-muted">Total fare</span>
          <span className="text-sm font-extrabold text-navy">{price}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleContinue}
          className="flex-1 bg-acc text-navy font-extrabold text-sm py-3.5 rounded-xl hover:brightness-95 transition"
        >
          Continue to payment
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

function FormField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="bg-ground border border-line rounded-xl px-4 py-2.5">
      <div className="text-[10.5px] font-bold text-muted uppercase">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-semibold text-navy bg-transparent outline-none w-full mt-0.5"
      />
    </div>
  );
}
