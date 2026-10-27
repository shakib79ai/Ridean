import { HeroHeader } from "@/components/HeroHeader";

const FAQS = [
  { q: "How do I change or cancel a trip?", a: "Open Trips, select the booking, then tap Cancel booking or Edit booking. Cancelling within 1 hour of pickup may include a small fee." },
  { q: "What happens if my flight is delayed?", a: "We track your flight automatically for airport transfers and adjust your pickup time at no extra charge." },
  { q: "How are rental cars insured?", a: "All rentals booked through Ridean include standard collision coverage; optional add-ons are available at checkout." },
  { q: "How do refunds work?", a: "Refunds for cancelled or disputed trips are returned to your original payment method within 3–5 business days." },
  { q: "Setting up a business account", a: "Add a company card and invite teammates from Business account in your profile to start expensing rides." },
];

const QUICK_ACTIONS = [
  { icon: "📞", label: "Call support" },
  { icon: "📧", label: "Email us" },
  { icon: "🧾", label: "Trip issue" },
];

export default function HelpSupport() {
  return (
    <>
      <HeroHeader title="Support" />
      <div className="flex-1 bg-ground px-5 pt-5 pb-6 flex flex-col gap-2.5">
        <button className="flex items-center gap-3 bg-navy rounded-[18px] p-[17px] text-left">
          <div className="w-[46px] h-[46px] rounded-full bg-acc flex items-center justify-center text-xl flex-shrink-0">
            💬
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-extrabold text-white">Chat with us</div>
            <div className="text-xs font-semibold text-muted-on-dark mt-0.5">
              Avg. reply time under 2 minutes
            </div>
          </div>
          <span className="text-muted-on-dark text-lg">›</span>
        </button>

        <div className="flex gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              className="flex-1 bg-[#F3F8FD] border border-line rounded-[14px] py-3.5 flex flex-col items-center gap-1.5"
            >
              <span className="text-[19px]">{a.icon}</span>
              <span className="text-xs font-bold text-navy text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[13px] font-extrabold text-navy mt-2 mb-0.5">
          Frequently asked
        </div>
        {FAQS.map((f) => (
          <details key={f.q} className="border border-line rounded-[14px] p-3.5 group">
            <summary className="text-[13.5px] font-bold text-navy cursor-pointer list-none flex items-center justify-between gap-2">
              {f.q}
              <span className="text-muted text-base flex-shrink-0 group-open:hidden">+</span>
              <span className="text-muted text-base flex-shrink-0 hidden group-open:inline">–</span>
            </summary>
            <div className="text-xs text-muted mt-2 leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </>
  );
}
