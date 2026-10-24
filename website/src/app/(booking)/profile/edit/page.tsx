"use client";

import { useState } from "react";
import Link from "next/link";
import { rUser } from "@/data/booking-mock";

export default function EditProfile() {
  const [name, setName] = useState(rUser.name);
  const [email, setEmail] = useState(rUser.email);
  const [phone, setPhone] = useState(rUser.phone);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-sm font-bold text-navy-3">← Profile</Link>
      </div>
      <div className="text-[22px] font-extrabold text-navy">Edit profile</div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center text-acc font-extrabold text-2xl">
              {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-acc border-2 border-surface flex items-center justify-center text-navy text-xs font-bold">
              ✎
            </div>
          </div>
          <div className="text-sm text-muted">Tap the icon to change your photo</div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
        </label>

        <button
          onClick={() => setSaved(true)}
          className="self-start bg-acc text-navy font-extrabold text-sm px-6 py-3 rounded-xl hover:brightness-105 transition"
        >
          Save changes
        </button>
        {saved && <div className="text-sm font-semibold text-ok">Profile updated.</div>}
      </div>
    </div>
  );
}
