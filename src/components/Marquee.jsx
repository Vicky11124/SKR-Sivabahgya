import { Fragment, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, reduceMotion } from '../motion';

const WORDS = ['Sivabhagya', 'Kodaikanal', 'Madurai', 'Hospitality'];

export default function Marquee() {
  const ref = useRef(null);

  /* Leans with scroll speed */
  useGSAP(() => {
    if (reduceMotion) return;
    const skew = gsap.quickTo('.marquee__track', 'skewX', { duration: 0.6, ease: 'power3.out' });
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: self => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -300))
    });
  }, { scope: ref });

  return (
    <div className="marquee" ref={ref} aria-hidden="true">
      <div className="marquee__track">
        {[...WORDS, ...WORDS].map((word, i) => (
          <Fragment key={i}><span>{word}</span><i>✦</i></Fragment>
        ))}
      </div>
    </div>
  );
}
