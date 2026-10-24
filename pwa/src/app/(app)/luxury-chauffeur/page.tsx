import { Suspense } from "react";
import LuxuryChauffeurClient from "./LuxuryChauffeurClient";

export default function LuxuryChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <LuxuryChauffeurClient />
    </Suspense>
  );
}
