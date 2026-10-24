import { invoices } from "@/data/mock";
import InvoiceDetailClient from "./InvoiceDetailClient";

export function generateStaticParams() {
  return invoices.map((inv) => ({ id: inv.id }));
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = invoices.find((inv) => inv.id === id) ?? invoices[0];
  return <InvoiceDetailClient invoice={invoice} />;
}
