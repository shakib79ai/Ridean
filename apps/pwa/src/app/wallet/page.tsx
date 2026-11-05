import { WalletView, RequireAuth } from '@ridean/web-core';

export const metadata = { title: 'Wallet' };

export default function Page() {
  return (
    <div className="rd-stack">
      <h1 className="app-title">Wallet</h1>
      <RequireAuth><WalletView /></RequireAuth>
    </div>
  );
}
