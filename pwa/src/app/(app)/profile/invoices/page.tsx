import Link from "next/link";
import { invoices } from "@/data/mock";
import { HeroHeader } from "@/components/HeroHeader";
import { FlightIcon, CarIcon, KeyIcon, DownloadIcon } from "@/components/Icons";

const ICONS = { flight: FlightIcon, car: CarIcon, key: KeyIcon };
const ICON_BG = { flight: "bg-[#E8EEF8] text-navy-3", car: "bg-[#FBEBCF] text-[#7A4A00]", key: "bg-[#DDF3E8] text-ok" };

export default function InvoicesPage() {
  const totalSpent = invoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <>
      <HeroHeader title="Invoices" subtitle="Receipts for every completed ride, transfer and rental." />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-2.5 overflow-y-auto">
        <div className="flex gap-2.5 mb-1">
          <div className="flex-1 bg-ground border border-line rounded-[14px] p-3 text-center">
            <div className="text-[16px] font-extrabold text-navy">{invoices.length}</div>
            <div className="text-[10.5px] text-muted font-semibold mt-0.5">Trips this year</div>
          </div>
          <div className="flex-1 bg-ground border border-line rounded-[14px] p-3 text-center">
            <div className="text-[16px] font-extrabold text-navy">${totalSpent.toFixed(2)}</div>
            <div className="text-[10.5px] text-muted font-semibold mt-0.5">Total spent</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {invoices.map((inv) => {
            const Icon = ICONS[inv.icon];
            return (
              <Link
                key={inv.id}
                href={`/profile/invoices/${inv.id}`}
                className="bg-surface border border-line rounded-[16px] p-3.5 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 ${ICON_BG[inv.icon]}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-navy truncate">{inv.service}</div>
                  <div className="text-[11px] text-muted mt-0.5 truncate">
                    {inv.date} · {inv.route}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-extrabold text-navy text-[13.5px]">${inv.amount.toFixed(2)}</div>
                  <div className="text-[10px] text-ok font-bold mt-0.5">{inv.status}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <button className="bg-acc rounded-[14px] py-3.5 mt-2 flex items-center justify-center gap-2">
          <DownloadIcon className="w-[15px] h-[15px] text-navy" />
          <span className="font-extrabold text-navy text-[13.5px]">Export all as PDF</span>
        </button>
      </div>
    </>
  );
}
