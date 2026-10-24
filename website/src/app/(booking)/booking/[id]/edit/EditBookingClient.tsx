"use client";

import { useState } from "react";
import Link from "next/link";
import type { Trip } from "@/data/booking-mock";

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-navy">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-lg border border-line text-navy font-bold">−</button>
        <span className="text-sm font-bold text-navy w-5 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-lg border border-line text-navy font-bold">+</button>
      </div>
    </div>
  );
}

export default function EditBookingClient({ trip }: { trip: Trip }) {
  const [date, setDate] = useState(trip.date);
  const [time, setTime] = useState(trip.time);
  const [from, setFrom] = useState(trip.from);
  const [to, setTo] = useState(trip.to);
  const [babySeat, setBabySeat] = useState(false);
  const [luggage, setLuggage] = useState(0);
  const [extraPassengers, setExtraPassengers] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <Link href={`/booking/${trip.id}`} className="text-sm font-bold text-navy-3">← Booking details</Link>
      <div className="text-[22px] font-extrabold text-navy">Edit booking</div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-4">
        <div className="text-xs font-bold text-muted uppercase">{trip.mode} · {trip.car}</div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted uppercase">Date</span>
            <input value={date} onChange={(e) => setDate(e.target.value)} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted uppercase">Time</span>
            <input value={time} onChange={(e) => setTime(e.target.value)} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Pickup location</span>
          <input value={from} onChange={(e) => setFrom(e.target.value)} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Drop-off location</span>
          <input value={to} onChange={(e) => setTo(e.target.value)} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
        </label>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-4">
        <div className="text-sm font-bold text-navy">Special requests</div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-navy">Baby seat</span>
          <button
            onClick={() => setBabySeat((v) => !v)}
            className={`w-12 h-7 rounded-full relative transition ${babySeat ? "bg-acc" : "bg-line"}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${babySeat ? "left-6" : "left-1"}`} />
          </button>
        </div>
        <Stepper label="Extra luggage" value={luggage} onChange={setLuggage} />
        <Stepper label="Extra passengers" value={extraPassengers} onChange={setExtraPassengers} />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Note to driver</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Please call on arrival, pickup is at the side entrance"
            className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-medium focus:outline-none focus:border-navy-3 min-h-[90px] resize-none"
          />
        </label>
      </div>

      <button
        onClick={() => setSaved(true)}
        className="self-start bg-acc text-navy font-extrabold text-sm px-6 py-3 rounded-xl hover:brightness-105 transition"
      >
        Save changes
      </button>
      {saved && <div className="text-sm font-semibold text-ok">Booking updated.</div>}
    </div>
  );
}
