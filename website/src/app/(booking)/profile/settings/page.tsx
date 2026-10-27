"use client";

import { useState } from "react";
import Link from "next/link";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-12 h-7 rounded-full relative transition ${on ? "bg-acc" : "bg-line"}`}>
      <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [rideUpdates, setRideUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <Link href="/profile" className="text-sm font-bold text-navy-3">← Profile</Link>
      <div className="font-display text-[22px] font-extrabold text-navy">Settings</div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-4">
        <div className="text-sm font-bold text-navy">Notifications</div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-navy">Ride updates</span>
          <Toggle on={rideUpdates} onClick={() => setRideUpdates((v) => !v)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-navy">Promotions &amp; news</span>
          <Toggle on={promotions} onClick={() => setPromotions((v) => !v)} />
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-navy">Language</span>
          <span className="text-sm text-muted">English (US) →</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-navy">Dark mode</span>
          <Toggle on={darkMode} onClick={() => setDarkMode((v) => !v)} />
        </div>
        <Link href="/profile/legal" className="flex items-center justify-between">
          <span className="text-sm font-bold text-navy">Privacy policy</span>
          <span className="text-muted">→</span>
        </Link>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-3">
        <button className="text-left text-sm font-bold text-bad">Sign out</button>
        {!confirmingDelete ? (
          <button onClick={() => setConfirmingDelete(true)} className="text-left text-sm font-bold text-bad">
            Delete account
          </button>
        ) : (
          <div className="bg-bad-bg border border-bad/30 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-sm text-navy">This permanently deletes your account and trip history. This can&apos;t be undone.</div>
            <div className="flex gap-3">
              <button className="flex-1 bg-bad text-white font-bold text-sm py-2.5 rounded-xl">Confirm delete</button>
              <button onClick={() => setConfirmingDelete(false)} className="flex-1 border border-line text-navy font-bold text-sm py-2.5 rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
