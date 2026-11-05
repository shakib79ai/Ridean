'use client';

// DESIGN-STATIC: generated from the design canvas board "AirportTransfer". Wire to the API and remove this marker.
/* eslint-disable */
export default function AirportTransferPage() {
  return (
    <>
      <section style={{ position: 'relative', height: '330px', overflow: 'hidden' }}>
        <img
          src="/img/design/airport.png"
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
            objectPosition: 'center 60%',
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
                Airport transfer
              </h1>
              <div style={{ marginTop: '14px' }}>
                <p style={{ margin: '0', fontSize: '18px', lineHeight: 1.6, color: '#D7DED6' }}>
                  Pre-booked transfers to and from the airport, between hotels, or from city to city.
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
                    borderBottom: '2.5px solid #F6C428',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#F6C428" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path
                      transform="rotate(45 12 12)"
                      d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                    />
                  </svg>
                  <span style={{ fontSize: '15.5px', color: '#F6C428', whiteSpace: 'nowrap' }}>Airport transfer</span>
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
                <div className="dz-segw" data-g="trip">
                  <button type="button" className="dz-seg on" data-v="one" data-act="rdSeg(this)">
                    One way
                  </button>
                  <button type="button" className="dz-seg" data-v="ret" data-act="rdSeg(this)">
                    Return
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: '#12352B',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#C9D2CB',
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D9A94F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" />
                  </svg>
                  <span>Transfer between any two places: airport to hotel, hotel to city, or city to city.</span>
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
                      placeholder="Airport, hotel or address"
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
                    <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Drop-off</div>
                    <input
                      name="dest"
                      type="text"
                      defaultValue="London Heathrow (LHR) \u00b7 Terminal 5"
                      placeholder="Airport, hotel, city or address"
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
                      aria-label="Swap pickup and drop-off"
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
                      <path d="M3 17h18M6 13l-2-5h2.5l2 3h5L11 4h3l4.5 7H21a1.5 1.5 0 0 1 0 3H8z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '0', padding: '8px 8px 8px 0' }}>
                    <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Flight number (optional)</div>
                    <input
                      name="flight"
                      type="text"
                      defaultValue=""
                      placeholder="e.g. BA 117 \u2014 for airport pickups"
                      style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                    />
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
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Pickup date</div>
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
                        <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Pickup time</div>
                        <input
                          name="time"
                          type="time"
                          defaultValue="06:30"
                          placeholder=""
                          style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
                <div data-show-trip="ret" className="dz-hide" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#D9A94F', paddingTop: '2px' }}>
                    Return journey
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
                          <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Return date</div>
                          <input
                            name="rdate"
                            type="date"
                            defaultValue="2026-11-21"
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
                          <div style={{ fontSize: '11.5px', color: '#9FB2A6' }}>Return time</div>
                          <input
                            name="rtime"
                            type="time"
                            defaultValue="18:00"
                            placeholder=""
                            style={{ all: 'unset', width: '100%', fontSize: '14.5px', color: '#F3EEDF', marginTop: '2px' }}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1F4537' }}>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', color: '#F3EEDF' }}>Passengers</div>
                    <div style={{ fontSize: '12px', color: '#9FB2A6' }}>Including you</div>
                  </div>
                  <button type="button" className="dz-step" aria-label="Decrease Passengers" data-act="rdStep(this,-1)">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F3EEDF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <output className="dz-stepv" style={{ minWidth: '26px', textAlign: 'center', fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>
                    2
                  </output>
                  <button type="button" className="dz-step" aria-label="Increase Passengers" data-act="rdStep(this,1)">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F3EEDF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1F4537' }}>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '15px', color: '#F3EEDF' }}>Luggage</div>
                    <div style={{ fontSize: '12px', color: '#9FB2A6' }}>Large suitcases</div>
                  </div>
                  <button type="button" className="dz-step" aria-label="Decrease Luggage" data-act="rdStep(this,-1)">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F3EEDF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <output className="dz-stepv" style={{ minWidth: '26px', textAlign: 'center', fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>
                    2
                  </output>
                  <button type="button" className="dz-step" aria-label="Increase Luggage" data-act="rdStep(this,1)">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F3EEDF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
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
                  <span>Find a transfer</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '28px', color: '#F3EEDF' }}>
                  Arrive relaxed, every time
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                        <path d="M3 17h18M6 13l-2-5h2.5l2 3h5L11 4h3l4.5 7H21a1.5 1.5 0 0 1 0 3H8z" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>Flight tracking</div>
                      <div style={{ fontSize: '13.5px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.5 }}>
                        We follow your flight and adjust pickup to delays automatically.
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
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>60 minutes free waiting</div>
                      <div style={{ fontSize: '13.5px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.5 }}>
                        Clear customs at your own pace — waiting is on us.
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
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>Meet & greet</div>
                      <div style={{ fontSize: '13.5px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.5 }}>
                        Your chauffeur waits in arrivals with a name sign.
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
                        <path d="M3 12V4h8l10 10-8 8z" />
                        <circle cx="7.5" cy="8.5" r="1.5" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>Fixed price</div>
                      <div style={{ fontSize: '13.5px', color: '#9FB2A6', marginTop: '4px', lineHeight: 1.5 }}>
                        One upfront price, including tolls and airport fees.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ margin: '0', fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: '24px', color: '#F3EEDF' }}>Vehicle classes</h2>
              </div>
              <div style={{ background: '#0E2A22', border: '1px solid #1F4537', borderRadius: '16px', padding: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                  <button
                    type="button"
                    className="dz-opt on"
                    data-v="Business"
                    data-p="$64.00"
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
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$64.00</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>Up to 3</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="First"
                    data-p="$92.00"
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
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$92.00</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>Up to 3</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="dz-opt"
                    data-v="Van"
                    data-p="$84.00"
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
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#F3EEDF' }}>$84.00</div>
                      <div style={{ fontSize: '12px', color: '#9FB2A6', marginTop: '2px' }}>Up to 6</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
