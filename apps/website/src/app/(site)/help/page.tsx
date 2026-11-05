'use client';

// DESIGN-STATIC: generated from the design canvas board "HelpSupport". Wire to the API and remove this marker.
/* eslint-disable */
export default function HelpSupportPage() {
  return (
    <>
      <section style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
        <img
          src="/img/design/signin-hero.png"
          alt=""
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background:
              'linear-gradient(90deg,rgba(7,26,20,.95) 0%,rgba(7,26,20,.7) 38%,rgba(7,26,20,.15) 75%),linear-gradient(180deg,rgba(7,26,20,0) 55%,#071A14 100%)',
          }}
        ></div>
        <div style={{ position: 'relative', height: '100%' }}>
          <div style={{ maxWidth: '1344px', margin: '0 auto', padding: '0 48px', boxSizing: 'border-box' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '300px',
                maxWidth: '620px',
                paddingBottom: '30px',
                boxSizing: 'border-box',
              }}
            >
              <h1 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '54px', lineHeight: 1.06, color: '#F3EEDF' }}>
                How can we help?
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>Search our help centre or talk to a real person, 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ maxWidth: '1344px', margin: '0 auto', padding: '0 48px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: '0' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              height: '60px',
              padding: '0 20px',
              borderRadius: '14px',
              border: '1px solid #D9A94F',
              background: '#0E2A22',
              marginTop: '-30px',
              position: 'relative',
              zIndex: 5,
              boxShadow: '0 20px 40px -16px rgba(0,0,0,.6)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D9A94F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              placeholder="Search help articles \u2014 e.g. cancel, airport pickup, invoice"
              style={{ all: 'unset', flex: 1, fontSize: '16px', color: '#F3EEDF' }}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <a
                href="#"
                data-act="rdToast(this,'Connecting you to support\u2026');return false;"
                style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D9A94F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M4 5h16v11H9l-5 4z" />
                </svg>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Live chat</span>
                <span style={{ fontSize: '13.5px', color: '#9FB2A6' }}>Reply in under 2 minutes</span>
              </a>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <a href="tel:+442000000000" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D9A94F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                </svg>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Call us</span>
                <span style={{ fontSize: '13.5px', color: '#9FB2A6' }}>24/7, every day</span>
              </a>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <a href="/account/trips" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D9A94F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M9 8h6M9 12h6M9 16h3.5" />
                </svg>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>A recent trip</span>
                <span style={{ fontSize: '13.5px', color: '#9FB2A6' }}>Lost items, fares, feedback</span>
              </a>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <a href="/account/business" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D9A94F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M9 7V5h6v2M3 12h18" />
                </svg>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Business help</span>
                <span style={{ fontSize: '13.5px', color: '#9FB2A6' }}>Billing and team accounts</span>
              </a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '26px', color: '#F3EEDF' }}>Common questions</h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 22px' }}>
                <details className="dz-faq" style={{ padding: '18px 4px', borderBottom: '1px solid #1F4537' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px' }}>
                    <span style={{ flex: 1 }}>How do I cancel a booking?</span>
                    <span className="dz-fq-ic" style={{ display: 'flex', transition: 'transform .2s' }}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9FB2A6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p style={{ margin: '10px 0 0', fontSize: '14.5px', lineHeight: 1.6, color: '#9FB2A6' }}>
                    Open Trips, choose the booking and select Cancel. Cancellation is free up to 1 hour before pickup.
                  </p>
                </details>
                <details className="dz-faq" style={{ padding: '18px 4px', borderBottom: '1px solid #1F4537' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px' }}>
                    <span style={{ flex: 1 }}>Where will my chauffeur meet me at the airport?</span>
                    <span className="dz-fq-ic" style={{ display: 'flex', transition: 'transform .2s' }}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9FB2A6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p style={{ margin: '10px 0 0', fontSize: '14.5px', lineHeight: 1.6, color: '#9FB2A6' }}>
                    In the arrivals hall holding a Ridean name sign. You'll get their photo and phone number once you land.
                  </p>
                </details>
                <details className="dz-faq" style={{ padding: '18px 4px', borderBottom: '1px solid #1F4537' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px' }}>
                    <span style={{ flex: 1 }}>How is my price calculated?</span>
                    <span className="dz-fq-ic" style={{ display: 'flex', transition: 'transform .2s' }}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9FB2A6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p style={{ margin: '10px 0 0', fontSize: '14.5px', lineHeight: 1.6, color: '#9FB2A6' }}>
                    You see one upfront price before booking. It includes fees and taxes — no surge, ever.
                  </p>
                </details>
                <details className="dz-faq" style={{ padding: '18px 4px', borderBottom: '1px solid #1F4537' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px' }}>
                    <span style={{ flex: 1 }}>Can I book for someone else?</span>
                    <span className="dz-fq-ic" style={{ display: 'flex', transition: 'transform .2s' }}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9FB2A6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p style={{ margin: '10px 0 0', fontSize: '14.5px', lineHeight: 1.6, color: '#9FB2A6' }}>
                    Yes. Add the passenger's name and phone number on the review screen before you pay.
                  </p>
                </details>
                <details className="dz-faq" style={{ padding: '18px 4px' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px' }}>
                    <span style={{ flex: 1 }}>How do business invoices work?</span>
                    <span className="dz-fq-ic" style={{ display: 'flex', transition: 'transform .2s' }}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9FB2A6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p style={{ margin: '10px 0 0', fontSize: '14.5px', lineHeight: 1.6, color: '#9FB2A6' }}>
                    Business accounts are billed monthly with one consolidated invoice and a CSV of every trip.
                  </p>
                </details>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '22px', color: '#F3EEDF' }}>Popular topics</h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '2px 16px' }}>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: '1px solid #1F4537' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: '#12352B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9A94F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF' }}>Airport pickups</div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9FB2A6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: '1px solid #1F4537' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: '#12352B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9A94F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <rect x="3" y="5.5" width="18" height="13" rx="2" />
                      <path d="M3 10h18M7 15h3" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF' }}>Payments & refunds</div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9FB2A6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px', borderBottom: '1px solid #1F4537' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: '#12352B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9A94F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF' }}>Safety</div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9FB2A6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </a>
                <a href="/account/invoices" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 2px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: '#12352B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9A94F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M6 3h8l4 4v14H6z" />
                      <path d="M14 3v4h4M9 12h6M9 16h6" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#F3EEDF' }}>Invoices</div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9FB2A6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
