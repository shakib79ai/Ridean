import { Checkout } from '@ridean/web-core';
import { BackButton } from '@/components/BackButton';

export const metadata = { title: 'Review and pay' };

export default async function CheckoutPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  return (
    <div className="rd-stack">
      <BackButton />
      <h1 className="app-title">Review and pay</h1>
      <Checkout quoteId={quoteId} />
    </div>
  );
}
