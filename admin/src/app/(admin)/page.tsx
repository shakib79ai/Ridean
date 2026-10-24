import Topbar from "@/components/Topbar";
import Pill from "@/components/Pill";
import { bookings, vehicleTiers } from "@/data/mock";

const KPIS = [
  { label: "Today's bookings", value: "142", delta: "▲ 8.2% vs yesterday", deltaTone: "text-ok" },
  { label: "Active drivers", value: "38", delta: "of 51 total drivers", deltaTone: "text-muted" },
  { label: "Revenue today", value: "$18,420", delta: "▲ 4.1% vs yesterday", deltaTone: "text-ok" },
  { label: "Avg. rating", value: "4.8", delta: "from 2,340 trips", deltaTone: "text-muted" },
];

const SERVICE_SHARE = [
  { label: "Ride Now", pct: 44, color: "bg-acc" },
  { label: "Airport transfers", pct: 26, color: "bg-navy-3" },
  { label: "Hourly chauffeur", pct: 14, color: "bg-navy-3" },
  { label: "Luxury chauffeur", pct: 9, color: "bg-navy-3" },
  { label: "Car rentals", pct: 7, color: "bg-navy-3" },
];

const ALERTS = [
  { title: "3 supplier disputes", sub: "Enterprise, Sixt — awaiting review", tone: "bad" as const },
  { title: "6 driver documents expiring", sub: "Within the next 14 days", tone: "warn" as const },
  { title: "Weekly settlement ready", sub: "$84,210 to disburse Friday", tone: "info" as const },
];

const ALERT_BG: Record<string, string> = { bad: "bg-bad-bg", warn: "bg-warn-bg", info: "bg-info-bg" };
const ALERT_BAR: Record<string, string> = { bad: "bg-bad", warn: "bg-warn", info: "bg-info" };

const STATUS_TONE: Record<string, "ok" | "info" | "warn" | "bad" | "neutral" | "accent"> = {
  Completed: "ok",
  "En route": "info",
  "In progress": "accent",
  Scheduled: "warn",
  Disputed: "bad",
  Cancelled: "neutral",
};

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview for Tuesday, October 20" />
      <div className="p-7 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {KPIS.map((k) => (
            <div key={k.label} className="bg-surface border border-line rounded-[14px] p-5">
              <div className="text-xs text-muted font-semibold">{k.label}</div>
              <div className="text-[28px] font-extrabold text-navy mt-1.5">{k.value}</div>
              <div className={`text-xs font-bold mt-1 ${k.deltaTone}`}>{k.delta}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-4.5 flex-wrap">
          <div className="flex-[999_1_560px] min-w-0 bg-surface border border-line rounded-[14px] p-5.5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="text-[14.5px] font-bold text-navy">Revenue — last 30 days</div>
              <div className="text-xs text-muted">$412,900 total</div>
            </div>
            <svg viewBox="0 0 560 180" className="w-full h-[180px]">
              <polyline
                points="0,150 40,140 80,120 120,130 160,100 200,110 240,80 280,95 320,70 360,85 400,55 440,65 480,40 520,50 560,30"
                fill="none"
                stroke="#F4B000"
                strokeWidth="3"
              />
              <polyline
                points="0,150 40,140 80,120 120,130 160,100 200,110 240,80 280,95 320,70 360,85 400,55 440,65 480,40 520,50 560,30 560,180 0,180"
                fill="#F4B000"
                opacity="0.08"
                stroke="none"
              />
              <line x1="0" y1="179" x2="560" y2="179" stroke="#DCE6F2" strokeWidth="1" />
            </svg>
          </div>
          <div className="flex-[1_1_320px] min-w-[280px] bg-surface border border-line rounded-[14px] p-5.5">
            <div className="text-[14.5px] font-bold text-navy mb-3.5">Bookings by service</div>
            <div className="flex flex-col gap-3">
              {SERVICE_SHARE.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[12.5px] text-navy mb-1">
                    <span>{s.label}</span>
                    <span className="font-bold">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-ground rounded-full">
                    <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4.5 flex-wrap">
          <div className="flex-[999_1_560px] min-w-0 bg-surface border border-line rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4.5">
              <div className="text-[14.5px] font-bold text-navy">Recent bookings</div>
              <a href="/bookings" className="text-[12.5px] font-bold text-navy-3">
                View all →
              </a>
            </div>
            <div className="overflow-x-auto mt-2.5">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Booking", "Customer", "Service", "Pickup", "Status", "Amount"].map((h) => (
                      <th key={h} className="text-left text-[11.5px] tracking-wide uppercase text-muted font-bold px-3.5 py-2.5 border-b border-line">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 6).map((b, i) => (
                    <tr key={b.id}>
                      <td className={`text-[13.5px] text-navy px-3.5 py-3.5 ${i < 5 ? "border-b border-line" : ""}`}>{b.id}</td>
                      <td className={`text-[13.5px] text-navy px-3.5 py-3.5 ${i < 5 ? "border-b border-line" : ""}`}>{b.customer}</td>
                      <td className={`text-[13.5px] text-navy px-3.5 py-3.5 ${i < 5 ? "border-b border-line" : ""}`}>{b.service}</td>
                      <td className={`text-[13.5px] text-muted px-3.5 py-3.5 ${i < 5 ? "border-b border-line" : ""}`}>{b.pickup}</td>
                      <td className={`px-3.5 py-3.5 ${i < 5 ? "border-b border-line" : ""}`}>
                        <Pill label={b.status} tone={STATUS_TONE[b.status]} />
                      </td>
                      <td className={`text-[13.5px] text-navy px-3.5 py-3.5 ${i < 5 ? "border-b border-line" : ""}`}>
                        ${b.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-[1_1_320px] min-w-[280px] bg-surface border border-line rounded-[14px] p-5">
            <div className="text-[14.5px] font-bold text-navy mb-3.5">Needs attention</div>
            <div className="flex flex-col gap-3">
              {ALERTS.map((a) => (
                <div key={a.title} className={`flex gap-2.5 p-3 rounded-[10px] ${ALERT_BG[a.tone]}`}>
                  <div className={`w-1.5 rounded ${ALERT_BAR[a.tone]}`} />
                  <div>
                    <div className="text-[13px] font-bold text-navy">{a.title}</div>
                    <div className="text-[11.5px] text-muted">{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-[14px] p-5.5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-[14.5px] font-bold text-navy">Top vehicle tiers this month</div>
            <div className="text-xs text-muted">By share of completed bookings</div>
          </div>
          <div className="flex flex-col gap-3">
            {vehicleTiers.map((t) => (
              <div key={t.name} className="flex items-center gap-3.5">
                <div className="w-[168px] shrink-0 flex items-center gap-2">
                  <span className="text-[12.5px] font-bold text-navy truncate">{t.name}</span>
                  {t.popular && <Pill label="Most popular" tone="accent" />}
                </div>
                <div className="flex-1 h-1.5 bg-ground rounded-full">
                  <div className={`h-1.5 rounded-full ${t.popular ? "bg-acc" : "bg-navy-3"}`} style={{ width: `${t.pct}%` }} />
                </div>
                <span className="w-9 text-right text-[12.5px] font-bold text-navy">{t.pct}%</span>
                <span className="w-[140px] shrink-0 text-[11.5px] text-muted truncate">{t.service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
