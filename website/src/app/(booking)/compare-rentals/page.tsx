import { Suspense } from "react";
import CompareRentalsClient from "./CompareRentalsClient";

export default function CompareRentalsPage() {
  return (
    <Suspense fallback={null}>
      <CompareRentalsClient />
    </Suspense>
  );
}
