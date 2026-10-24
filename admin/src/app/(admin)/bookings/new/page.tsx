"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";

type ServiceKey = "ride" | "airport" | "hourly" | "luxury" | "rentals";

const SERVICES: { key: ServiceKey; label: string }[] = [
  { key: "ride", label: "Ride Now" },
  { key: "airport", label: "Airport Transfer" },
  { key: "hourly", label: "Hourly Chauffeur" },
  { key: "luxury", label: "Luxury Chauffeur" },
  { key: "rentals", label: "Car Rental" },
];

export default function NewBookingPage() {
  const router = useRouter();
  const [service, setService] = useState<ServiceKey>("ride");
  const [customer, setCustomer] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [carryOn, setCarryOn] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const showDestination = service !== "rentals";
  const showPassengers = service !== "rentals";
  const showLuggage = service === "airport";

  function handleCreate() {
    setConfirmed(true);
    setTimeout(() => {
      router.push("/bookings");
    }, 1100);
  }

  return (
    <>
      <Topbar title="New booking" subtitle="Create a booking on behalf of a customer" />
      <div className="p-7 md:p-8 flex flex-col gap-5 max-w-[640px]">
        {confirmed && (
          <div className="flex items-center gap-2.5 bg-ok-bg border border-ok/20 rounded-[10px] px-4 py-3 text-[13px] font-bold text-ok">
            Booking created — returning to Bookings…
          </div>
        )}

        <div className="bg-surface border border-line rounded-[14px] p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="text-[11.5px] tracking-wide uppercase text-muted font-bold">Service</div>
            <div className="flex gap-2 flex-wrap">
              {SERVICES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setService(s.key)}
                  className={`h-9 px-4 rounded-full text-[12.5px] font-bold border transition-colors ${
                    service === s.key
                      ? "bg-navy text-white border-navy"
                      : "bg-surface text-muted border-line"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Customer name" value={customer} onChange={setCustomer} placeholder="e.g. Maria Chen" />
          <Field label="Pickup" value={pickup} onChange={setPickup} placeholder="Pickup location" />
          {showDestination && (
            <Field label="Destination" value={destination} onChange={setDestination} placeholder="Destination" />
          )}

          {showPassengers && (
            <Stepper label="Passengers" value={passengers} onChange={setPassengers} min={1} max={6} />
          )}

          {showLuggage && (
            <>
              <Stepper label="Checked bags" value={luggage} onChange={setLuggage} min={0} max={6} />
              <Stepper label="Carry-on" value={carryOn} onChange={setCarryOn} min={0} max={6} />
            </>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.push("/bookings")}
              className="h-10 px-5 rounded-[10px] bg-surface border border-line text-[13px] font-bold text-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={confirmed}
              className="h-10 px-5 rounded-[10px] bg-acc text-navy text-[13px] font-bold disabled:opacity-60"
            >
              Create booking
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11.5px] tracking-wide uppercase text-muted font-bold">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 px-3.5 border border-line rounded-[10px] bg-ground text-[13.5px] font-semibold text-navy outline-none placeholder:text-muted placeholder:font-normal"
      />
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 border border-line rounded-[10px] px-3.5 py-2.5 bg-ground">
      <span className="text-[12.5px] font-semibold text-navy">{label}</span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 shrink-0 rounded-full bg-surface border border-line text-navy font-bold text-[14px] leading-none flex items-center justify-center disabled:opacity-40"
        >
          −
        </button>
        <span className="w-5 text-center text-[13.5px] font-extrabold text-navy tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 shrink-0 rounded-full bg-surface border border-line text-navy font-bold text-[14px] leading-none flex items-center justify-center disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
