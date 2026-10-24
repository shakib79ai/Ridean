"use client";

import { useState } from "react";

export default function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className={`w-[42px] h-6 rounded-full relative transition-colors ${on ? "bg-acc" : "bg-line"}`}
    >
      <span
        className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-surface transition-all ${
          on ? "left-[21px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
