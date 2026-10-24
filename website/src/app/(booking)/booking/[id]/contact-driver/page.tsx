import { trips } from "@/data/booking-mock";
import ContactDriverClient from "./ContactDriverClient";

export function generateStaticParams() {
  return trips.map((t) => ({ id: t.id }));
}

export default async function ContactDriver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = trips.find((t) => t.id === id) ?? trips[0];
  return <ContactDriverClient trip={trip} />;
}
