"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { user } from "@/data/mock";
import { LogoMark } from "@/components/Logo";
import { DiagonalFlag } from "@/components/HeroHeader";

export default function SignIn() {
  const router = useRouter();

  return (
    <>
      <div className="bg-navy pt-10 px-5 pb-9 flex flex-col gap-3.5 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 left-0 right-0">
          <DiagonalFlag />
        </div>
        <div className="flex items-center gap-2.5">
          <LogoMark size={36} />
          <span
            className="text-[26px] font-extrabold text-white tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ride<span className="text-acc">an</span>
          </span>
        </div>
        <div
          className="text-[34px] leading-[40px] font-bold text-white tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ride, fly,
          <br />
          arrive.
        </div>
        <div className="text-[15px] text-muted-on-dark">
          Sign in to manage your rides, transfers and rentals in one app.
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-3.5">
        <div className="bg-surface border border-line rounded-[24px] shadow-sm px-5 py-5 flex flex-col gap-3.5">
          <div
            className="text-[22px] leading-[30px] font-bold text-navy"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign in
          </div>

          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1.5">Email</div>
            <input
              defaultValue={user.email}
              className="w-full bg-surface border border-line rounded-[16px] px-4 py-3.5 text-sm font-semibold text-navy outline-none focus:border-navy-3"
            />
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-acc text-navy font-bold text-[16px] py-3.5 rounded-2xl shadow-[0_6px_16px_rgba(244,176,0,0.38)]"
          >
            Continue
          </button>

          <Divider label="or" />
          <SocialBtn label="Continue with Apple" />
          <SocialBtn label="Continue with Google" />

          <Divider label="New to Ridean?" />
          <Link
            href="/create-account"
            className="border border-navy text-navy font-bold text-[16px] py-3.5 rounded-2xl text-center"
          >
            Create account
          </Link>

          <div className="text-[12px] text-muted text-center leading-relaxed">
            By continuing you agree to the Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-px bg-line" />
      <span className="text-[13px] text-muted font-medium">{label}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <button className="w-full border border-navy rounded-2xl py-3.5 text-center text-[16px] font-bold text-navy">
      {label}
    </button>
  );
}
