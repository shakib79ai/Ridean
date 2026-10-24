import { paymentMethods, walletActivity, walletBalance } from "@/data/mock";
import { CheckeredFlag } from "@/components/HeroHeader";

export default function Wallet() {
  return (
    <>
      <CheckeredFlag />
      <div className="bg-navy px-5 pt-5 pb-6">
        <span className="text-2xl font-extrabold text-white">Wallet</span>
      </div>
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-4">
        <div className="bg-navy rounded-[18px] p-4.5 flex flex-col gap-2.5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[11px] text-muted-on-dark font-semibold">
                Ridean Credits
              </div>
              <div className="text-white text-[27px] font-extrabold mt-0.5">
                ${walletBalance.toFixed(2)}
              </div>
            </div>
            <div className="bg-acc px-2.5 py-1 rounded-full">
              <span className="text-[10px] font-extrabold text-navy">
                RIDEAN+
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button className="flex-1 bg-navy-2 rounded-xl py-2.5 text-white font-bold text-xs">
              Add funds
            </button>
            <button className="flex-1 bg-navy-2 rounded-xl py-2.5 text-white font-bold text-xs">
              Redeem code
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-extrabold text-navy">
              Payment methods
            </span>
            <span className="text-xs font-bold text-info">+ Add new</span>
          </div>
          <div className="flex flex-col gap-2">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="border border-line rounded-[14px] p-3 flex items-center gap-2.5"
              >
                <div className="w-[38px] h-[26px] rounded-[6px] bg-navy flex items-center justify-center">
                  <span className="text-white text-[9px] font-extrabold">
                    {pm.brand.slice(0, 4).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-navy">
                    {pm.brand} •••• {pm.last4}
                  </div>
                  <div className="text-[11px] text-muted">
                    Expires {pm.expiry}
                  </div>
                </div>
                {pm.isDefault ? (
                  <div className="bg-ok-bg px-2 py-0.5 rounded-full">
                    <span className="text-[9.5px] font-bold text-ok">
                      Default
                    </span>
                  </div>
                ) : (
                  <span className="text-muted">⋯</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[13px] font-extrabold text-navy mb-2">
            Recent activity
          </div>
          <div className="flex flex-col gap-2">
            {walletActivity.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center bg-ground border border-line rounded-xl px-3.5 py-2.5"
              >
                <div>
                  <div className="text-[12.5px] font-bold text-navy">
                    {a.title}
                  </div>
                  <div className="text-[10.5px] text-muted">{a.date}</div>
                </div>
                <span
                  className={`text-[13px] font-extrabold ${
                    a.positive ? "text-ok" : "text-bad"
                  }`}
                >
                  {a.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
