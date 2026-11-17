import Link from 'next/link';

const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };
const head: React.CSSProperties = { fontSize: 13, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#D9A94F' };
const lnk: React.CSSProperties = { fontSize: 14.5, color: '#C9D2CB', textDecoration: 'none' };

// Store badges appear once the mobile app is published (set the URLs in .env).
const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL;
const PLAY_STORE = process.env.NEXT_PUBLIC_PLAY_STORE_URL;
const store: React.CSSProperties = { padding: '10px 16px', borderRadius: 10, border: '1px solid #1F4537', fontSize: 13.5, color: '#F3EEDF', textDecoration: 'none' };

export function SiteFooter() {
  return (
    <footer style={{ background: '#06120E', borderTop: '1px solid #1F4537', marginTop: 72 }}>
      <div style={{ maxWidth: 1344, margin: '0 auto', padding: '0 max(16px, min(48px, 4vw))', boxSizing: 'border-box' }}>
        <div className="dz-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 40, padding: '56px 0 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo-full.png" alt="Ridean" style={{ display: 'block', height: 84, width: 'auto', alignSelf: 'flex-start' }} />
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#9FB2A6', maxWidth: 420 }}>Premium mobility for wherever life takes you — rides, airport transfers, chauffeurs and rentals in one place.</p>
            {(APP_STORE || PLAY_STORE) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                {APP_STORE && <a href={APP_STORE} style={store}>App Store</a>}
                {PLAY_STORE && <a href={PLAY_STORE} style={store}>Google Play</a>}
              </div>
            )}
          </div>
          <div style={col}>
            <div style={head}>Services</div>
            <Link href="/ride" style={lnk}>Ride</Link>
            <Link href="/airport-transfer" style={lnk}>Airport transfer</Link>
            <Link href="/hourly" style={lnk}>Hourly chauffeur</Link>
            <Link href="/luxury" style={lnk}>Luxury chauffeur</Link>
            <Link href="/rent" style={lnk}>Rent a car</Link>
          </div>
          <div style={col}>
            <div style={head}>Company</div>
            <Link href="/about" style={lnk}>About Ridean</Link>
            <Link href="/account/business" style={lnk}>Ridean Business</Link>
            <Link href="/contact" style={lnk}>Contact</Link>
            <Link href="/services" style={lnk}>All services</Link>
          </div>
          <div style={col}>
            <div style={head}>Support</div>
            <Link href="/help" style={lnk}>Help centre</Link>
            <Link href="/account/trips" style={lnk}>Your trips</Link>
            <Link href="/legal" style={lnk}>Legal &amp; privacy</Link>
            <Link href="/signin" style={lnk}>Sign in</Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', padding: '20px 0 28px', borderTop: '1px solid #1F4537', fontSize: 13, color: '#9FB2A6' }}>
          <span>© 2026 Best My Flight Inc. · 1088 Liberty Ave, Brooklyn, NY 11208</span>
          <span>English (US) · USD</span>
        </div>
      </div>
    </footer>
  );
}
