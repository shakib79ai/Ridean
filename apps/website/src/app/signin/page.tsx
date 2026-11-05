import { Suspense } from 'react';
import { SignInForm } from '@ridean/web-core';

export const metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <div className="rd-container" style={{ maxWidth: 460, padding: '56px 24px' }}>
      <h1 className="rd-display" style={{ fontSize: 40, marginBottom: 20 }}>Welcome back</h1>
      <Suspense><SignInForm defaultNext="/account" /></Suspense>
    </div>
  );
}
