import { paymentMethods, walletActivity, walletBalance } from "@/data/booking-mock";

export default function Wallet() {
  return (
    <div className="flex flex-col gap-6">
      <div className="font-display text-[22px] font-extrabold text-navy">Wallet</div>

      <div className="bg-navy rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-muted-on-dark font-bold tracking-wide">RIDEAN CREDITS</div>
          <div className="text-white text-[28px] font-extrabold mt-1">${walletBalance.toFixed(2)}</div>
          <span className="inline-flex text-[10px] font-extrabold text-navy bg-acc px-2 py-0.5 rounded-full mt-2">RIDEAN+</span>
        </div>
        <div className="flex gap-3">
          <button className="bg-acc text-navy font-extrabold text-xs px-4 py-2.5 rounded-[10px]">Add funds</button>
          <button className="border border-muted-on-dark text-white font-bold text-xs px-4 py-2.5 rounded-[10px]">Redeem code</button>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-5">
        <div className="text-sm font-bold text-navy mb-3">Payment methods</div>
        <div className="flex flex-col gap-2.5">
          {paymentMethods.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-line last:border-b-0">
              <div className="text-sm text-navy font-semibold">
                {p.brand} •••• {p.last4}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Exp {p.expiry}</span>
                {p.isDefault && <span className="text-[10px] font-extrabold text-info bg-info-bg px-2 py-0.5 rounded-full">Default</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-5">
        <div className="text-sm font-bold text-navy mb-3">Recent activity</div>
        <div className="flex flex-col gap-2.5">
          {walletActivity.map((w) => (
            <div key={w.id} className="flex items-center justify-between py-2 border-b border-line last:border-b-0">
              <div>
                <div className="text-sm text-navy font-semibold">{w.title}</div>
                <div className="text-xs text-muted">{w.date}</div>
              </div>
              <div className={`text-sm font-bold ${w.positive ? "text-ok" : "text-muted"}`}>{w.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
