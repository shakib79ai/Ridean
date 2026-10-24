import Link from "next/link";

export default function About() {
  return (
    <>
      <section className="px-8 md:px-16 py-16 max-w-[760px]">
        <div className="text-[13px] font-extrabold text-acc tracking-wide mb-3">
          ABOUT RIDEAN
        </div>
        <h1 className="text-[32px] md:text-[40px] font-extrabold text-navy leading-tight mb-5">
          Built to make every trip the right price, every time.
        </h1>
        <p className="text-[15.5px] text-muted leading-relaxed">
          Ridean is a mobility marketplace from Best My Flight Inc. — the same
          team behind flight search tools millions of travelers trust. We
          started by asking why ground transportation never got the same
          price transparency as flights, and built Ridean to fix that: one
          app that compares rides, transfers, chauffeurs and rentals across
          trusted suppliers, so you always know you&apos;re getting a fair
          deal.
        </p>
      </section>

      <section className="bg-ground px-8 md:px-16 py-14 grid grid-cols-1 sm:grid-cols-3 gap-7">
        <Stat value="5" label="mobility services, one wallet" />
        <Stat value="8+" label="supplier partners compared live" />
        <Stat value="NYC" label="launch market, with more cities ahead" />
      </section>

      <section className="px-8 md:px-16 py-16 flex flex-col gap-7 max-w-[900px]">
        <h2 className="text-[26px] font-extrabold text-navy">
          Our principles
        </h2>
        <Principle
          icon="💛"
          title="Price transparency, always"
          desc="No hidden fees. What you're quoted is what you pay."
        />
        <Principle
          icon="🤝"
          title="Supplier choice, not lock-in"
          desc="We compare and route to the best partner for your trip, not the one that pays us most."
        />
        <Principle
          icon="🛟"
          title="Safety first"
          desc="Every driver, chauffeur and rental partner is vetted before they appear in the app."
        />
      </section>

      <section className="bg-navy px-8 md:px-16 py-14 flex items-center justify-between gap-6 flex-wrap">
        <div className="text-[22px] font-extrabold text-white">
          Want to partner with Ridean?
        </div>
        <Link
          href="/contact"
          className="bg-acc text-navy font-extrabold text-[15px] px-7 py-4 rounded-xl hover:brightness-95 transition"
        >
          Get in touch
        </Link>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface border border-line rounded-[18px] p-7">
      <div className="text-[30px] font-extrabold text-navy">{value}</div>
      <div className="text-[13px] text-muted mt-1">{label}</div>
    </div>
  );
}

function Principle({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-[22px]">{icon}</div>
      <div>
        <div className="text-[15px] font-bold text-navy mb-1">{title}</div>
        <div className="text-[13px] text-muted leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
