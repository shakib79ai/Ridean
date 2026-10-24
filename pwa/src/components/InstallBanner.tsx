"use client";

import { useEffect, useState } from "react";
import { DownloadIcon, CloseIcon } from "@/components/Icons";

const DISMISS_KEY = "ridean_install_dismissed";

export function InstallBanner() {
  // Always starts hidden on the server/first paint to avoid a hydration
  // mismatch, then reveals itself post-mount if the viewer hasn't dismissed it.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let stored = "1";
    try {
      stored = window.localStorage.getItem(DISMISS_KEY) ?? "0";
    } catch {
      stored = "0";
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing one-time external (localStorage) state post-mount to avoid SSR hydration mismatch
    setDismissed(stored === "1");
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (dismissed) return null;

  return (
    <div className="mx-5 mt-4 bg-navy rounded-[14px] p-3.5 flex items-center gap-3 relative">
      <div className="w-9 h-9 rounded-[10px] bg-navy-2 flex items-center justify-center shrink-0">
        <DownloadIcon className="w-[17px] h-[17px] text-acc" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-white">Install Ridean</div>
        <div className="text-[11px] text-muted-on-dark mt-0.5">
          Add to your home screen for faster, app-like access
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="bg-acc text-navy font-bold text-[11.5px] px-3.5 py-2 rounded-[10px] shrink-0"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-line flex items-center justify-center"
      >
        <CloseIcon className="w-[10px] h-[10px] text-navy" />
      </button>
    </div>
  );
}
