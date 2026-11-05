'use client';

// DESIGN-STATIC: generated from the design canvas board "LuxuryChauffeur". Wire to the API and remove this marker.
/* eslint-disable */
export default function LuxuryChauffeurPage() {
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
                Luxury chauffeur
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>
                  First-class cars and vetted professional chauffeurs for the moments that matter.
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                  <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '22px', color: '#F3EEDF' }}>
                    Plan your journey
                  </h2>
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
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9A94F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
                    </svg>
                    <span style={{ fontSize: '14.5px' }}>Chilled water</span>
                  </div>
                </div>
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9A94F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
                    </svg>
                    <span style={{ fontSize: '14.5px' }}>Onboard Wi-Fi</span>
                  </div>
                </div>
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9A94F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                    </svg>
                    <span style={{ fontSize: '14.5px' }}>Suited chauffeur</span>
                  </div>
                </div>
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <svg
                      width="22"
                      height="22"
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
                    <span style={{ fontSize: '14.5px' }}>Meet & greet</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '24px', color: '#F3EEDF' }}>Select your car</h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                  <button
                    type="button"
                    className="dz-opt on"
                    data-v="S-Class"
                    data-p="$42.00"
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
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>Mercedes S-Class</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>3 seats · Executive</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$42.00</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>6 min</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="7 Series"
                    data-p="$40.00"
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
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>BMW 7 Series</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>3 seats · Executive</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$40.00</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>8 min</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="Range Rover"
                    data-p="$48.00"
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
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>Range Rover</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>4 seats · Luxury SUV</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$48.00</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>9 min</div>
                    </div>
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '340px' }}>
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
                    <span data-cta-label="Book {v} \u00b7 {p}">Book S-Class · $42.00</span>
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
