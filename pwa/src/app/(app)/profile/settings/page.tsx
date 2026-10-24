"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeroHeader } from "@/components/HeroHeader";

export default function Settings() {
  const router = useRouter();
  const [tripUpdates, setTripUpdates] = useState(true);
  const [promos, setPromos] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <HeroHeader title="Settings" />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-2.5">
        <div className="text-[11px] font-bold text-muted uppercase tracking-wide mb-0.5">Notifications</div>
        <ToggleRow label="Trip updates" sub="Driver arrival, ETA changes" on={tripUpdates} onChange={setTripUpdates} />
        <ToggleRow label="Promotions & news" sub="Occasional offers from Ridean" on={promos} onChange={setPromos} />

        <div className="text-[11px] font-bold text-muted uppercase tracking-wide mt-3 mb-0.5">Preferences</div>
        <Row label="Language" value="English (US)" />
        <ToggleRow label="Dark mode" sub="Match system appearance" on={darkMode} onChange={setDarkMode} />
        <Link href="/profile/legal" className="flex items-center gap-3 border border-line rounded-[14px] p-3.5">
          <span className="flex-1 text-[13.5px] font-semibold text-navy">Privacy policy</span>
          <span className="text-muted">›</span>
        </Link>

        <button
          onClick={() => router.push("/sign-in")}
          className="text-center text-sm font-bold text-bad mt-4 py-3"
        >
          Sign out
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="text-center text-xs font-bold text-bad/70 py-1">
            Delete account
          </button>
        ) : (
          <div className="border border-bad/30 bg-bad-bg rounded-[14px] p-3.5 flex flex-col gap-2.5">
            <div className="text-[12.5px] text-navy font-semibold">
              This permanently deletes your account, trip history, and saved payment methods. This can&apos;t be undone.
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-line rounded-[10px] py-2.5 text-[12.5px] font-bold text-navy bg-surface"
              >
                Keep account
              </button>
              <button className="flex-1 bg-bad rounded-[10px] py-2.5 text-[12.5px] font-bold text-white">
                Delete account
              </button>
            </div>
          </div>
        )}

        <Link href="/profile" className="text-center text-sm font-bold text-navy-3 mt-auto py-3">
          Back to profile
        </Link>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border border-line rounded-[14px] p-3.5">
      <span className="text-[13.5px] font-semibold text-navy">{label}</span>
      <span className="text-[12.5px] text-muted">{value} ›</span>
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onChange,
}: {
  label: string;
  sub: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border border-line rounded-[14px] p-3.5">
      <div>
        <div className="text-[13.5px] font-bold text-navy">{label}</div>
        <div className="text-[11px] text-muted">{sub}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`w-[42px] h-6 rounded-full relative transition-colors ${on ? "bg-acc" : "bg-line"}`}
      >
        <span
          className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-surface transition-all ${
            on ? "left-[21px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
