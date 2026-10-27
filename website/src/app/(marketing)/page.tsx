import Link from "next/link";
import { services } from "@/data/services";
import { HomeSearchWidget } from "@/components/HomeSearchWidget";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-navy px-8 md:px-16 pt-16 md:pt-20 pb-24 md:pb-28 overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-4"
          style={{
            backgroundColor: "#12305F",
            backgroundImage:
              "linear-gradient(45deg,#F4B000 25%,transparent 25%),linear-gradient(-45deg,#F4B000 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#F4B000 75%),linear-gradient(-45deg,transparent 75%,#F4B000 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          }}
        />
        <div className="max-w-[760px] mx-auto text-center">
          <div className="inline-block bg-navy-2 px-3.5 py-1.5 rounded-full mb-5">
            <span className="text-acc text-xs font-extrabold tracking-wide">
              NOW SERVING NEW YORK CITY
            </span>
          </div>
          <h1 className="font-display text-[40px] md:text-[52px] leading-[1.1] font-extrabold text-white mb-4">
            Mobility,
            <br />
            on your terms.
          </h1>
          <p className="text-[17px] text-muted-on-dark max-w-[560px] mx-auto leading-relaxed">
            Ride Now, airport transfers, hourly &amp; luxury chauffeurs, and
            car rentals — compared across trusted suppliers and booked in one
            app. Search rates instantly, no account required.
          </p>
        </div>
      </section>

      {/* SIXT-STYLE SEARCH BOX */}
      <HomeSearchWidget />

      <div className="text-center mt-8 mb-4">
        <Link
          href="#download"
          className="text-sm font-bold text-info hover:underline"
        >
          Prefer the app? Download the app →
        </Link>
      </div>

      {/* SERVICES GRID */}
      <section id="how-it-works" className="px-8 md:px-16 py-16 md:py-20 flex flex-col gap-9">
        <div className="text-center max-w-[640px] mx-auto">
          <div className="text-[13px] font-extrabold text-acc tracking-wide mb-2.5">
            ONE APP, FIVE WAYS TO MOVE
          </div>
          <h2 className="font-display text-[34px] font-extrabold text-navy">
            Every kind of trip, covered.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {services.map((s) => (
            <div
              key={s.slug}
              className="bg-ground border border-line rounded-[18px] p-7 flex flex-col gap-3"
            >
              <div
                className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-xl"
                style={{ background: s.iconBg }}
              >
                {s.icon}
              </div>
              <div className="text-[15.5px] font-extrabold text-navy">
                {s.name}
              </div>
              <div className="text-[12.5px] text-muted leading-relaxed">
                {s.shortDesc}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/services" className="text-sm font-extrabold text-info">
            See all services →
          </Link>
        </div>
      </section>

      {/* WHY RIDEAN */}
      <section className="bg-ground px-8 md:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <WhyCard icon="⚡" title="Best-price comparison" desc="We compare live prices across trusted suppliers so you never overpay." />
        <WhyCard icon="🛡️" title="Vetted drivers & fleets" desc="Every chauffeur and rental partner is background-checked and rated." />
        <WhyCard icon="💳" title="One wallet, every ride" desc="Ridean Credits and saved cards work across every service, every time." />
      </section>

      {/* DOWNLOAD CTA */}
      <section
        id="download"
        className="bg-navy px-8 md:px-16 py-14 flex items-center justify-between gap-6 flex-wrap"
      >
        <div className="max-w-[480px]">
          <div className="text-2xl font-extrabold text-white mb-2">
            Get Ridean on your phone
          </div>
          <div className="text-sm text-muted-on-dark">
            Book, track and manage every trip from iOS or Android.
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-navy-2 text-white font-bold text-[13.5px] px-5 py-3.5 rounded-xl flex items-center gap-2">
            🍎 App Store
          </div>
          <div className="bg-navy-2 text-white font-bold text-[13.5px] px-5 py-3.5 rounded-xl flex items-center gap-2">
            ▶ Google Play
          </div>
        </div>
      </section>
    </>
  );
}

function WhyCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[26px]">{icon}</div>
      <div className="text-base font-extrabold text-navy">{title}</div>
      <div className="text-[13px] text-muted leading-relaxed">{desc}</div>
    </div>
  );
}
