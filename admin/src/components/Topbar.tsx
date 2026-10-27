import { BellIcon, SearchIcon } from "./icons";
import { admin } from "@/data/mock";

export default function Topbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="h-[72px] min-h-[72px] bg-surface border-b border-line flex items-center justify-between px-8">
      <div>
        <div className="font-display text-[22px] font-bold text-navy">{title}</div>
        <div className="text-[12.5px] text-muted">{subtitle}</div>
      </div>
      <div className="flex items-center gap-4">
        {action}
        <div className="hidden lg:flex items-center gap-2 bg-ground border border-line rounded-[14px] px-3.5 py-2.5 w-60">
          <SearchIcon className="w-[18px] h-[18px] text-muted" />
          <span className="text-[13px] text-muted">Search…</span>
        </div>
        <button
          aria-label="Notifications"
          className="w-11 h-11 rounded-full bg-surface border border-line flex items-center justify-center text-navy"
        >
          <BellIcon className="w-[18px] h-[18px]" />
        </button>
        <div className="font-display w-[34px] h-[34px] rounded-full bg-navy flex items-center justify-center text-acc font-bold text-[13px]">
          {admin.initials}
        </div>
      </div>
    </div>
  );
}
