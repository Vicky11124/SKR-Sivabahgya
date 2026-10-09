import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';

/*
  Stepped gold lines from the lobby wall. One runs in from the left edge and one from the
  right; both are tied to the scroll position and meet in the middle as the band reaches
  the centre of the screen (scrolling back up draws them apart again).
*/
export default function Motif() {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.set('path', { strokeDasharray: 1, strokeDashoffset: 1 });
    // each path is normalised to length 1, so both reach the meeting point at the same moment
    gsap.to('path', {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top 95%', end: 'center 50%', scrub: 0.6 }
    });
  }, { scope: ref });

  return (
    <div className="motif" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid meet">
        <path pathLength="1" d="M0 150 H360 V90 H620 V40 H840 V110" />
        <path pathLength="1" d="M1600 70 H1240 V130 H980 V180 H840 V110" />
      </svg>
    </div>
  );
}
