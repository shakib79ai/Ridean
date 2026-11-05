export const metadata = { title: 'Offline' };

export default function Offline() {
  return (
    <div className="rd-stack" style={{ paddingTop: 80, textAlign: 'center' }}>
      <h1 className="app-title">You&apos;re offline</h1>
      <p className="rd-muted">Check your connection and try again. Your trips will load when you&apos;re back online.</p>
    </div>
  );
}
