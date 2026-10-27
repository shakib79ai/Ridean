import Topbar from "@/components/Topbar";
import Pill from "@/components/Pill";
import { platformUsers } from "@/data/mock";

const STATS = [
  { label: "Total users", value: "18,204" },
  { label: "New this week", value: "412" },
  { label: "Ridean+ subscribers", value: "2,890" },
];

const STATUS_TONE: Record<string, "ok" | "warn" | "bad"> = {
  Active: "ok",
  "Ridean+": "warn",
  Flagged: "bad",
};

export default function UsersPage() {
  return (
    <>
      <Topbar title="Users" subtitle="18,204 registered riders" />
      <div className="p-7 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
          {STATS.map((s) => (
            <div key={s.label} className="bg-surface border border-line rounded-[20px] p-5">
              <div className="text-xs text-muted font-semibold">{s.label}</div>
              <div className="font-display text-[26px] font-extrabold text-navy mt-1.5">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-line rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["User", "Email", "Joined", "Trips", "Wallet balance", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-[11.5px] tracking-wide uppercase text-muted font-bold px-3.5 py-2.5 border-b border-line whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platformUsers.map((u, i) => (
                  <tr key={u.email}>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < platformUsers.length - 1 ? "border-b border-line" : ""}`}>{u.name}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < platformUsers.length - 1 ? "border-b border-line" : ""}`}>{u.email}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < platformUsers.length - 1 ? "border-b border-line" : ""}`}>{u.joined}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < platformUsers.length - 1 ? "border-b border-line" : ""}`}>{u.trips}</td>
                    <td className={`text-[13.5px] text-navy px-3.5 py-3.5 whitespace-nowrap ${i < platformUsers.length - 1 ? "border-b border-line" : ""}`}>${u.walletBalance.toFixed(2)}</td>
                    <td className={`px-3.5 py-3.5 ${i < platformUsers.length - 1 ? "border-b border-line" : ""}`}>
                      <Pill label={u.status} tone={STATUS_TONE[u.status]} />
                    </td>
                    <td className={`text-[13.5px] px-3.5 py-3.5 whitespace-nowrap ${i < platformUsers.length - 1 ? "border-b border-line" : ""}`}>
                      <a href="#" className="text-navy-3 font-semibold">
                        {u.status === "Flagged" ? "Review" : "Manage"}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
