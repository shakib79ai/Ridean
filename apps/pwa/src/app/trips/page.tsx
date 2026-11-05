import { TripsList, RequireAuth } from '@ridean/web-core';

export const metadata = { title: 'Your trips' };

export default function Page() {
  return (
    <div className="rd-stack">
      <h1 className="app-title">Your trips</h1>
      <RequireAuth><TripsList /></RequireAuth>
    </div>
  );
}
