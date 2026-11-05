import { BookingSearch } from '@ridean/web-core';
import { CarClasses, MeetGreet, ServiceSlider, TrustStrip } from '@/components/HomeSections';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="rd-container hero-inner">
          <div className="rd-stack" style={{ ['--gap' as string]: '22px' }}>
            <h1 className="rd-display">Arrive<br />exceptionally.</h1>
            <p style={{ margin: 0, fontSize: 'clamp(18px,2vw,24px)', lineHeight: 1.35, maxWidth: 440 }}>Premium mobility for wherever life takes you.</p>
            <BookingSearch />
          </div>
        </div>
      </section>
      <ServiceSlider />
      <TrustStrip />
      <CarClasses />
      <MeetGreet />
    </>
  );
}
