'use client';

// DESIGN-STATIC: generated from the design canvas board "CompareRentals". Wire to the API and remove this marker.
/* eslint-disable */
export default function CompareRentalsPage() {
  return (
    <>
      <section style={{ position: 'relative', height: '330px', overflow: 'hidden' }}>
        <img
          src="/img/design/business.png"
          alt=""
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '50%',
            WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 40%)',
            maskImage: 'linear-gradient(90deg,transparent 0%,#000 40%)',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
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
                Rent a car
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>
                  Freedom to move on your terms. Compare Hertz, SIXT, Avis, Enterprise and more in one search.
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
                    borderBottom: '2.5px solid transparent',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#F3EEDF" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                  <span style={{ fontSize: '15.5px', color: '#F3EEDF', whiteSpace: 'nowrap' }}>Ride</span>
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
                    borderBottom: '2.5px solid #F6C428',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#F6C428" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path
                      fillRule="evenodd"
                      d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5zM9.25 14.6h5.5v1.1h-5.5zM9.25 16.6h5.5v1h-5.5z"
                    />
                  </svg>
                  <span style={{ fontSize: '15.5px', color: '#F6C428', whiteSpace: 'nowrap' }}>Rent a car</span>
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '0' }}>
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
                    <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Pickup location</div>
                    <input
                      name="pickup"
                      type="text"
                      defaultValue="London Heathrow Airport (LHR)"
                      placeholder=""
                      style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                    />
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <button
                    type="button"
                    className="dz-tg on"
                    role="switch"
                    aria-checked="true"
                    aria-label="Return to same location"
                    data-act="rdTg(this);rdShow(this,'ret',this.classList.contains('on')?'same':'diff')"
                  >
                    <span></span>
                  </button>
                  Return to same location
                </label>
                <div data-show-ret="diff" className="dz-hide">
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
                        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                        <circle cx="12" cy="9.5" r="2.5" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                      <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Return location</div>
                      <input
                        name="ret"
                        type="text"
                        placeholder="Enter a different return address"
                        style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                      />
                    </div>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
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
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Pick-up</div>
                        <input
                          name="d1"
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
                          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                          <path d="M3.5 10h17M8 3v4M16 3v4" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Return</div>
                        <input
                          name="d2"
                          type="date"
                          defaultValue="2026-11-17"
                          placeholder=""
                          style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
                <a
                  href="#"
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
                  <span>Search 8 rental partners</span>
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
          <div style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 0 -2px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontSize: '19px', fontWeight: 600, color: '#F3EEDF' }}>
                  4 cars · best prices
                </h2>
                <a href="#" style={{ fontSize: '12.5px', fontWeight: 600, color: '#D9A94F' }}>
                  Sort: Price
                </a>
              </div>
              <div className="dz-chipw" data-g="filter" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <button type="button" className="dz-chip on" data-v="all" data-act="rdChip(this)">
                  All
                </button>
                <button type="button" className="dz-chip" data-v="economy" data-act="rdChip(this)">
                  Economy
                </button>
                <button type="button" className="dz-chip" data-v="suv" data-act="rdChip(this)">
                  SUV
                </button>
                <button type="button" className="dz-chip" data-v="lux" data-act="rdChip(this)">
                  Luxury
                </button>
              </div>
              <div data-cat="lux economy">
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '96px', height: '72px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/img/design/business.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 600 }}>Mercedes C-Class</div>
                      <div style={{ fontSize: '12.5px', color: '#D9A94F', marginTop: '2px' }}>Hertz · Heathrow T5</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.35 }}>Auto · 5 seats · Unlimited miles</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #1F4537',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '21px', fontWeight: 600 }}>$54</span>
                      <span style={{ fontSize: '12.5px', color: '#9FB2A6' }}>/day</span>
                    </div>
                    <a
                      href="/checkout/QUOTE"
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        background: 'linear-gradient(180deg,#FFD43B,#F2B705)',
                        color: '#0A1F18',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Select
                    </a>
                  </div>
                </div>
              </div>
              <div data-cat="economy">
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '96px', height: '72px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/img/design/hero-wide.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 600 }}>Volkswagen Golf</div>
                      <div style={{ fontSize: '12.5px', color: '#D9A94F', marginTop: '2px' }}>SIXT · Heathrow T5</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.35 }}>Manual · 5 seats · 1,500 km</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #1F4537',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '21px', fontWeight: 600 }}>$31</span>
                      <span style={{ fontSize: '12.5px', color: '#9FB2A6' }}>/day</span>
                    </div>
                    <a
                      href="/checkout/QUOTE"
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        background: 'linear-gradient(180deg,#FFD43B,#F2B705)',
                        color: '#0A1F18',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Select
                    </a>
                  </div>
                </div>
              </div>
              <div data-cat="suv lux">
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '96px', height: '72px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/img/design/seat.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 600 }}>BMW X5</div>
                      <div style={{ fontSize: '12.5px', color: '#D9A94F', marginTop: '2px' }}>Avis · Heathrow T5</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.35 }}>Auto · 5 seats · Unlimited miles</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #1F4537',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '21px', fontWeight: 600 }}>$89</span>
                      <span style={{ fontSize: '12.5px', color: '#9FB2A6' }}>/day</span>
                    </div>
                    <a
                      href="/checkout/QUOTE"
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        background: 'linear-gradient(180deg,#FFD43B,#F2B705)',
                        color: '#0A1F18',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Select
                    </a>
                  </div>
                </div>
              </div>
              <div data-cat="suv">
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '96px', height: '72px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/img/design/hero-wide.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 600 }}>Toyota RAV4 Hybrid</div>
                      <div style={{ fontSize: '12.5px', color: '#D9A94F', marginTop: '2px' }}>Enterprise · Heathrow T5</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.35 }}>Auto · 5 seats · Unlimited miles</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #1F4537',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '21px', fontWeight: 600 }}>$47</span>
                      <span style={{ fontSize: '12.5px', color: '#9FB2A6' }}>/day</span>
                    </div>
                    <a
                      href="/checkout/QUOTE"
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        background: 'linear-gradient(180deg,#FFD43B,#F2B705)',
                        color: '#0A1F18',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Select
                    </a>
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
