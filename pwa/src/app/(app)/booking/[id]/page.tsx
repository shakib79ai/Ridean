import { trips } from "@/data/mock";
import BookingDetailsClient from "./BookingDetailsClient";

export function generateStaticParams() {
  return trips.map((t) => ({ id: t.id }));
}

export default async function BookingDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = trips.find((t) => t.id === id) ?? trips[0];
  return <BookingDetailsClient trip={trip} />;
}
