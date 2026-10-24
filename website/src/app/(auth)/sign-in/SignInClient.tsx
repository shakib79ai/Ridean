"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/session";

export default function SignInClient() {
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
            Welcome back to easier mobility.
          </div>
          <div className="text-sm text-muted-on-dark leading-relaxed">
            Sign in to manage bookings, track trips live, and use your Ridean
            Credits across every service.
          </div>
        </div>
        <div className="mt-12 bg-navy-2 rounded-2xl p-4.5 max-w-[380px]">
          <div className="text-[11px] text-muted-on-dark font-bold">
            UPCOMING TRIP
          </div>
          <div className="text-sm text-white font-bold mt-1.5">
            JFK Airport → Manhattan
          </div>
          <div className="text-[11px] text-muted-on-dark mt-1">
            Business · Toyota Camry · 3:40 PM
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-12 md:p-16">
        <div className="w-full max-w-[380px] flex flex-col gap-4.5">
          <div className="text-[27px] font-extrabold text-navy">
            WELCOME BACK
          </div>
          <div className="text-[13.5px] text-muted -mt-2.5">
            {returnTo
              ? "Sign in to finish your booking."
              : "Enter your email to enjoy the best experience."}
          </div>

          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1.5">
              Email
            </div>
            <input
              defaultValue="shakib.ai.engineer@gmail.com"
              className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3.5 text-sm font-semibold text-navy outline-none focus:border-navy-3"
            />
          </div>

          <button
            onClick={handleContinue}
            className="bg-acc text-navy font-extrabold text-[14.5px] py-3.5 rounded-xl hover:brightness-95 transition text-center"
          >
            Continue
          </button>

          <Divider label="or log in with" />

          <div className="flex gap-2.5">
            <SocialBtn label="Apple" onClick={handleContinue} />
            <SocialBtn label="Google" onClick={handleContinue} />
          </div>

          <Divider label="Don't have an account?" />

          <Link
            href={returnTo ? `/create-account?return=${encodeURIComponent(returnTo)}` : "/create-account"}
            className="bg-ground border border-line text-navy font-bold text-sm py-3.5 rounded-xl text-center hover:bg-line/40 transition"
          >
            Create account
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
