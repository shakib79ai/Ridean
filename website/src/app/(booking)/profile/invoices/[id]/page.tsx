import Link from "next/link";
import { notFound } from "next/navigation";
import { invoices } from "@/data/booking-mock";

export function generateStaticParams() {
  return invoices.map((inv) => ({ id: inv.id }));
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = invoices.find((inv) => inv.id === id);
  if (!invoice) return notFound();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/profile/invoices" className="w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center text-white">
          ‹
        </Link>
        <div className="text-lg font-extrabold text-navy">Invoice</div>
      </div>

      <div className="bg-navy rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute -right-6 -top-7 w-28 h-28 rounded-full bg-acc opacity-10" />
        <div className="flex items-start justify-between relative">
          <div>
            <div className="text-muted-on-dark text-[11px] font-bold tracking-wide uppercase">Invoice number</div>
            <div className="text-white text-base font-extrabold mt-0.5">{invoice.id}</div>
          </div>
          <span className="bg-ok-bg text-ok text-[11px] font-bold px-3 py-1 rounded-full">{invoice.status}</span>
        </div>
        <div className="flex items-center justify-between relative">
          <span className="bg-warn-bg text-warn text-[11px] font-bold px-2.5 py-1 rounded-full">{invoice.mode}</span>
          <span className="text-muted-on-dark text-xs font-bold">
            {invoice.date} · {invoice.time}
          </span>
        </div>
        <div className="h-px bg-navy-3" />
        <div className="text-white font-bold text-sm">{invoice.route}</div>
      </div>

      <div>
        <div className="text-sm font-extrabold text-navy mb-2">Charges</div>
        <div className="bg-ground border border-line rounded-2xl p-4 flex flex-col gap-2.5">
          {invoice.charges.map((c) => (
            <div key={c.label} className="flex justify-between text-sm">
              <span className="text-muted">{c.label}</span>
              <span className="font-semibold text-navy">{c.amount}</span>
            </div>
          ))}
          <div className="h-px bg-line my-1" />
          <div className="flex justify-between">
            <span className="font-extrabold text-navy text-[15px]">Total charged</span>
            <span className="font-extrabold text-navy text-[15px]">{invoice.total}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-extrabold text-navy mb-2">Payment &amp; vehicle</div>
        <div className="bg-ground border border-line rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-info-bg flex items-center justify-center text-base">💳</div>
            <div>
              <div className="text-sm font-bold text-navy">{invoice.paymentLabel}</div>
              <div className="text-xs text-muted">{invoice.paymentSub}</div>
            </div>
          </div>
          <div className="h-px bg-line" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-warn-bg flex items-center justify-center text-base">🚘</div>
            <div>
              <div className="text-sm font-bold text-navy">{invoice.vehicleLabel}</div>
              <div className="text-xs text-muted">{invoice.vehicleSub}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-acc rounded-xl py-3.5 font-extrabold text-navy text-sm">Download PDF</button>
        <button className="flex-1 bg-surface border border-line rounded-xl py-3.5 font-bold text-navy text-sm">
          Email receipt
        </button>
      </div>
    </div>
  );
}
