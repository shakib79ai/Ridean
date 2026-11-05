'use client';

import { useToast } from '@/components/site/ui';

export const SUPPORT_EMAIL = 'support@ridean.com';

/** Selectable support address with a copy button (the PWA has no contact form, and mailto: isn't reliable in installed apps). */
export function CopyEmail({ email = SUPPORT_EMAIL, size = 12.5 }: { email?: string; size?: number }) {
  const toast = useToast();
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      toast('Email address copied');
    } catch {
      toast('Couldn’t copy — select the address instead');
    }
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', maxWidth: '100%', flexWrap: 'wrap' }}>
      <span style={{ fontSize: size, color: '#F3EEDF', userSelect: 'all', WebkitUserSelect: 'all', overflowWrap: 'anywhere' }}>{email}</span>
      <button type="button" onClick={copy} aria-label={`Copy ${email}`} className="dz-btn-reset" style={{ fontSize: '12px', fontWeight: 600, color: '#D9A94F', padding: '2px 8px', borderRadius: '999px', border: '1px solid #1F4537' }}>
        Copy
      </button>
    </span>
  );
}
