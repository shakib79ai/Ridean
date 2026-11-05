'use client';

// DESIGN-STATIC: generated from the design canvas board "HourlyChauffeur". Wire to the API and remove this marker.
/* eslint-disable */
export default function HourlyChauffeurPage() {
  return (
    <>
      <section style={{ position: 'relative', height: '330px', overflow: 'hidden' }}>
        <img
          src="/img/design/seat.png"
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
            objectPosition: 'center 40%',
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
                Hourly chauffeur
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>
                  Your time. Our chauffeur. A dedicated car and driver for as long as you need.
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
                  <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '22px', color: '#F3EEDF' }}>Book by the hour</h2>
                </div>
                <div style={{ fontSize: '13px', color: '#9FB2A6' }}>How many hours?</div>
                <div className="dz-chipw" data-g="hours" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" className="dz-chip" data-v="2" data-act="rdChip(this)">
                    2 h
                  </button>
                  <button type="button" className="dz-chip on" data-v="3" data-act="rdChip(this)">
                    3 h
                  </button>
                  <button type="button" className="dz-chip" data-v="4" data-act="rdChip(this)">
                    4 h
                  </button>
                  <button type="button" className="dz-chip" data-v="6" data-act="rdChip(this)">
                    6 h
                  </button>
                  <button type="button" className="dz-chip" data-v="8" data-act="rdChip(this)">
                    8 h
                  </button>
                  <button type="button" className="dz-chip" data-v="10" data-act="rdChip(this)">
                    10 h
                  </button>
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
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Date</div>
                        <input
                          name="date"
                          type="date"
                          defaultValue="2026-11-18"
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
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Start time</div>
                        <input
                          name="time"
                          type="time"
                          defaultValue="09:00"
                          placeholder=""
                          style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: '12px', color: '#9FB2A6' }}>Notes for your chauffeur</span>
                  <textarea
                    rows={3}
                    placeholder="Stops, meeting points, preferences"
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      display: 'block',
                      width: '100%',
                      marginTop: '6px',
                      padding: '12px',
                      border: '1px solid #1F4537',
                      borderRadius: '12px',
                      background: '#071A14',
                      fontSize: '14px',
                      color: '#F3EEDF',
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '24px', color: '#F3EEDF' }}>Vehicle class</h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                  <button
                    type="button"
                    className="dz-opt on"
                    data-v="Business"
                    data-p="$65/h"
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
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>Mercedes E-Class or similar</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$65/h</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>Up to 3</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="First"
                    data-p="$95/h"
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
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>First</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>Mercedes S-Class or similar</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$95/h</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>Up to 3</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="Van"
                    data-p="$85/h"
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
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#F3EEDF' }}>Van</div>
                      <div style={{ fontSize: '12.5px', color: '#9FB2A6', marginTop: '2px' }}>Mercedes V-Class or similar</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$85/h</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>Up to 6</div>
                    </div>
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '18px' }}>
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
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="21"
                        height="21"
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
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>Multi-stop days</div>
                      <div style={{ fontSize: '13.5px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.5 }}>
                        Meetings across town without waiting for rides.
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '18px' }}>
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
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="21"
                        height="21"
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
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>Onboard comforts</div>
                      <div style={{ fontSize: '13.5px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.5 }}>Chilled water, Wi-Fi and charging.</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '18px' }}>
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
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="21"
                        height="21"
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
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>Free waiting</div>
                      <div style={{ fontSize: '13.5px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.5 }}>Your chauffeur stays with you all day.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '22px' }}>
                <div data-rate="65" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#9FB2A6' }}>
                      Estimated total · <span data-hrs="">3 hours</span>
                    </div>
                    <div data-total="" style={{ fontFamily: "'Playfair Display',serif", fontSize: '36px', fontWeight: 600, marginTop: '2px' }}>
                      $195.00
                    </div>
                  </div>
                  <div style={{ width: '280px' }}>
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
                      <span>Continue</span>
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
      </div>
    </>
  );
}
