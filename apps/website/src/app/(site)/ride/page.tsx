'use client';

// DESIGN-STATIC: generated from the design canvas board "RideNow". Wire to the API and remove this marker.
/* eslint-disable */
export default function RideNowPage() {
  return (
    <>
      <section style={{ position: 'relative', height: '330px', overflow: 'hidden' }}>
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
                height: '330px',
                maxWidth: '620px',
                paddingBottom: '30px',
                boxSizing: 'border-box',
              }}
            >
              <h1 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '54px', lineHeight: 1.06, color: '#F3EEDF' }}>
                Ride
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>
                  Premium rides for every occasion — upfront prices, vetted chauffeurs, no surge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ maxWidth: '1344px', margin: '0 auto', padding: '0 48px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '470px 1fr', gap: '40px' }}>
          <div style={{ marginTop: '-110px', position: 'relative', zIndex: 5 }}>
            <div
              style={{
                background: '#0E2A22',
                border: '1px solid #1F4537',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)',
              }}
            >
              <div style={{ display: 'flex', borderBottom: '1px solid #1F4537', margin: '0 -22px 16px', padding: '0 12px' }}>
                <a
                  href="/ride"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '9px',
                    padding: '15px 4px 13px',
                    borderBottom: '2.5px solid #F6C428',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#F6C428" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                  <span style={{ fontSize: '15.5px', color: '#F6C428', whiteSpace: 'nowrap' }}>Ride</span>
                </a>
                <a
                  href="/airport-transfer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '9px',
                    padding: '15px 4px 13px',
                    borderBottom: '2.5px solid transparent',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#F3EEDF" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path
                      transform="rotate(45 12 12)"
                      d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                    />
                  </svg>
                  <span style={{ fontSize: '15.5px', color: '#F3EEDF', whiteSpace: 'nowrap' }}>Airport transfer</span>
                </a>
                <a
                  href="/rent"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '9px',
                    padding: '15px 4px 13px',
                    borderBottom: '2.5px solid transparent',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#F3EEDF" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path
                      fillRule="evenodd"
                      d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5zM9.25 14.6h5.5v1.1h-5.5zM9.25 16.6h5.5v1h-5.5z"
                    />
                  </svg>
                  <span style={{ fontSize: '15.5px', color: '#F3EEDF', whiteSpace: 'nowrap' }}>Rent a car</span>
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '0' }}>
                <div className="dz-segw" data-g="when">
                  <button type="button" className="dz-seg on" data-v="now" data-act="rdSeg(this)">
                    Now
                  </button>
                  <button type="button" className="dz-seg" data-v="sched" data-act="rdSeg(this)">
                    Schedule
                  </button>
                </div>
                <div data-show-when="sched" className="dz-hide" style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: '0' }}>
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
                          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                          <path d="M3.5 10h17M8 3v4M16 3v4" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Date</div>
                        <input
                          name="date"
                          type="date"
                          defaultValue="2026-11-14"
                          placeholder=""
                          style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                        />
                      </div>
                    </label>
                  </div>
                  <div style={{ flex: 1, minWidth: '0' }}>
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
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Time</div>
                        <input
                          name="time"
                          type="time"
                          defaultValue="18:30"
                          placeholder=""
                          style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
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
                      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.4" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                    <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Pickup</div>
                    <input
                      name="pickup"
                      type="text"
                      defaultValue="Hotel Verde, 12 Oak Street, London"
                      placeholder=""
                      style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      alignSelf: 'stretch',
                      borderLeft: '1px solid #1F4537',
                    }}
                  >
                    <button
                      type="button"
                      data-act="rdLocate(this)"
                      aria-label="Use current location"
                      style={{ all: 'unset', cursor: 'pointer', display: 'flex' }}
                    >
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F3EEDF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <circle cx="12" cy="12" r="3" />
                        <circle cx="12" cy="12" r="7.5" />
                        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
                      </svg>
                    </button>
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
                      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.4" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                    <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Where to?</div>
                    <input
                      name="dest"
                      type="text"
                      defaultValue=""
                      placeholder="Enter a destination"
                      style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      alignSelf: 'stretch',
                      borderLeft: '1px solid #1F4537',
                    }}
                  >
                    <button
                      type="button"
                      data-act="rdSwap(this)"
                      aria-label="Swap pickup and destination"
                      style={{ all: 'unset', cursor: 'pointer', display: 'flex' }}
                    >
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F3EEDF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" />
                      </svg>
                    </button>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '0' }}>
              <div
                style={{ position: 'relative', height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1F4537', background: '#0A2019' }}
              >
                <svg width="100%" height="100%" viewBox="0 0 830 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <rect width="830" height="300" fill="#0A2019" />
                  <g stroke="#143A2E" strokeWidth="12" fill="none">
                    <path d="M-10 90 L840 66" />
                    <path d="M-10 225 L840 255" />
                    <path d="M213 -10 L285 310" />
                    <path d="M593 -10 L545 310" />
                  </g>
                  <g stroke="#10302A" strokeWidth="6" fill="none">
                    <path d="M-10 156 L840 150" />
                    <path d="M403 -10 L427 310" />
                    <path d="M735 -10 L711 310" />
                    <path d="M71 -10 L119 310" />
                    <path d="M498 -10 L486 310" />
                  </g>
                  <rect x="320" y="174" width="70" height="34" rx="5" fill="#123A2A" />
                  <rect x="451" y="30" width="60" height="40" rx="5" fill="#123A2A" />
                  <rect x="95" y="24" width="54" height="36" rx="5" fill="#123A2A" />
                  <path d="M166 216 C 332 204, 356 126, 474 108 S 640 72, 676 60" stroke="#D9A94F" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="166" cy="216" r="9" fill="#071A14" stroke="#D9A94F" strokeWidth="4" />
                  <circle cx="676" cy="60" r="10" fill="#F6C428" />
                  <circle cx="676" cy="60" r="4" fill="#071A14" />
                </svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '24px', color: '#F3EEDF' }}>Choose your ride</h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="Standard"
                    data-p="$9.40"
                    data-act="rdOpt(this)"
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ width: '78px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/img/design/signin-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>Standard</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>4 seats · Sedan</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$9.40</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>3 min</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt on"
                    data-v="Business"
                    data-p="$18.90"
                    data-act="rdOpt(this)"
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ width: '78px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/img/design/business.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>Business</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>4 seats · Premium sedan</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$18.90</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>5 min</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="XL"
                    data-p="$27.50"
                    data-act="rdOpt(this)"
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ width: '78px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/img/design/seat.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>XL</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>6 seats · SUV</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$27.50</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>7 min</div>
                    </div>
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <a href="/account/payment-methods" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
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
                    <rect x="3" y="5.5" width="18" height="13" rx="2" />
                    <path d="M3 10h18M7 15h3" />
                  </svg>
                  <span style={{ fontSize: '15px' }}>Visa •••• 4242</span>
                  <span style={{ fontSize: '13.5px', color: '#D9A94F' }}>Change</span>
                </a>
                <div style={{ width: '320px' }}>
                  <a
                    href="/checkout/QUOTE"
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
                    <span data-cta-label="Confirm {v} \u00b7 {p}">Confirm Business · $18.90</span>
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
          </div>
        </div>
      </div>
    </>
  );
}
