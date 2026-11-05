import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="rd-container" style={{ padding: '96px 24px', textAlign: 'center' }}>
      <h1 className="rd-display" style={{ fontSize: 48 }}>Page not found</h1>
      <p className="rd-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="rd-btn" style={{ marginTop: 16 }}>Back to home</Link>
    </div>
  );
}
