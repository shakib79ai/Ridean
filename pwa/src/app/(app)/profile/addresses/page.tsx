import { HeroHeader } from "@/components/HeroHeader";
import { HomeIcon, BusinessIcon, PinIcon, PencilIcon, CloseIcon } from "@/components/Icons";

const ADDRESSES = [
  { label: "Home", icon: HomeIcon, address: "432 Park Ave, Manhattan, NY 10022" },
  { label: "Work", icon: BusinessIcon, address: "1 World Trade Center, New York, NY 10007" },
  { label: "Gym", icon: PinIcon, address: "250 Bowery, New York, NY 10012" },
];

export default function SavedAddresses() {
  return (
    <>
      <HeroHeader title="Saved addresses" />
      <div className="flex-1 bg-ground px-5 pt-5 pb-6 flex flex-col gap-2.5">
        {ADDRESSES.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.label} className="flex items-center gap-3 border border-line rounded-[14px] p-3.5">
              <div className="w-9 h-9 rounded-[10px] bg-ground flex items-center justify-center flex-shrink-0">
                <Icon className="w-[16px] h-[16px] text-navy" />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-navy">{a.label}</div>
                <div className="text-[11.5px] text-muted">{a.address}</div>
              </div>
              <button aria-label="Edit" className="text-muted px-1">
                <PencilIcon className="w-[14px] h-[14px]" />
              </button>
              <button aria-label="Delete" className="text-bad px-1">
                <CloseIcon className="w-[14px] h-[14px]" />
              </button>
            </div>
          );
        })}

        <button className="border border-dashed border-line rounded-[14px] py-3 text-[13px] font-bold text-navy mt-1">
          + Add address
        </button>

        <a href="/profile" className="text-center text-sm font-bold text-navy-3 mt-auto py-3">
          Back to profile
        </a>
      </div>
    </>
  );
}
