import { Checkout } from '@ridean/web-core';

export const metadata = { title: 'Review and pay' };

export default async function CheckoutPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  return (
    <div className="rd-container" style={{ maxWidth: 1080 }}>
      <div className="page-head"><h1 className="rd-display">Review and pay</h1></div>
      <Checkout quoteId={quoteId} />
    </div>
  );
}
