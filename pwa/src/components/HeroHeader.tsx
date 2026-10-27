"use client";

import { useRouter } from "next/navigation";

// Thin alternating navy/acc checkered-flag stripe used at the very top of
// every header across the app (Home uses a distinct diagonal variant below).
export function CheckeredFlag({ columns = 22 }: { columns?: number }) {
  return (
    <div className="flex h-[10px] w-full flex-shrink-0">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-navy" : "bg-acc"}`} />
      ))}
    </div>
  );
}

// Diagonal checkerboard texture, used only on the Home screen's header.
export function DiagonalFlag() {
  return (
    <div
      className="h-[11px] w-full flex-shrink-0"
      style={{
        backgroundColor: "#F4B000",
        backgroundSize: "14px 14px",
        backgroundPosition: "0 0, 7px 0, 7px -7px, 0 7px",
        backgroundImage: [
          "linear-gradient(45deg, #0A1F44 25%, transparent 25%)",
          "linear-gradient(-45deg, #0A1F44 25%, transparent 25%)",
          "linear-gradient(45deg, transparent 75%, #0A1F44 75%)",
          "linear-gradient(-45deg, transparent 75%, #0A1F44 75%)",
        ].join(","),
      }}
    />
  );
}

export function HeroHeader({
  title,
  subtitle,
  showBack = true,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex-shrink-0">
      <div className="h-14 flex items-center gap-1 pl-2 pr-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-11 h-11 rounded-full flex items-center justify-center text-navy flex-shrink-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}
        <span
          className="flex-1 text-[22px] leading-[30px] font-bold text-navy tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </span>
      </div>
      {subtitle && (
        <div className={`text-[13px] text-muted -mt-1.5 pb-1 ${showBack ? "pl-14 pr-4" : "px-4"}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// Large tab-root header: a big display title with an optional right-side
// icon button, used on top-level tab pages (Trips, Wallet, Help, Profile…).
export function TabHeader({
  title,
  action,
}: {
  title: string;
  action?: { icon: React.ReactNode; label: string; href?: string; onClick?: () => void };
}) {
  const btnClass = "w-11 h-11 rounded-full bg-surface border border-line text-navy flex items-center justify-center flex-shrink-0";
  return (
    <div className="h-14 flex items-center justify-between px-4 flex-shrink-0">
      <span
        className="text-[32px] leading-[40px] font-bold text-navy tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </span>
      {action && action.href && (
        <a href={action.href} aria-label={action.label} className={btnClass}>
          {action.icon}
        </a>
      )}
      {action && !action.href && (
        <button aria-label={action.label} onClick={action.onClick} className={btnClass}>
          {action.icon}
        </button>
      )}
    </div>
  );
}
