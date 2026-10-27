import Link from "next/link";
import { services } from "@/data/services";

export default function Services() {
  return (
    <>
      <section className="bg-navy px-8 md:px-16 py-14">
        <div className="text-[13px] font-extrabold text-acc tracking-wide mb-2.5">
          SERVICES
        </div>
        <h1 className="text-[38px] font-extrabold text-white">
          Five ways to move, one app.
        </h1>
      </section>

      <section className="px-8 md:px-16 py-14 flex flex-col gap-7">
        {services.map((s) => (
          <div
            key={s.slug}
            className="flex flex-col sm:flex-row gap-6 sm:items-center bg-ground border border-line rounded-[22px] p-9"
          >
            <div
              className="w-[84px] h-[84px] rounded-[20px] flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: s.iconBg }}
            >
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="text-xl font-extrabold text-navy mb-1.5">{s.name}</div>
              <div className="text-[13.5px] text-muted leading-relaxed max-w-[640px]">
                {s.longDesc}
              </div>
            </div>
            <div className="text-right flex-shrink-0 sm:text-right">
              <div className="text-xs text-muted-on-dark font-bold">FROM</div>
              <div className="font-display text-[22px] font-extrabold text-navy">
                {s.fromPrice}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-navy px-8 md:px-16 py-14 flex items-center justify-between gap-6 flex-wrap">
        <div className="text-[22px] font-extrabold text-white">
          Ready to go somewhere?
        </div>
        <Link
          href="/create-account"
          className="bg-acc text-navy font-extrabold text-[15px] px-7 py-4 rounded-xl hover:brightness-95 transition"
        >
          Create an account
        </Link>
      </section>
    </>
  );
}
