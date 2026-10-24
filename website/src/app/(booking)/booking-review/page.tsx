import { Suspense } from "react";
import BookingReviewClient from "./BookingReviewClient";

export default function BookingReviewPage() {
  return (
    <Suspense fallback={null}>
      <BookingReviewClient />
    </Suspense>
  );
}
