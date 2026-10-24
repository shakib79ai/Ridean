"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { user } from "@/data/mock";
import { PencilIcon } from "@/components/Icons";

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <HeroHeader title="Edit profile" />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-6 pb-6 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-navy-2 flex items-center justify-center text-3xl font-extrabold text-white">
              {name.charAt(0)}
            </div>
            <button
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-acc border-2 border-surface flex items-center justify-center text-navy"
            >
              <PencilIcon className="w-[12px] h-[12px]" />
            </button>
          </div>
          <span className="text-[11.5px] text-muted font-semibold">Tap to change photo</span>
        </div>

        <Field label="Full name" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Phone" value={phone} onChange={setPhone} type="tel" />

        {saved && (
          <div className="bg-ok-bg text-ok text-[12.5px] font-bold rounded-[10px] px-3.5 py-2.5 text-center">
            Profile updated
          </div>
        )}

        <button
          onClick={() => setSaved(true)}
          className="bg-acc text-navy font-extrabold text-[15px] py-3.5 rounded-[14px] mt-2"
        >
          Save changes
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="text-center text-sm font-bold text-navy-3 py-2"
        >
          Back to profile
        </button>
      </div>
    </>
  );
}

function Field({
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
    <div>
      <div className="text-[11px] font-bold text-muted uppercase mb-1.5">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3 text-sm font-semibold text-navy outline-none focus:border-navy-3"
      />
    </div>
  );
}
