import Link from "next/link";
import { HeroHeader } from "@/components/HeroHeader";
import { paymentMethods } from "@/data/mock";

export default function PaymentMethods() {
  return (
    <>
      <HeroHeader title="Payment methods" />
      <div className="flex-1 bg-ground px-5 pt-5 pb-6 flex flex-col gap-2.5">
        <div className="text-[11px] font-bold text-muted uppercase tracking-wide mb-0.5">Cards</div>
        {paymentMethods.map((pm) => (
          <div key={pm.id} className="flex items-center gap-3 rounded-[14px] p-3.5 border border-line">
            <div className="w-10 h-7 rounded-[6px] bg-navy flex items-center justify-center text-white text-[9px] font-extrabold">
              {pm.brand.slice(0, 4).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold text-navy">
                {pm.brand} •••• {pm.last4}
              </div>
              <div className="text-[11px] text-muted">Expires {pm.expiry}</div>
            </div>
            {pm.isDefault && (
              <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold bg-info-bg text-info">
                Default
              </span>
            )}
          </div>
        ))}

        <div className="text-[11px] font-bold text-muted uppercase tracking-wide mt-3 mb-0.5">Other</div>
        <div className="flex items-center gap-3 rounded-[14px] p-3.5 border border-line">
          <div className="w-10 h-7 rounded-[6px] bg-[#003087] flex items-center justify-center text-white text-[9px] font-extrabold italic">
            PayPal
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-navy">PayPal</div>
            <div className="text-[11px] text-muted">Not connected</div>
          </div>
        </div>

        <Link
          href="/profile/payment-methods/add"
          className="flex items-center gap-3 rounded-[14px] p-3.5 border border-dashed border-line mt-2"
        >
          <div className="w-10 h-7 rounded-[6px] bg-ground border border-line flex items-center justify-center text-navy text-base">
            +
          </div>
          <div className="text-[13.5px] font-bold text-navy">Add payment method</div>
        </Link>

        <Link href="/profile" className="text-center text-sm font-bold text-navy-3 mt-auto py-3">
          Back to profile
        </Link>
      </div>
    </>
  );
}
