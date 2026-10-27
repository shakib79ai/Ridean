import Link from "next/link";
import { trips } from "@/data/mock";
import { TabHeader } from "@/components/HeroHeader";

const STATUS_STYLE = {
  upcoming: { bg: "bg-warn-bg", fg: "text-warn", label: "Upcoming" },
  completed: { bg: "bg-ok-bg", fg: "text-ok", label: "Completed" },
  cancelled: { bg: "bg-bad-bg", fg: "text-bad", label: "Cancelled" },
};

export default function Trips() {
  return (
    <>
      <TabHeader title="Trips" />
      <div className="flex-1 bg-ground px-4 pt-1 pb-6 flex flex-col gap-3">
        {trips.map((t) => {
          const s = STATUS_STYLE[t.status];
          return (
            <Link
              key={t.id}
              href={`/booking/${t.id}`}
              className={`bg-surface border border-line shadow-sm rounded-[24px] p-4 flex flex-col gap-1.5 ${
                t.status === "cancelled" ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between">
                <div className={`${s.bg} px-2.5 py-0.5 rounded-full`}>
                  <span className={`text-[9.5px] font-bold ${s.fg}`}>
                    {s.label}
                  </span>
                </div>
                <span className="text-[11px] text-muted font-bold">
                  {t.date} · {t.time}
                </span>
              </div>
              <div className="text-sm font-bold text-navy">
                {t.from} → {t.to}
              </div>
              <div className="text-[11.5px] text-muted">
                {t.car} · {t.distance} · {t.price}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
