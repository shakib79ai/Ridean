'use client';

import { useRouter } from 'next/navigation';
import { ProfileView, RequireAuth } from '@ridean/web-core';

export default function AccountPage() {
  const router = useRouter();
  return (
    <div className="rd-stack">
      <h1 className="app-title">Account</h1>
      <RequireAuth><ProfileView onSignedOut={() => router.push('/')} /></RequireAuth>
    </div>
  );
}
