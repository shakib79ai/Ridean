import Topbar from "@/components/Topbar";
import FaqList from "@/components/FaqList";
import { ChatIcon, DocIcon } from "@/components/icons";
import { adminFaqs } from "@/data/mock";

export default function AdminHelpPage() {
  return (
    <>
      <Topbar title="Help & Support" subtitle="Answers for the admin panel" />
      <div className="p-7 md:p-8 flex flex-col gap-6 max-w-2xl">
        <section className="bg-surface border border-line rounded-[20px] p-6">
          <div className="text-[15px] font-bold text-navy mb-1">Frequently asked questions</div>
          <div className="text-[12.5px] text-muted mb-2">Common operations tasks, answered</div>
          <FaqList items={adminFaqs} />
        </section>

        <section className="bg-surface border border-line rounded-[20px] overflow-hidden">
          <a href="#" className="flex items-center gap-3.5 px-6 py-4 border-b border-line hover:bg-ground transition-colors">
            <div className="w-9 h-9 rounded-[12px] bg-info-bg flex items-center justify-center">
              <ChatIcon className="w-[18px] h-[18px] text-navy-3" />
            </div>
            <div className="flex-grow">
              <div className="text-[13.5px] font-semibold text-navy">Contact platform support</div>
              <div className="text-[11.5px] text-muted">Live chat with the Ridean platform team</div>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3.5 px-6 py-4 hover:bg-ground transition-colors">
            <div className="w-9 h-9 rounded-[12px] bg-ground flex items-center justify-center">
              <DocIcon className="w-[18px] h-[18px] text-muted" />
            </div>
            <div className="flex-grow">
              <div className="text-[13.5px] font-semibold text-navy">Documentation</div>
              <div className="text-[11.5px] text-muted">Full admin panel guide and API reference</div>
            </div>
          </a>
        </section>
      </div>
    </>
  );
}
