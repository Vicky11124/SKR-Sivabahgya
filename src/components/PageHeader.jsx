import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';
import Lines from './Lines';

/* Opening block for inner pages; plays once the page-change curtain has lifted */
export default function PageHeader({ eyebrow, lines, intro, compact = false }) {
  const ref = useRef(null);
  const { transitioning } = useSite();

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.timeline({ delay: transitioning ? 1.05 : 0.3 })
      .from('.eyebrow', { opacity: 0, x: -20, duration: 1.2, ease: 'expo.out' })
      .from('.line-mask > span', { yPercent: 110, duration: 1.5, stagger: 0.12, ease: 'expo.out' }, 0.05)
      .from('.page-head__intro', { opacity: 0, y: 24, duration: 1.2, ease: 'expo.out' }, 0.35);
  }, { scope: ref });

  return (
    <header className={`page-head${compact ? ' page-head--compact' : ''}`} ref={ref}>
      <p className="eyebrow">{eyebrow}</p>
      <Lines as="h1" lines={lines} />
      {intro && <p className="page-head__intro">{intro}</p>}
    </header>
  );
}
