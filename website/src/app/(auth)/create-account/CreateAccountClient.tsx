"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/session";

const BENEFITS = [
  "Easily manage all your bookings",
  "Faster bookings with saved details",
  "Streamlined pickup with ID verification",
];

export default function CreateAccountClient() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("return");

  function handleContinue() {
    setSession();
    router.push(returnTo ? decodeURIComponent(returnTo) : "/dashboard");
  }

  return (
    <div className="max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 bg-navy flex flex-col justify-center p-12 md:p-16 relative">
        <Link href="/" className="absolute top-8 left-8 md:left-16 flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 240 240" className="shrink-0">
            <rect width="240" height="240" rx="54" fill="#F4B000" />
            <g transform="rotate(-25 120 120)">
              <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" opacity="0.22" transform="translate(16 14)" />
              <polygon points="20,210 230,120 20,30 20,100 170,120 20,140" fill="#0A1F44" />
            </g>
          </svg>
          <span className="text-base font-extrabold text-white">Ridean</span>
        </Link>
        <div className="max-w-[420px] mt-12 md:mt-0">
          <div className="text-[34px] font-extrabold text-white leading-tight mb-4">
            Join Ridean in under a minute.
          </div>
          <div className="text-sm text-muted-on-dark leading-relaxed">
            Create your account to book Ride Now, airport transfers,
            chauffeur services and rentals — all in one place.
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3.5 max-w-[380px]">
          {BENEFITS.map((b) => (
            <div key={b} className="flex gap-2.5 items-center">
              <div className="w-[22px] h-[22px] rounded-full bg-acc flex items-center justify-center text-[12px] text-navy font-extrabold">
                ✓
              </div>
              <span className="text-[13px] text-white">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-12 md:p-16">
        <div className="w-full max-w-[380px] flex flex-col gap-4.5">
          <div className="text-[27px] font-extrabold text-navy">
            CREATE AN ACCOUNT
          </div>
          {returnTo && (
            <div className="text-[13.5px] text-muted -mt-2.5">
              Create an account to finish your booking.
            </div>
          )}

          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1.5">
              Email
            </div>
            <input
              placeholder="you@example.com"
              className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3.5 text-sm text-muted-on-dark outline-none focus:border-navy-3"
            />
          </div>

          <button
            onClick={handleContinue}
            className="bg-acc text-navy font-extrabold text-[14.5px] py-3.5 rounded-xl hover:brightness-95 transition"
          >
            Continue
          </button>

          <Divider label="or continue with" />

          <div className="flex gap-2.5">
            <SocialBtn label="Apple" onClick={handleContinue} />
            <SocialBtn label="Google" onClick={handleContinue} />
          </div>

          <Divider label="Already have an account?" />

          <Link
            href={returnTo ? `/sign-in?return=${encodeURIComponent(returnTo)}` : "/sign-in"}
            className="bg-ground border border-line text-navy font-bold text-sm py-3.5 rounded-xl text-center hover:bg-line/40 transition"
          >
            Log in
          </Link>

          <div className="text-[10.5px] text-muted-on-dark text-center mt-2.5 leading-relaxed">
            See our policies for{" "}
            <a href="#" className="underline">
              privacy
            </a>
            ,{" "}
            <a href="#" className="underline">
              analytics
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              accessibility
            </a>
            . (Imprint)
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-px bg-line" />
      <span className="text-[11px] text-muted-on-dark font-semibold">{label}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

function SocialBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 border border-line rounded-[10px] py-3 text-center text-[13px] font-bold text-navy hover:bg-ground transition"
    >
      {label}
    </button>
  );
}
