import { trips } from "@/data/mock";
import EditBookingClient from "./EditBookingClient";

export function generateStaticParams() {
  return trips.map((t) => ({ id: t.id }));
}

export default async function EditBooking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = trips.find((t) => t.id === id) ?? trips[0];
  return <EditBookingClient trip={trip} />;
}
