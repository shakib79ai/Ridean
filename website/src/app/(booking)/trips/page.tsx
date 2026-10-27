import Link from "next/link";
import { trips } from "@/data/booking-mock";

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-info-bg text-info",
  completed: "bg-ok-bg text-ok",
  cancelled: "bg-ground text-muted",
};

export default function Trips() {
  return (
    <div className="flex flex-col gap-5">
      <div className="font-display text-[22px] font-extrabold text-navy">Trips</div>
      <div className="flex flex-col gap-3">
        {trips.map((t) => (
          <Link
            key={t.id}
            href={`/booking/${t.id}`}
            className="flex items-center justify-between bg-surface border border-line rounded-xl p-4 hover:border-navy-3 transition"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-sm font-bold text-navy">{t.mode}</span>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-muted">
                {t.from} → {t.to}
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                {t.date}, {t.time} · {t.car}
              </div>
            </div>
            <div className="text-sm font-extrabold text-navy">{t.price}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
