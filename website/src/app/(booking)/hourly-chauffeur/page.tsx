import { Suspense } from "react";
import HourlyChauffeurClient from "./HourlyChauffeurClient";

export default function HourlyChauffeurPage() {
  return (
    <Suspense fallback={null}>
      <HourlyChauffeurClient />
    </Suspense>
  );
}
