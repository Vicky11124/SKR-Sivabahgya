import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';

/* A photo fixed behind the page (place pages and the Places overview); it darkens as you scroll so the sections stay readable */
export default function Backdrop({ photo }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.to('.backdrop__shade', {
      opacity: 1, ease: 'power1.inOut',
      scrollTrigger: { start: 0, end: () => innerHeight * 0.9, scrub: true, invalidateOnRefresh: true }
    });
  }, { scope: ref });

  return (
    <div className="backdrop backdrop--place" ref={ref} aria-hidden="true">
      <div className="backdrop__layer">
        <picture>
          <source media="(max-width: 700px)" srcSet={photo.small} />
          <img src={photo.src} alt="" style={photo.position ? { objectPosition: photo.position } : undefined} />
        </picture>
      </div>
      <div className="backdrop__shade" />
      <div className="backdrop__grad" />
    </div>
  );
}
