import { Suspense } from "react";
import TripStatusClient from "./TripStatusClient";

export default function TripStatus() {
  return (
    <Suspense fallback={null}>
      <TripStatusClient />
    </Suspense>
  );
}
