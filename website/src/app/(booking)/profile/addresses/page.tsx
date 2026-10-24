import Link from "next/link";
import { savedAddresses } from "@/data/booking-mock";

export default function SavedAddresses() {
  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <Link href="/profile" className="text-sm font-bold text-navy-3">← Profile</Link>
      <div className="text-[22px] font-extrabold text-navy">Saved addresses</div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {savedAddresses.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-4 border-b border-line last:border-b-0">
            <div>
              <div className="text-sm font-bold text-navy">{a.label}</div>
              <div className="text-xs text-muted">{a.address}</div>
            </div>
            <div className="flex gap-3">
              <button className="text-xs font-bold text-navy-3">Edit</button>
              <button className="text-xs font-bold text-bad">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button className="self-start bg-acc text-navy font-extrabold text-sm px-6 py-3 rounded-xl hover:brightness-105 transition">
        Add address
      </button>
    </div>
  );
}
