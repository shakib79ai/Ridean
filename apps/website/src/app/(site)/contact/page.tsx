'use client';

// DESIGN-STATIC: generated from the design canvas board "Contact". Wire to the API and remove this marker.
/* eslint-disable */
export default function ContactPage() {
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
                Contact us
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>Real people, ready to help — day or night.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ maxWidth: '1344px', margin: '0 auto', padding: '40px 48px 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '28px' }}>
          <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '26px', color: '#F3EEDF' }}>Send us a message</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#071A14',
                    border: '1px solid #1F4537',
                    borderRadius: '12px',
                    minHeight: '58px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '46px', display: 'flex', justifyContent: 'center' }}>
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F3EEDF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                    <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Your name</div>
                    <input
                      name="cname2"
                      type="text"
                      defaultValue=""
                      placeholder="Full name"
                      style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                    />
                  </div>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#071A14',
                    border: '1px solid #1F4537',
                    borderRadius: '12px',
                    minHeight: '58px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '46px', display: 'flex', justifyContent: 'center' }}>
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F3EEDF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3.5 6l8.5 7 8.5-7" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                    <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Email</div>
                    <input
                      name="cemail"
                      type="email"
                      defaultValue=""
                      placeholder="you@example.com"
                      style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                    />
                  </div>
                </label>
              </div>
              <div style={{ fontSize: '13px', color: '#9FB2A6' }}>Topic</div>
              <div className="dz-chipw" data-g="topic" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="dz-chip on" data-v="trip" data-act="rdChip(this)">
                  A trip
                </button>
                <button type="button" className="dz-chip" data-v="pay" data-act="rdChip(this)">
                  Payments
                </button>
                <button type="button" className="dz-chip" data-v="biz" data-act="rdChip(this)">
                  Business
                </button>
                <button type="button" className="dz-chip" data-v="partner" data-act="rdChip(this)">
                  Partnerships
                </button>
                <button type="button" className="dz-chip" data-v="other" data-act="rdChip(this)">
                  Other
                </button>
              </div>
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: '12px', color: '#9FB2A6' }}>Message</span>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    display: 'block',
                    width: '100%',
                    marginTop: '6px',
                    padding: '14px',
                    border: '1px solid #1F4537',
                    borderRadius: '12px',
                    background: '#071A14',
                    fontSize: '15px',
                    color: '#F3EEDF',
                  }}
                />
              </label>
              <a
                href="#"
                data-act="rdToast(this,'Thanks \u2014 we\\'ll reply within the hour');return false;"
                className="dz-cta"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'linear-gradient(180deg,#FFD43B,#F2B705)',
                  color: '#0A1F18',
                  fontSize: '17px',
                  fontWeight: 600,
                }}
              >
                <span>Send message</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0A1F18"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#12352B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>Call us 24/7</div>
                  <div style={{ fontSize: '14.5px', color: '#C9D2CB', marginTop: '4px', lineHeight: 1.5 }}>+44 20 0000 0000</div>
                </div>
              </div>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#12352B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3.5 6l8.5 7 8.5-7" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>Email</div>
                  <div style={{ fontSize: '14.5px', color: '#C9D2CB', marginTop: '4px', lineHeight: 1.5 }}>support@ridean.com</div>
                </div>
              </div>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#12352B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    <rect x="4" y="3" width="11" height="18" rx="1" />
                    <path d="M15 9h5v12h-5M8 7h3M8 11h3M8 15h3" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>Head office</div>
                  <div style={{ fontSize: '14.5px', color: '#C9D2CB', marginTop: '4px', lineHeight: 1.5 }}>
                    Best My Flight Inc.
                    <br />
                    1088 Liberty Ave, Brooklyn, NY 11208
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#12352B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    <path d="M4 5h16v11H9l-5 4z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>Live chat</div>
                  <div style={{ fontSize: '14.5px', color: '#C9D2CB', marginTop: '4px', lineHeight: 1.5 }}>
                    In the app and on this site — replies in under 2 minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
