export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-navy flex flex-col">
      {children}
    </div>
  );
}
