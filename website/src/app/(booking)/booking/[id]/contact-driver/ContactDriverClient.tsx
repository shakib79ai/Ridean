"use client";

import { useState } from "react";
import Link from "next/link";
import type { Trip } from "@/data/booking-mock";

type Message = { id: string; from: "rider" | "driver"; text: string };

export default function ContactDriverClient({ trip }: { trip: Trip }) {
  const driverName = trip.driver ?? "Your driver";
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", from: "driver", text: `Hi, this is ${driverName}. I'll be arriving in your ${trip.car}.` },
    { id: "m2", from: "rider", text: "Thanks, see you soon!" },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: `m${m.length + 1}`, from: "rider", text: draft }]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-6 max-w-[560px]">
      <Link href={`/booking/${trip.id}`} className="text-sm font-bold text-navy-3">← Booking details</Link>
      <div className="text-[22px] font-extrabold text-navy">Contact driver</div>

      <div className="bg-surface border border-line rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center text-acc font-extrabold">
          {driverName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-navy">{driverName}</div>
          <div className="text-xs text-muted">{trip.car}</div>
        </div>
        <button className="bg-navy text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:brightness-110 transition">Call driver</button>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-5 flex flex-col gap-3 min-h-[220px]">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.from === "rider" ? "self-end bg-navy text-white" : "self-start bg-ground text-navy"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 border border-line rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-navy-3"
        />
        <button onClick={send} className="bg-acc text-navy font-extrabold text-sm px-5 py-3 rounded-xl">Send</button>
      </div>

      <button className="self-start text-sm font-bold text-bad">Report an issue</button>
    </div>
  );
}
