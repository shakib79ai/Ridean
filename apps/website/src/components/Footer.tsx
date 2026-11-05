import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="rd-container">
        <div className="footer-grid">
          <div className="rd-stack">
            <span className="rd-logo" style={{ fontSize: 36 }}>Ridean</span>
            <p className="rd-muted" style={{ margin: 0, lineHeight: 1.6 }}>Premium mobility for wherever life takes you — rides, airport transfers, chauffeurs and rentals in one place.</p>
          </div>
          <div>
            <div className="rd-eyebrow">Services</div>
            <Link href="/ride">Ride</Link>
            <Link href="/airport-transfer">Airport transfer</Link>
            <Link href="/hourly">Hourly chauffeur</Link>
            <Link href="/luxury">Luxury chauffeur</Link>
            <Link href="/rent">Rent a car</Link>
          </div>
          <div>
            <div className="rd-eyebrow">Company</div>
            <Link href="/about">About Ridean</Link>
            <Link href="/business">Ridean Business</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/services">All services</Link>
          </div>
          <div>
            <div className="rd-eyebrow">Support</div>
            <Link href="/help">Help centre</Link>
            <Link href="/account">Your trips</Link>
            <Link href="/legal">Legal &amp; privacy</Link>
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
        <div className="rd-row rd-muted" style={{ justifyContent: 'space-between', padding: '20px 0 28px', borderTop: '1px solid var(--line)', fontSize: 13, flexWrap: 'wrap' }}>
          <span>© {new Date().getFullYear()} Best My Flight Inc. · 1088 Liberty Ave, Brooklyn, NY 11208</span>
          <span>English (US) · USD</span>
        </div>
      </div>
    </footer>
  );
}
