import { Suspense } from "react";
import BookingReviewClient from "./BookingReviewClient";

export default function BookingReview() {
  return (
    <Suspense fallback={null}>
      <BookingReviewClient />
    </Suspense>
  );
}
