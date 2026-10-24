import { Suspense } from "react";
import CreateAccountClient from "./CreateAccountClient";

export default function CreateAccountPage() {
  return (
    <Suspense fallback={null}>
      <CreateAccountClient />
    </Suspense>
  );
}
