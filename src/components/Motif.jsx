import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';

/* Stepped gold lines from the lobby wall, drawn in as you scroll and meeting at the crest */
export default function Motif() {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.set('path', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom 35%', scrub: 1 }
    })
      .to('path:not(.motif__center)', { strokeDashoffset: 0, ease: 'none', duration: 1 })
      .to('.motif__center', { opacity: 1, strokeDashoffset: 0, ease: 'none', duration: 0.4 })
      .from('.motif__crown', { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power2.out' }, '-=0.3');
  }, { scope: ref });

  return (
    <div className="motif" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid meet">
        <path pathLength="1" d="M0 150 H360 V90 H620 V40 H760" />
        <path pathLength="1" d="M1600 70 H1240 V130 H980 V180 H840" />
        <path pathLength="1" d="M760 40 H840 V180" className="motif__center" />
      </svg>
      <span className="motif__crown">
        <img src="/assets/logo-crest-sm.webp" alt="" />
      </span>
    </div>
  );
}
