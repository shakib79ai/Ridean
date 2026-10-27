"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import type { Trip } from "@/data/mock";
import { PhoneIcon } from "@/components/Icons";

type Msg = { from: "driver" | "me"; text: string };

export default function ContactDriverClient({ trip }: { trip: Trip }) {
  const router = useRouter();
  const driverName = trip.driver ? trip.driver.split(" · ")[0] : "Driver";
  const [messages, setMessages] = useState<Msg[]>([
    { from: "driver", text: "On my way — about 6 minutes out." },
    { from: "me", text: "Sounds good, I'll be at the main entrance." },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "me", text: draft.trim() }]);
    setDraft("");
  };

  return (
    <>
      <HeroHeader title="Contact driver" subtitle={trip.driver ?? "Driver not yet assigned"} />
      <div className="flex-1 bg-ground px-5 pt-5 pb-5 flex flex-col gap-3.5">
        <div className="flex items-center gap-3 border border-line rounded-[14px] p-3.5">
          <div className="w-11 h-11 rounded-full bg-navy-2 flex items-center justify-center text-base font-extrabold text-white">
            {driverName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-navy">{driverName}</div>
            <div className="text-[11.5px] text-muted">{trip.car}</div>
          </div>
          <button className="w-10 h-10 rounded-full bg-ok-bg flex items-center justify-center text-ok">
            <PhoneIcon className="w-[16px] h-[16px]" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-[160px]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-3.5 py-2.5 rounded-[14px] text-[13px] ${
                m.from === "me"
                  ? "self-end bg-navy text-white rounded-br-[4px]"
                  : "self-start bg-ground text-navy rounded-bl-[4px]"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message driver…"
            className="flex-1 bg-ground border border-line rounded-[10px] px-3.5 py-3 text-sm font-semibold text-navy outline-none focus:border-navy-3 placeholder:text-muted-on-dark placeholder:font-normal"
          />
          <button onClick={send} className="bg-acc text-navy font-extrabold text-sm px-4 rounded-[10px]">
            Send
          </button>
        </div>

        <button className="text-center text-[12.5px] font-bold text-bad py-1">Report an issue</button>
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
