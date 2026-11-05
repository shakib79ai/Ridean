import { Suspense } from 'react';
import { SignUpForm } from '@ridean/web-core';

export const metadata = { title: 'Create your account' };

export default function SignUpPage() {
  return (
    <div className="rd-container" style={{ maxWidth: 460, padding: '56px 24px' }}>
      <h1 className="rd-display" style={{ fontSize: 40, marginBottom: 20 }}>Create your account</h1>
      <Suspense><SignUpForm defaultNext="/account" /></Suspense>
    </div>
  );
}
