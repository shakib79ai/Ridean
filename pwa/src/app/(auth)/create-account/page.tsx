"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/Icons";
import { HeroHeader } from "@/components/HeroHeader";

const BENEFITS = [
  "Easily manage all your bookings",
  "Faster bookings with saved details",
  "Streamlined pickup with ID verification",
];

export default function CreateAccount() {
  const router = useRouter();

  return (
    <>
      <HeroHeader title="Create account" />
      <div className="flex-1 bg-ground px-5 pt-1 pb-6 flex flex-col gap-4">
        <div
          className="text-[26px] font-bold text-navy"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Create an account
        </div>

        <div className="flex flex-col gap-2.5 mb-1">
          {BENEFITS.map((b) => (
            <div key={b} className="flex gap-2.5 items-center">
              <div className="w-[20px] h-[20px] rounded-full bg-acc flex items-center justify-center text-navy flex-shrink-0">
                <CheckIcon className="w-[11px] h-[11px]" />
              </div>
              <span className="text-[13.5px] text-navy">{b}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="text-[11px] font-bold text-muted uppercase mb-1.5">
            Email
          </div>
          <input
            placeholder="you@example.com"
            className="w-full bg-surface border border-line rounded-[16px] px-4 py-3.5 text-sm text-placeholder outline-none focus:border-navy-3"
          />
        </div>

        <button
          onClick={() => router.push("/")}
          className="bg-acc text-navy font-bold text-[16px] py-3.5 rounded-2xl shadow-[0_6px_16px_rgba(244,176,0,0.38)]"
        >
          Continue
        </button>

        <Divider label="or continue with" />
        <div className="flex gap-2.5">
          <SocialBtn label="Apple" />
          <SocialBtn label="Google" />
        </div>

        <Divider label="Already have an account?" />
        <Link
          href="/sign-in"
          className="border border-navy text-navy font-bold text-[16px] py-3.5 rounded-2xl text-center"
        >
          Log in
        </Link>

        <div className="text-[11px] text-muted text-center leading-relaxed">
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
          .
        </div>
      </div>
    </>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-px bg-line" />
      <span className="text-[12.5px] text-muted font-medium">{label}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <button className="flex-1 border border-navy rounded-2xl py-3 text-center text-[13.5px] font-bold text-navy">
      {label}
    </button>
  );
}
