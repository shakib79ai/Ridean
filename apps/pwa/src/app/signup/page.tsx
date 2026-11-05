import { Suspense } from 'react';
import { SignUpForm } from '@ridean/web-core';

export const metadata = { title: 'Create account' };

export default function SignUpPage() {
  return (
    <div className="rd-stack" style={{ paddingTop: 24 }}>
      <h1 className="app-title">Create your account</h1>
      <Suspense><SignUpForm /></Suspense>
    </div>
  );
}
