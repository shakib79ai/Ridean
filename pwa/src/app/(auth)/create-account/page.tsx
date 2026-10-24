"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/Icons";
import { CheckeredFlag } from "@/components/HeroHeader";

const BENEFITS = [
  "Easily manage all your bookings",
  "Faster bookings with saved details",
  "Streamlined pickup with ID verification",
];

export default function CreateAccount() {
  const router = useRouter();

  return (
    <>
      <CheckeredFlag />
      <div className="px-5 py-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center text-white text-lg"
        >
          ‹
        </button>
      </div>

      <div className="flex-1 bg-surface rounded-t-[20px] mt-3 px-6 pt-7 pb-8 flex flex-col gap-4">
        <div className="text-[26px] font-extrabold text-navy">
          CREATE AN ACCOUNT
        </div>

        <div className="flex flex-col gap-2.5 mb-1">
          {BENEFITS.map((b) => (
            <div key={b} className="flex gap-2.5 items-center">
              <div className="w-[20px] h-[20px] rounded-full bg-acc flex items-center justify-center text-navy">
                <CheckIcon className="w-[11px] h-[11px]" />
              </div>
              <span className="text-[12.5px] text-navy">{b}</span>
            </div>
          ))}
        </div>

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
          onClick={() => router.push("/")}
          className="bg-acc text-navy font-extrabold text-[14.5px] py-3.5 rounded-xl"
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
          className="bg-ground border border-line text-navy font-bold text-sm py-3.5 rounded-xl text-center"
        >
          Log in
        </Link>

        <div className="text-[10px] text-muted-on-dark text-center mt-auto leading-relaxed">
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
      <span className="text-[11px] text-muted-on-dark font-semibold">{label}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <button className="flex-1 border border-line rounded-[10px] py-3 text-center text-[13px] font-bold text-navy">
      {label}
    </button>
  );
}
