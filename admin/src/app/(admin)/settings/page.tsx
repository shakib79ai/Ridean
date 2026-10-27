import Topbar from "@/components/Topbar";
import Pill from "@/components/Pill";
import Toggle from "@/components/Toggle";
import { team } from "@/data/mock";

const GENERAL = [
  { label: "Platform name", value: "Ridean" },
  { label: "Operating company", value: "Best My Flight Inc." },
  { label: "Support email", value: "support@ridean.com" },
  { label: "Launch market", value: "New York City, NY" },
];

const PRICING = [
  { label: "Base fare", value: "$3.50" },
  { label: "Per-mile rate", value: "$1.85" },
  { label: "Per-minute rate", value: "$0.28" },
  { label: "Platform commission", value: "16%" },
  { label: "Ridean+ monthly fee", value: "$9.99" },
  { label: "Cancellation fee", value: "$5.00" },
];

const NOTIFICATIONS = [
  { title: "New supplier disputes", sub: "Email + in-app alert", on: true },
  { title: "Driver document expirations", sub: "14 days before expiry", on: true },
  { title: "Weekly settlement summary", sub: "Every Friday, 9:00 AM", on: true },
  { title: "Low driver availability", sub: "When active drivers fall below 20", on: false },
];

const ROLE_TONE: Record<string, "info" | "warn" | "neutral"> = {
  Owner: "info",
  "Engineering admin": "warn",
  "Support agent": "neutral",
};

export default function SettingsPage() {
  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Platform configuration"
        action={
          <div className="h-9 flex items-center px-4 rounded-[12px] bg-acc text-[12.5px] text-navy font-bold shadow-[0_6px_16px_rgba(244,176,0,.38)]">
            Save changes
          </div>
        }
      />
      <div className="p-7 md:p-8 flex flex-col gap-6">

        <section className="bg-surface border border-line rounded-[20px] p-6">
          <div className="text-[15px] font-bold text-navy">General</div>
          <div className="text-[12.5px] text-muted mb-4.5">Core platform identity and support contact</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            {GENERAL.map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-muted">{f.label}</div>
                <div className="h-10 border border-line rounded-[12px] flex items-center px-3 text-[13px] text-navy bg-surface">{f.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-[20px] p-6">
          <div className="text-[15px] font-bold text-navy">Pricing &amp; commission</div>
          <div className="text-[12.5px] text-muted mb-4.5">
            Default platform rates — supplier-specific rates are set under Drivers &amp; Suppliers
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
            {PRICING.map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-muted">{f.label}</div>
                <div className="h-10 border border-line rounded-[12px] flex items-center px-3 text-[13px] text-navy bg-surface">{f.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-[20px] p-6">
          <div className="text-[15px] font-bold text-navy">Notifications</div>
          <div className="text-[12.5px] text-muted mb-4.5">What triggers an alert to the admin team</div>
          <div className="flex flex-col gap-3.5">
            {NOTIFICATIONS.map((n) => (
              <div key={n.title} className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold text-navy">{n.title}</div>
                  <div className="text-[11.5px] text-muted">{n.sub}</div>
                </div>
                <Toggle defaultOn={n.on} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-4.5">
            <div>
              <div className="text-[15px] font-bold text-navy">Team &amp; roles</div>
              <div className="text-[12.5px] text-muted">Admin users with access to this panel</div>
            </div>
            <div className="h-[34px] flex items-center px-3.5 border border-line rounded-[12px] text-xs text-navy font-bold">
              + Invite teammate
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {team.map((m, i) => (
              <div key={m.email} className={`flex items-center gap-3 py-2.5 ${i < team.length - 1 ? "border-b border-line" : ""}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ background: m.color }}
                >
                  {m.initials}
                </div>
                <div className="flex-grow">
                  <div className="text-[13px] font-semibold text-navy">
                    {m.name} · {m.email}
                  </div>
                </div>
                <Pill label={m.role} tone={ROLE_TONE[m.role]} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-bad-bg border border-[#F2C6C6] rounded-[20px] p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[14.5px] font-bold text-navy">Danger zone</div>
            <div className="text-[12.5px] text-muted mt-0.5">
              Pause new bookings platform-wide — existing trips are unaffected
            </div>
          </div>
          <div className="h-9 flex items-center px-4 rounded-[12px] bg-bad text-[12.5px] text-white font-bold">
            Pause bookings
          </div>
        </section>

      </div>
    </>
  );
}
