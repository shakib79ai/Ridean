"use client";

import { useState } from "react";
import { ChevronDownIcon } from "./icons";
import type { FaqItem } from "@/data/mock";

export default function FaqList({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className={i < items.length - 1 ? "border-b border-line" : ""}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="text-[13.5px] font-semibold text-navy pr-4">{item.q}</span>
              <ChevronDownIcon
                className={`w-[18px] h-[18px] text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && <p className="text-[12.5px] text-muted leading-relaxed pb-4 pr-6">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
