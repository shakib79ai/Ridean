'use client';

// DESIGN-STATIC: generated from the design canvas board "Services". Wire to the API and remove this marker.
/* eslint-disable */
export default function ServicesPage() {
  return (
    <>
      <section style={{ position: 'relative', height: '380px', overflow: 'hidden' }}>
        <img
          src="/img/design/hero-wide.jpg"
          alt=""
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right 24%' }}
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
                height: '380px',
                maxWidth: '620px',
                paddingBottom: '30px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: '#D9A94F', marginBottom: '12px' }}>
                Our services
              </div>
              <h1 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '54px', lineHeight: 1.06, color: '#F3EEDF' }}>
                Every way to arrive
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>
                  Rides, airport transfers, chauffeurs and rentals — one premium standard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ maxWidth: '1344px', margin: '0 auto', padding: '48px 48px 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: '0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px' }}>
            <a
              href="/ride"
              className="dz-card-link"
              style={{ display: 'flex', flexDirection: 'column', background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '18px', overflow: 'hidden' }}
            >
              <div style={{ height: '210px' }}>
                <img src="/img/design/signin-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '20% center' }} />
              </div>
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 600 }}>Ride</span>
                  <span style={{ fontSize: '13.5px', color: '#D9A94F' }}>From $9.40</span>
                </div>
                <span style={{ fontSize: '14.5px', color: '#C9D2CB', lineHeight: 1.5 }}>On-demand and scheduled rides with upfront prices.</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 600, color: '#F6C428', marginTop: '6px' }}>
                  Book now
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C428"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </a>
            <a
              href="/airport-transfer"
              className="dz-card-link"
              style={{ display: 'flex', flexDirection: 'column', background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '18px', overflow: 'hidden' }}
            >
              <div style={{ height: '210px' }}>
                <img src="/img/design/airport.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              </div>
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 600 }}>Airport transfer</span>
                  <span style={{ fontSize: '13.5px', color: '#D9A94F' }}>From $64</span>
                </div>
                <span style={{ fontSize: '14.5px', color: '#C9D2CB', lineHeight: 1.5 }}>Flight-tracked pickups with meet & greet.</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 600, color: '#F6C428', marginTop: '6px' }}>
                  Book now
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C428"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </a>
            <a
              href="/hourly"
              className="dz-card-link"
              style={{ display: 'flex', flexDirection: 'column', background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '18px', overflow: 'hidden' }}
            >
              <div style={{ height: '210px' }}>
                <img src="/img/design/card-sm.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              </div>
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 600 }}>Hourly chauffeur</span>
                  <span style={{ fontSize: '13.5px', color: '#D9A94F' }}>From $65/h</span>
                </div>
                <span style={{ fontSize: '14.5px', color: '#C9D2CB', lineHeight: 1.5 }}>A dedicated car and driver by the hour.</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 600, color: '#F6C428', marginTop: '6px' }}>
                  Book now
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C428"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </a>
            <a
              href="/luxury"
              className="dz-card-link"
              style={{ display: 'flex', flexDirection: 'column', background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '18px', overflow: 'hidden' }}
            >
              <div style={{ height: '210px' }}>
                <img src="/img/design/signin-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '85% center' }} />
              </div>
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 600 }}>Luxury chauffeur</span>
                  <span style={{ fontSize: '13.5px', color: '#D9A94F' }}>From $40</span>
                </div>
                <span style={{ fontSize: '14.5px', color: '#C9D2CB', lineHeight: 1.5 }}>S-Class, 7 Series and Range Rover.</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 600, color: '#F6C428', marginTop: '6px' }}>
                  Book now
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C428"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </a>
            <a
              href="/rent"
              className="dz-card-link"
              style={{ display: 'flex', flexDirection: 'column', background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '18px', overflow: 'hidden' }}
            >
              <div style={{ height: '210px' }}>
                <img src="/img/design/business.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              </div>
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 600 }}>Rent a car</span>
                  <span style={{ fontSize: '13.5px', color: '#D9A94F' }}>From $31/day</span>
                </div>
                <span style={{ fontSize: '14.5px', color: '#C9D2CB', lineHeight: 1.5 }}>Compare 8 rental partners in one search.</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 600, color: '#F6C428', marginTop: '6px' }}>
                  Book now
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C428"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </a>
            <div
              style={{
                background: 'linear-gradient(135deg,#1E5442,#0E2A22)',
                border: '1px solid #1F4537',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
                <svg
                  width="28"
                  height="28"
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
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 600 }}>Ridean Business</span>
                <p style={{ margin: '0', fontSize: '15px', lineHeight: 1.6, color: '#C9D2CB' }}>
                  One account for your whole team: monthly billing, travel policies and consolidated invoices.
                </p>
                <a
                  href="/account/business"
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
                  <span>Set up business</span>
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
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
            <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '32px', color: '#F3EEDF' }}>How it works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '26px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '40px', color: '#D9A94F' }}>01</span>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Tell us where</span>
                <p style={{ margin: '0', fontSize: '15px', lineHeight: 1.6, color: '#9FB2A6' }}>Pickup, destination and time — or choose by the hour.</p>
              </div>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '26px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '40px', color: '#D9A94F' }}>02</span>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Pick your car</span>
                <p style={{ margin: '0', fontSize: '15px', lineHeight: 1.6, color: '#9FB2A6' }}>See every class with one upfront price.</p>
              </div>
            </div>
            <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '26px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '40px', color: '#D9A94F' }}>03</span>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Arrive exceptionally</span>
                <p style={{ margin: '0', fontSize: '15px', lineHeight: 1.6, color: '#9FB2A6' }}>Track your chauffeur live and relax.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
