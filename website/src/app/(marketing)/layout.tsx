import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="max-w-[1440px] mx-auto flex flex-col">
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
