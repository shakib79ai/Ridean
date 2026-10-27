import Link from "next/link";
import { paymentMethods } from "@/data/booking-mock";

export default function PaymentMethods() {
  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <Link href="/profile" className="text-sm font-bold text-navy-3">← Profile</Link>
      <div className="font-display text-[22px] font-extrabold text-navy">Payment methods</div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {paymentMethods.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-4 border-b border-line last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded-[6px] bg-navy flex items-center justify-center text-acc text-[10px] font-extrabold">
                {p.brand.slice(0, 4).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-navy">{p.brand} •••• {p.last4}</div>
                <div className="text-xs text-muted">Exp {p.expiry}</div>
              </div>
            </div>
            {p.isDefault && <span className="text-[10px] font-extrabold text-info bg-info-bg px-2 py-0.5 rounded-full">Default</span>}
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line last:border-b-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded-[6px] bg-[#003087] flex items-center justify-center text-white text-[9px] font-extrabold">PayPal</div>
            <div className="text-sm font-bold text-navy">PayPal</div>
          </div>
          <span className="text-[10px] font-extrabold text-ok bg-ok-bg px-2 py-0.5 rounded-full">Connected</span>
        </div>
      </div>

      <Link
        href="/profile/payment-methods/add"
        className="self-start bg-acc text-navy font-extrabold text-sm px-6 py-3 rounded-xl hover:brightness-105 transition"
      >
        Add payment method
      </Link>
    </div>
  );
}
