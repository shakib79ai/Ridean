import Topbar from "@/components/Topbar";
import Pill from "@/components/Pill";
import { drivers, suppliers } from "@/data/mock";

const DRIVER_TONE: Record<string, "ok" | "neutral" | "bad"> = {
  Online: "ok",
  Offline: "neutral",
  Suspended: "bad",
};

const SUPPLIER_TONE: Record<string, "ok" | "bad" | "warn"> = {
  Active: "ok",
  "Dispute open": "bad",
  Onboarding: "warn",
};

export default function DriversPage() {
  return (
    <>
      <Topbar title="Drivers & Suppliers" subtitle="51 drivers · 6 supplier partners" />
      <div className="p-7 md:p-8 flex flex-col gap-6">
        <div className="flex gap-7 border-b border-line">
          <div className="text-[13.5px] font-bold text-navy pb-2.5 border-b-2 border-acc">Drivers</div>
          <div className="text-[13.5px] font-bold text-muted pb-2.5 border-b-2 border-transparent">Supplier partners</div>
        </div>

        <div className="bg-surface border border-line rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Driver", "Vehicle", "Rating", "Trips completed", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-[11.5px] tracking-wide uppercase text-muted font-bold px-3.5 py-2.5 border-b border-line whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.map((d, i) => (
                  <tr key={d.name}>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < drivers.length - 1 ? "border-b border-line" : ""}`}>{d.name}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < drivers.length - 1 ? "border-b border-line" : ""}`}>{d.vehicle}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < drivers.length - 1 ? "border-b border-line" : ""}`}>{d.rating.toFixed(1)}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < drivers.length - 1 ? "border-b border-line" : ""}`}>{d.trips.toLocaleString()}</td>
                    <td className={`px-3.5 py-3.5 ${i < drivers.length - 1 ? "border-b border-line" : ""}`}>
                      <Pill label={d.status} tone={DRIVER_TONE[d.status]} />
                    </td>
                    <td className={`text-[13.5px] px-3.5 py-3.5 whitespace-nowrap ${i < drivers.length - 1 ? "border-b border-line" : ""}`}>
                      <a href="#" className="text-navy-3 font-semibold">
                        {d.status === "Suspended" ? "Review" : "Manage"}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-[14.5px] font-bold text-navy mt-1.5">Supplier partners</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.name} className="bg-surface border border-line rounded-[20px] p-4.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center font-extrabold text-xs"
                  style={{ background: s.color, color: s.textColor }}
                >
                  {s.code}
                </div>
                <div>
                  <div className="text-sm font-bold text-navy">{s.name}</div>
                  <div className="text-[11.5px] text-muted">{s.category}</div>
                </div>
              </div>
              <div className="flex justify-between mt-3.5 text-xs text-muted">
                <span>Commission</span>
                <span className="font-bold text-navy">{s.commission}%</span>
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-muted items-center">
                <span>Status</span>
                <Pill label={s.status} tone={SUPPLIER_TONE[s.status]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
