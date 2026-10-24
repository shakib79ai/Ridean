import BookingTopNav from "@/components/BookingTopNav";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1440px] mx-auto min-h-screen bg-ground flex flex-col">
      <BookingTopNav />
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-8 py-10">{children}</div>
    </div>
  );
}
