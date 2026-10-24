import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="max-w-[480px] mx-auto min-h-screen flex flex-col bg-surface">
      <div className="flex-1 flex flex-col">{children}</div>
      <BottomNav />
    </div>
  );
}
