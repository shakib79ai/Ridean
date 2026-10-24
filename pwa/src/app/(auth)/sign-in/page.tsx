"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { user } from "@/data/mock";
import { CloseIcon } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";

export default function SignIn() {
  const router = useRouter();

  return (
    <>
      <div className="px-5 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center text-white text-[15px]"
        >
          <CloseIcon className="w-[14px] h-[14px]" />
        </Link>
        <div className="bg-navy-2 px-3.5 py-1.5 rounded-full">
          <span className="text-white text-[11.5px] font-bold">Settings</span>
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-t-[20px] mt-3.5 px-6 pt-7 pb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <span className="text-[15px] font-extrabold text-navy">Ridean</span>
          </div>
          <div className="text-[11px] text-muted font-medium">Mobility, on your terms.</div>
        </div>
        <div className="text-[26px] font-extrabold text-navy">
          WELCOME BACK
        </div>
        <div className="text-[13px] text-muted -mt-2.5">
          Enter your email to enjoy the best experience.
        </div>

        <div>
          <div className="text-[11px] font-bold text-muted uppercase mb-1.5">
            Email
          </div>
          <input
            defaultValue={user.email}
            className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3.5 text-sm font-semibold text-navy outline-none focus:border-navy-3"
          />
        </div>

        <button
          onClick={() => router.push("/")}
          className="bg-acc text-navy font-extrabold text-[14.5px] py-3.5 rounded-xl"
        >
          Continue
        </button>

        <Divider label="or log in with" />
        <div className="flex gap-2.5">
          <SocialBtn label="Apple" />
          <SocialBtn label="Google" />
        </div>

        <Divider label="Don't have an account?" />
        <Link
          href="/create-account"
          className="bg-ground border border-line text-navy font-bold text-sm py-3.5 rounded-xl text-center"
        >
          Create account
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
