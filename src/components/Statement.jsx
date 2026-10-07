import { Fragment, useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';

const TEXT = 'Some places are built to be visited. Ours were built to be remembered — mist over the Palani Hills, the temple city at your doorstep, and service that never asks to be noticed.';

export default function Statement() {
  const ref = useRef(null);

  /* Words light up one by one as you read */
  useGSAP(() => {
    if (reduceMotion) return;
    gsap.fromTo('.word', { opacity: 0.14 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: '.statement__text', start: 'top 78%', end: 'bottom 45%', scrub: true }
    });
  }, { scope: ref });

  return (
    <section className="statement" id="story" ref={ref}>
      <p className="eyebrow">The House of Sivabhagya</p>
      <p className="statement__text">
        {TEXT.split(' ').map((word, i) => (
          <Fragment key={i}><span className="word">{word}</span>{' '}</Fragment>
        ))}
      </p>
    </section>
  );
}
