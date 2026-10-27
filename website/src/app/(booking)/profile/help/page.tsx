"use client";

import { useState } from "react";
import Link from "next/link";
import { faqs } from "@/data/booking-mock";

export default function HelpSupport() {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <Link href="/profile" className="text-sm font-bold text-navy-3">← Profile</Link>
      <div className="font-display text-[22px] font-extrabold text-navy">Help &amp; support</div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {faqs.map((f) => (
          <div key={f.id} className="border-b border-line last:border-b-0">
            <button
              onClick={() => setOpen(open === f.id ? null : f.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-bold text-navy">{f.q}</span>
              <span className="text-muted">{open === f.id ? "−" : "+"}</span>
            </button>
            {open === f.id && <div className="px-5 pb-4 text-sm text-muted">{f.a}</div>}
          </div>
        ))}
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        <button className="w-full flex items-center justify-between px-5 py-4 border-b border-line text-left hover:bg-ground transition">
          <span className="text-sm font-bold text-navy">Contact support</span>
          <span className="text-muted">→</span>
        </button>
        <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-ground transition">
          <span className="text-sm font-bold text-navy">Call support · (800) 555-0148</span>
          <span className="text-muted">→</span>
        </button>
      </div>
    </div>
  );
}
