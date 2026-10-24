import { Suspense } from "react";
import AirportTransferClient from "./AirportTransferClient";

export default function AirportTransferPage() {
  return (
    <Suspense fallback={null}>
      <AirportTransferClient />
    </Suspense>
  );
}
