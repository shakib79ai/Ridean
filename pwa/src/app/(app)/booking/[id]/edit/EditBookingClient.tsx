"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import type { Trip } from "@/data/mock";

export default function EditBookingClient({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [date, setDate] = useState(trip.date);
  const [time, setTime] = useState(trip.time);
  const [from, setFrom] = useState(trip.from);
  const [to, setTo] = useState(trip.to);
  const [babySeat, setBabySeat] = useState(false);
  const [luggage, setLuggage] = useState(0);
  const [passengers, setPassengers] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <>
      <HeroHeader title="Edit booking" subtitle={`${trip.mode} · ${trip.id.toUpperCase()}`} />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-4 overflow-y-auto">
        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="Pickup date" value={date} onChange={setDate} />
          </div>
          <div className="flex-1">
            <Field label="Pickup time" value={time} onChange={setTime} />
          </div>
        </div>
        <Field label="Pickup location" value={from} onChange={setFrom} />
        <Field label="Drop-off location" value={to} onChange={setTo} />

        <div className="border border-line rounded-[14px] p-3.5 flex items-center justify-between">
          <span className="text-[12.5px] text-muted font-semibold">Vehicle</span>
          <span className="text-[13px] text-navy font-bold">{trip.car}</span>
        </div>

        <div className="text-[11px] font-bold text-muted uppercase tracking-wide mt-1">Special requests</div>

        <div className="flex items-center justify-between border border-line rounded-[14px] p-3.5">
          <div>
            <div className="text-[13.5px] font-bold text-navy">Baby seat</div>
            <div className="text-[11px] text-muted">One infant/toddler car seat</div>
          </div>
          <button
            onClick={() => setBabySeat((v) => !v)}
            className={`w-[42px] h-6 rounded-full relative transition-colors ${babySeat ? "bg-acc" : "bg-line"}`}
          >
            <span
              className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-surface transition-all ${
                babySeat ? "left-[21px]" : "left-[3px]"
              }`}
            />
          </button>
        </div>

        <Stepper label="Extra luggage" sub="Beyond standard carry-on" value={luggage} onChange={setLuggage} max={5} />
        <Stepper label="Extra passengers" sub="Beyond default vehicle capacity" value={passengers} onChange={setPassengers} max={4} />

        <div>
          <div className="text-[11px] font-bold text-muted uppercase mb-1.5">Note to driver</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. meet at the north entrance"
            rows={3}
            className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3 text-sm font-semibold text-navy outline-none focus:border-navy-3 placeholder:text-muted-on-dark placeholder:font-normal resize-none"
          />
        </div>

        {saved && (
          <div className="bg-ok-bg text-ok text-[12.5px] font-bold rounded-[10px] px-3.5 py-2.5 text-center">
            Booking updated
          </div>
        )}

        <button
          onClick={() => setSaved(true)}
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-1"
        >
          Save changes
        </button>
        <button
          onClick={() => router.push(`/booking/${trip.id}`)}
          className="text-center text-sm font-bold text-navy-3 py-2"
        >
          Back to booking details
        </button>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-muted uppercase mb-1.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3 text-sm font-semibold text-navy outline-none focus:border-navy-3"
      />
    </div>
  );
}

function Stepper({
  label,
  sub,
  value,
  onChange,
  max,
}: {
  label: string;
  sub: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between border border-line rounded-[14px] p-3.5">
      <div>
        <div className="text-[13.5px] font-bold text-navy">{label}</div>
        <div className="text-[11px] text-muted">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-navy font-bold"
        >
          −
        </button>
        <span className="text-[14px] font-extrabold text-navy w-4 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-navy font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
