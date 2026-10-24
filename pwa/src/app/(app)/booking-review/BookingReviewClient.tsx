"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { user } from "@/data/mock";

export default function BookingReviewClient() {
  const router = useRouter();
  const params = useSearchParams();

  const service = params.get("service") ?? "Ride Now";
  const vehicle = params.get("vehicle") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const date = params.get("date") ?? "Today";
  const time = params.get("time") ?? "Now";
  const price = parseFloat(params.get("price") ?? "0");
  const tripId = params.get("tripId") ?? "t2";
  const passengers = params.get("passengers");
  const luggage = params.get("luggage");
  const carryOn = params.get("carryOn");

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

  const fee = Math.max(2, Math.round(price * 0.08 * 100) / 100);
  const base = Math.max(0, price - fee);
  const total = (base + fee).toFixed(2);

  function goToPayment() {
    const qs = new URLSearchParams({
      service,
      vehicle,
      from,
      to,
      date,
      time,
      price: String(price),
      tripId,
      name,
      email,
      phone,
      total,
      ...(passengers ? { passengers } : {}),
      ...(luggage ? { luggage } : {}),
      ...(carryOn ? { carryOn } : {}),
    });
    router.push(`/payment?${qs.toString()}`);
  }

  return (
    <>
      <HeroHeader title="Review booking" subtitle={`${service} · confirm the details below`} />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-3.5">
        <div className="border border-line rounded-[14px] p-3.5 flex flex-col gap-2.5">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wide">Rider details</div>
          <FormField label="Full name" value={name} onChange={setName} />
          <FormField label="Email" value={email} onChange={setEmail} type="email" />
          <FormField label="Phone" value={phone} onChange={setPhone} type="tel" />
        </div>

        <div className="border border-line rounded-[14px] p-3.5">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wide">Trip summary</div>
          <div className="text-[14.5px] font-bold text-navy mt-1">
            {service}
            {vehicle ? ` · ${vehicle}` : ""}
          </div>
          <div className="text-[12.5px] text-muted mt-0.5">
            {date} · {time}
          </div>
          {(from || to) && (
            <div className="text-[13px] text-navy mt-2 font-semibold">
              {from || "Pickup location"} → {to || "Destination"}
            </div>
          )}
          {(passengers || luggage || carryOn) && (
            <div className="text-[12.5px] text-muted mt-1.5">
              {[
                passengers ? `${passengers} passenger${passengers === "1" ? "" : "s"}` : null,
                luggage ? `${luggage} checked bag${luggage === "1" ? "" : "s"}` : null,
                carryOn ? `${carryOn} carry-on${carryOn === "1" ? "" : "s"}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>

        <div className="border border-line rounded-[14px] p-3.5">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wide mb-2">Price breakdown</div>
          <Row label="Base fare" value={`$${base.toFixed(2)}`} />
          <Row label="Service fee" value={`$${fee.toFixed(2)}`} />
          <div className="h-px bg-line my-2" />
          <Row label="Total" value={`$${total}`} bold />
        </div>

        <button
          onClick={goToPayment}
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-auto"
        >
          Continue to payment
        </button>
      </div>
    </>
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
  type?: "text" | "email" | "tel";
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-bold text-muted uppercase tracking-wide">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line rounded-[10px] px-3 py-2.5 bg-ground text-[13.5px] font-semibold text-navy outline-none focus:border-navy-3"
      />
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={`text-[13px] ${bold ? "font-bold text-navy" : "text-muted"}`}>{label}</span>
      <span className={`text-[13px] ${bold ? "font-extrabold text-navy" : "text-navy font-semibold"}`}>{value}</span>
    </div>
  );
}
