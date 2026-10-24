"use client";

import { useState } from "react";
import { HeroHeader } from "@/components/HeroHeader";

const EMPLOYEES = [
  { name: "Mariam Islam", email: "mariam@bestmyflight.com" },
  { name: "Tanvir Ahmed", email: "tanvir@bestmyflight.com" },
];

export default function BusinessAccount() {
  const [company, setCompany] = useState("Best My Flight Inc.");
  const [bizEmail, setBizEmail] = useState("travel@bestmyflight.com");
  const [expenseReporting, setExpenseReporting] = useState(true);

  return (
    <>
      <HeroHeader title="Business account" />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-4">
        <Field label="Company name" value={company} onChange={setCompany} />
        <Field label="Business email" value={bizEmail} onChange={setBizEmail} />

        <div className="flex items-center justify-between border border-line rounded-[14px] p-3.5">
          <div>
            <div className="text-[13.5px] font-bold text-navy">Expense reporting</div>
            <div className="text-[11.5px] text-muted">Monthly receipts emailed to finance</div>
          </div>
          <button
            onClick={() => setExpenseReporting((v) => !v)}
            className={`w-[42px] h-6 rounded-full relative transition-colors ${
              expenseReporting ? "bg-acc" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-surface transition-all ${
                expenseReporting ? "left-[21px]" : "left-[3px]"
              }`}
            />
          </button>
        </div>

        <div className="text-[11px] font-bold text-muted uppercase tracking-wide mt-2">Linked employees</div>
        {EMPLOYEES.map((e) => (
          <div key={e.email} className="flex items-center gap-3 border border-line rounded-[14px] p-3.5">
            <div className="w-9 h-9 rounded-full bg-navy-2 flex items-center justify-center text-sm font-extrabold text-white">
              {e.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-navy">{e.name}</div>
              <div className="text-[11px] text-muted">{e.email}</div>
            </div>
          </div>
        ))}

        <button className="border border-dashed border-line rounded-[14px] py-3 text-[13px] font-bold text-navy mt-1">
          + Invite employee
        </button>

        <a href="/profile" className="text-center text-sm font-bold text-navy-3 mt-auto py-3">
          Back to profile
        </a>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-muted uppercase mb-1.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ground border border-line rounded-[10px] px-3.5 py-3 text-sm font-semibold text-navy outline-none focus:border-navy-3"
      />
    </div>
  );
}
