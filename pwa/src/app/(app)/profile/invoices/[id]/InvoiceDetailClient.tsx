"use client";

import { useRouter } from "next/navigation";
import type { Invoice } from "@/data/mock";
import { CreditCardIcon, CarIcon, DownloadIcon, MailIcon } from "@/components/Icons";

export default function InvoiceDetailClient({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const total = invoice.charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <div className="flex-shrink-0 h-14 flex items-center gap-1 pl-2 pr-3">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-11 h-11 rounded-full flex items-center justify-center text-navy flex-shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <span className="flex-1 text-[22px] leading-[30px] font-bold text-navy tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>
          Invoice
        </span>
        <button
          aria-label="Share"
          className="w-11 h-11 rounded-full bg-surface border border-line flex items-center justify-center text-navy text-sm flex-shrink-0"
        >
          ⤴
        </button>
      </div>

      <div className="flex-1 bg-ground px-4 pt-1 pb-6 flex flex-col overflow-y-auto">
        <div className="bg-navy rounded-[24px] p-4.5 flex flex-col gap-2.5 mb-3.5 relative overflow-hidden">
          <div className="flex justify-between items-start relative">
            <div>
              <div className="text-muted-on-dark text-[10.5px] font-bold tracking-wide uppercase">Invoice number</div>
              <div className="text-white text-[16px] font-extrabold mt-0.5">{invoice.invoiceNumber}</div>
            </div>
            <div className="bg-[#DDF3E8] px-2.5 py-1 rounded-full">
              <span className="text-[10.5px] font-bold text-ok">{invoice.status}</span>
            </div>
          </div>
          <div className="flex justify-between items-center relative">
            <div className="bg-[#FBEBCF] px-2.5 py-0.5 rounded-full">
              <span className="text-[10.5px] font-bold text-[#7A4A00]">{invoice.service}</span>
            </div>
            <span className="text-[11.5px] font-bold text-muted-on-dark">
              {invoice.date} · {invoice.time}
            </span>
          </div>
          <div className="h-px bg-navy-3 my-0.5" />
          <div className="flex items-center gap-2">
            <div className="w-[9px] h-[9px] rounded-full bg-ok flex-shrink-0" />
            <span className="text-white font-bold text-[13.5px]">{invoice.pickup}</span>
          </div>
          <div className="w-0.5 h-3.5 bg-navy-2 ml-[3px]" />
          <div className="flex items-center gap-2">
            <div className="w-[9px] h-[9px] rounded-full bg-bad flex-shrink-0" />
            <span className="text-white font-bold text-[13.5px]">{invoice.dropoff}</span>
          </div>
        </div>

        <div className="text-[13.5px] font-extrabold text-navy mb-2.5">Charges</div>
        <div className="bg-ground border border-line rounded-[16px] p-4 flex flex-col gap-2.5 mb-3.5">
          {invoice.charges.map((c) => (
            <div key={c.label} className="flex justify-between">
              <span className="text-[13px] text-muted">{c.label}</span>
              <span className="text-[13px] font-semibold text-navy">${c.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="h-px bg-line my-0.5" />
          <div className="flex justify-between">
            <span className="text-[14.5px] font-extrabold text-navy">Total charged</span>
            <span className="text-[15px] font-extrabold text-navy">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-[13.5px] font-extrabold text-navy mb-2.5">Payment &amp; vehicle</div>
        <div className="bg-ground border border-line rounded-[16px] p-3.5 flex flex-col gap-2.5 mb-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-[#E8EEF8] flex items-center justify-center flex-shrink-0">
              <CreditCardIcon className="w-[16px] h-[16px] text-navy-3" />
            </div>
            <div>
              <div className="text-[12.5px] font-bold text-navy">{invoice.paymentMethod}</div>
              <div className="text-[10.5px] text-muted">Charged {invoice.date}</div>
            </div>
          </div>
          {invoice.vehicle && (
            <>
              <div className="h-px bg-line" />
              <div className="flex items-center gap-2.5">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-[#FBEBCF] flex items-center justify-center flex-shrink-0">
                  <CarIcon className="w-[16px] h-[16px] text-[#7A4A00]" />
                </div>
                <div>
                  <div className="text-[12.5px] font-bold text-navy">{invoice.vehicle}</div>
                  {invoice.driver && <div className="text-[10.5px] text-muted">Driver: {invoice.driver}</div>}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2.5 mt-3.5">
          <button className="flex-1 bg-acc rounded-[14px] py-3.5 flex items-center justify-center gap-2">
            <DownloadIcon className="w-[14px] h-[14px] text-navy" />
            <span className="text-navy font-extrabold text-[13.5px]">Download PDF</span>
          </button>
          <button className="flex-1 bg-surface border border-line rounded-[14px] py-3.5 flex items-center justify-center gap-2">
            <MailIcon className="w-[14px] h-[14px] text-navy" />
            <span className="text-navy font-bold text-[13.5px]">Email receipt</span>
          </button>
        </div>
      </div>
    </>
  );
}
