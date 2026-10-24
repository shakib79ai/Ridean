"use client";

import { useState } from "react";
import Link from "next/link";
import { businessAccount, businessEmployees } from "@/data/booking-mock";

export default function BusinessAccount() {
  const [expenseReporting, setExpenseReporting] = useState(businessAccount.expenseReporting);

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <Link href="/profile" className="text-sm font-bold text-navy-3">← Profile</Link>
      <div className="text-[22px] font-extrabold text-navy">Business account</div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Company name</span>
          <input defaultValue={businessAccount.companyName} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase">Business email</span>
          <input defaultValue={businessAccount.businessEmail} className="border border-line rounded-xl px-4 py-3 text-sm text-navy font-semibold focus:outline-none focus:border-navy-3" />
        </label>
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-sm font-bold text-navy">Expense reporting</div>
            <div className="text-xs text-muted">Generate monthly ride expense reports</div>
          </div>
          <button
            onClick={() => setExpenseReporting((v) => !v)}
            className={`w-12 h-7 rounded-full relative transition ${expenseReporting ? "bg-acc" : "bg-line"}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${expenseReporting ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-navy">Linked employees</div>
          <button className="text-xs font-extrabold text-navy bg-acc px-3 py-2 rounded-lg">Invite employee</button>
        </div>
        {businessEmployees.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-2 border-b border-line last:border-b-0">
            <div>
              <div className="text-sm font-semibold text-navy">{e.name}</div>
              <div className="text-xs text-muted">{e.email}</div>
            </div>
            <span className="text-xs font-bold text-muted">{e.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
