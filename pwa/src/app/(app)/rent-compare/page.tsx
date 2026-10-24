import { Suspense } from "react";
import RentCompareClient from "./RentCompareClient";

export default function RentComparePage() {
  return (
    <Suspense fallback={null}>
      <RentCompareClient />
    </Suspense>
  );
}
