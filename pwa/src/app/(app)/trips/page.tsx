import Link from "next/link";
import { trips } from "@/data/mock";
import { CheckeredFlag } from "@/components/HeroHeader";

const STATUS_STYLE = {
  upcoming: { bg: "bg-warn-bg", fg: "text-warn", label: "Upcoming" },
  completed: { bg: "bg-ok-bg", fg: "text-ok", label: "Completed" },
  cancelled: { bg: "bg-bad-bg", fg: "text-bad", label: "Cancelled" },
};

export default function Trips() {
  return (
    <>
      <CheckeredFlag />
      <div className="bg-navy px-5 pt-5 pb-6">
        <span className="text-2xl font-extrabold text-white">Trips</span>
      </div>
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-2.5">
        {trips.map((t) => {
          const s = STATUS_STYLE[t.status];
          return (
            <Link
              key={t.id}
              href={`/booking/${t.id}`}
              className={`border border-line rounded-2xl p-3.5 flex flex-col gap-1.5 ${
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
