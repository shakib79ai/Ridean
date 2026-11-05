import { Suspense } from 'react';
import { SignInForm } from '@ridean/web-core';

export const metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <div className="rd-stack" style={{ paddingTop: 24 }}>
      <h1 className="app-title">Welcome back</h1>
      <Suspense><SignInForm /></Suspense>
    </div>
  );
}
