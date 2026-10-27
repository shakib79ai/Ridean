import Link from "next/link";
import Topbar from "@/components/Topbar";
import Pill from "@/components/Pill";
import { bookings } from "@/data/mock";

const FILTERS = ["All", "Active", "Completed", "Cancelled", "Disputed"];

const STATUS_TONE: Record<string, "ok" | "info" | "warn" | "bad" | "neutral" | "accent"> = {
  Completed: "ok",
  "En route": "info",
  "In progress": "accent",
  Scheduled: "warn",
  Disputed: "bad",
  Cancelled: "neutral",
};

export default function BookingsPage() {
  return (
    <>
      <Topbar title="Bookings" subtitle="2,340 bookings this month" />
      <div className="p-7 md:p-8 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3.5">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f, i) => (
              <span
                key={f}
                className={`inline-flex items-center h-8 px-4 rounded-full text-[12.5px] font-bold border ${
                  i === 0 ? "bg-navy text-white border-navy" : "bg-surface text-muted border-line"
                }`}
              >
                {f}
              </span>
            ))}
          </div>
          <div className="flex gap-2.5">
            <div className="h-9 flex items-center px-3.5 border border-line rounded-[12px] bg-surface text-[12.5px] text-muted font-semibold">
              Last 30 days ▾
            </div>
            <div className="h-9 flex items-center px-4 rounded-[12px] bg-acc text-[12.5px] text-navy font-bold shadow-[0_6px_16px_rgba(244,176,0,.38)]">
              Export CSV
            </div>
            <Link
              href="/bookings/new"
              className="h-9 flex items-center px-4 rounded-[12px] bg-navy text-[12.5px] text-white font-bold"
            >
              + New booking
            </Link>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Booking", "Customer", "Service", "Driver / Supplier", "Pickup", "Status", "Amount", ""].map((h) => (
                    <th key={h} className="text-left text-[11.5px] tracking-wide uppercase text-muted font-bold px-3.5 py-2.5 border-b border-line whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id}>
                    {[b.id, b.customer, b.service, b.driverOrSupplier, b.pickup].map((cell, j) => (
                      <td key={j} className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < bookings.length - 1 ? "border-b border-line" : ""}`}>
                        {cell}
                      </td>
                    ))}
                    <td className={`px-3.5 py-3.5 ${i < bookings.length - 1 ? "border-b border-line" : ""}`}>
                      <Pill label={b.status} tone={STATUS_TONE[b.status]} />
                    </td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < bookings.length - 1 ? "border-b border-line" : ""}`}>
                      ${b.amount.toFixed(2)}
                    </td>
                    <td className={`text-[13.5px] px-3.5 py-3.5 whitespace-nowrap ${i < bookings.length - 1 ? "border-b border-line" : ""}`}>
                      <a href="#" className="text-navy-3 font-semibold">
                        {b.status === "Disputed" ? "Review" : "View"}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[12.5px] text-muted">Showing 1–9 of 2,340 bookings</div>
          <div className="flex gap-1.5">
            {["‹", "1", "2", "3", "›"].map((p, i) => (
              <div
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-[12.5px] font-bold ${
                  p === "1" ? "bg-navy text-white" : "bg-surface border border-line text-muted"
                }`}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
