import Link from "next/link";
import { invoices, invoiceStats } from "@/data/booking-mock";

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-lg font-extrabold text-navy">Invoices</div>
        <div className="text-sm text-muted mt-0.5">Receipts for every completed ride, transfer and rental.</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
        <div className="bg-ground border border-line rounded-2xl p-4 text-center">
          <div className="text-xl font-extrabold text-navy">{invoiceStats.tripsThisYear}</div>
          <div className="text-xs text-muted font-semibold mt-0.5">Trips this year</div>
        </div>
        <div className="bg-ground border border-line rounded-2xl p-4 text-center">
          <div className="text-xl font-extrabold text-navy">{invoiceStats.totalSpent}</div>
          <div className="text-xs text-muted font-semibold mt-0.5">Total spent</div>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {invoices.map((inv, i) => (
          <Link
            key={inv.id}
            href={`/profile/invoices/${inv.id}`}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-ground transition ${
              i < invoices.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: inv.iconBg }}
            >
              {inv.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-navy">{inv.title}</div>
              <div className="text-xs text-muted mt-0.5 truncate">
                {inv.date} · {inv.route}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-extrabold text-navy">{inv.price}</div>
              <div className="text-[11px] text-ok font-bold mt-0.5">{inv.status}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-acc rounded-2xl py-3.5 text-center max-w-xl">
        <span className="font-extrabold text-navy text-sm">Export all as PDF</span>
      </div>
    </div>
  );
}
