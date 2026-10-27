import Topbar from "@/components/Topbar";
import { PencilIcon } from "@/components/icons";
import { admin } from "@/data/mock";

const FIELDS = [
  { label: "Full name", value: admin.name },
  { label: "Email", value: admin.email },
  { label: "Phone", value: admin.phone },
];

export default function AdminProfilePage() {
  return (
    <>
      <Topbar
        title="Edit Profile"
        subtitle="Your admin account details"
        action={
          <div className="h-9 flex items-center px-4 rounded-[12px] bg-acc text-[12.5px] text-navy font-bold shadow-[0_6px_16px_rgba(244,176,0,.38)]">
            Save changes
          </div>
        }
      />
      <div className="p-7 md:p-8 flex flex-col gap-6 max-w-2xl">
        <section className="bg-surface border border-line rounded-[20px] p-6 flex items-center gap-5">
          <div className="relative">
            <div className="font-display w-20 h-20 rounded-full bg-navy flex items-center justify-center text-acc font-extrabold text-2xl">
              {admin.initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-acc border-2 border-surface flex items-center justify-center">
              <PencilIcon className="w-[14px] h-[14px] text-navy" />
            </div>
          </div>
          <div>
            <div className="text-[15px] font-bold text-navy">{admin.name}</div>
            <div className="text-[12.5px] text-muted">{admin.role}</div>
          </div>
        </section>

        <section className="bg-surface border border-line rounded-[20px] p-6">
          <div className="text-[15px] font-bold text-navy mb-4.5">Account details</div>
          <div className="flex flex-col gap-4.5">
            {FIELDS.map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-muted">{f.label}</div>
                <div className="h-10 border border-line rounded-[12px] flex items-center px-3 text-[13px] text-navy bg-surface">
                  {f.value}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-bold text-muted">Role</div>
              <div className="h-10 border border-line rounded-[12px] flex items-center px-3 text-[13px] text-muted bg-ground">
                {admin.role} (set by workspace owner)
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
