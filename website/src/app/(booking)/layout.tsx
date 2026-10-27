import BookingSidebar from "@/components/BookingSidebar";
import BookingHeader from "@/components/BookingHeader";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1440px] mx-auto min-h-screen bg-ground flex">
      <BookingSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <BookingHeader />
        <main className="flex-1 w-full px-8 py-8 flex flex-col gap-6">
          <div className="max-w-[1100px] w-full flex flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
