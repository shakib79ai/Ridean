import { Suspense } from "react";
import RideNowClient from "./RideNowClient";

export default function RideNowPage() {
  return (
    <Suspense fallback={null}>
      <RideNowClient />
    </Suspense>
  );
}
