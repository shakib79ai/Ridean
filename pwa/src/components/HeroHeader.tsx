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
      <CheckeredFlag />
      <div className="bg-navy px-5 pt-4 pb-5">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center text-white text-lg flex-shrink-0"
            >
              ‹
            </button>
          )}
          <span className="text-[21px] font-extrabold text-white">{title}</span>
        </div>
        {subtitle && (
          <div className={`text-xs text-muted-on-dark mt-1.5 ${showBack ? "ml-12" : ""}`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
