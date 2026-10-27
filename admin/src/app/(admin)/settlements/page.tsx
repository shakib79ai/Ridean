import Topbar from "@/components/Topbar";
import Pill from "@/components/Pill";
import { CreditCardIcon } from "@/components/icons";
import { settlements } from "@/data/mock";

const STATS = [
  { label: "Pending payouts", value: "$84,210", note: "Disbursing Friday", tone: "text-muted" },
  { label: "Paid this month", value: "$318,940", note: "On schedule", tone: "text-ok" },
  { label: "Disputed settlements", value: "2", note: "Needs review", tone: "text-bad" },
];

const STATUS_TONE: Record<string, "warn" | "bad" | "ok"> = {
  Pending: "warn",
  Disputed: "bad",
  Paid: "ok",
};

export default function SettlementsPage() {
  return (
    <>
      <Topbar title="Settlements & Payments" subtitle="Weekly payout cycle — Friday, October 23" />
      <div className="p-7 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
          {STATS.map((s) => (
            <div key={s.label} className="bg-surface border border-line rounded-[20px] p-5">
              <div className="text-xs text-muted font-semibold">{s.label}</div>
              <div className="font-display text-[26px] font-extrabold text-navy mt-1.5">{s.value}</div>
              <div className={`text-xs font-bold mt-1 ${s.tone}`}>{s.note}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-line rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Driver / Supplier", "Period", "Trips", "Gross", "Commission", "Net payout", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-[11.5px] tracking-wide uppercase text-muted font-bold px-3.5 py-2.5 border-b border-line whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settlements.map((s, i) => (
                  <tr key={`${s.party}-${s.period}`}>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>{s.party}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>{s.period}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>{s.trips}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>${s.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>${s.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>${s.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`px-3.5 py-3.5 ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>
                      <Pill label={s.status} tone={STATUS_TONE[s.status]} />
                    </td>
                    <td className={`text-[13.5px] px-3.5 py-3.5 whitespace-nowrap ${i < settlements.length - 1 ? "border-b border-line" : ""}`}>
                      <a href="#" className="text-navy-3 font-semibold">
                        {s.status === "Disputed" ? "Review" : s.status === "Paid" ? "Receipt" : "Pay"}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4.5 flex-wrap">
          <div className="flex-1 min-w-[280px] bg-surface border border-line rounded-[20px] p-5">
            <div className="text-[14.5px] font-bold text-navy mb-2.5">Payout method</div>
            <div className="flex items-center gap-2.5 p-3 border border-line rounded-[12px]">
              <CreditCardIcon className="w-[18px] h-[18px] text-navy-3" />
              <div className="text-[13px] text-navy font-semibold">ACH batch — Chase Business ••1172</div>
            </div>
          </div>
          <div className="flex-1 min-w-[280px] bg-surface border border-line rounded-[20px] p-5">
            <div className="text-[14.5px] font-bold text-navy mb-2.5">Export</div>
            <div className="flex gap-2.5">
              <div className="h-9 flex items-center px-4 rounded-[12px] bg-acc text-[12.5px] text-navy font-bold shadow-[0_6px_16px_rgba(244,176,0,.38)]">Download CSV</div>
              <div className="h-9 flex items-center px-4 border border-line rounded-[12px] text-[12.5px] text-muted font-bold">Download PDF</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
