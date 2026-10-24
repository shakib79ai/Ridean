import { Suspense } from "react";
import PaymentClient from "./PaymentClient";

export default function Payment() {
  return (
    <Suspense fallback={null}>
      <PaymentClient />
    </Suspense>
  );
}
