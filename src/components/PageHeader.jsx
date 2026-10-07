import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';
import Lines from './Lines';

/*
  Opening block for inner pages; plays once the page-change curtain has lifted.
  hero: fills the first screen and sits low and centred, for pages with a photo backdrop.
*/
export default function PageHeader({ eyebrow, lines, intro, compact = false, hero = false }) {
  const ref = useRef(null);
  const { transitioning } = useSite();

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.timeline({ delay: transitioning ? 1.05 : 0.3 })
      .from('.eyebrow', { opacity: 0, x: hero ? 0 : -20, y: hero ? 12 : 0, duration: 1.2, ease: 'expo.out' })
      .from('.line-mask > span', { yPercent: 110, duration: 1.5, stagger: 0.12, ease: 'expo.out' }, 0.05)
      .from('.page-head__intro, .page-head__cue', { opacity: 0, y: 24, duration: 1.2, stagger: 0.15, ease: 'expo.out' }, 0.35);
  }, { scope: ref });

  const variant = hero ? ' page-head--hero' : compact ? ' page-head--compact' : '';

  return (
    <header className={`page-head${variant}`} ref={ref}>
      <p className="eyebrow">{eyebrow}</p>
      <Lines as="h1" lines={lines} />
      {intro && <p className="page-head__intro">{intro}</p>}
      {hero && <span className="page-head__cue" aria-hidden="true"><i /></span>}
    </header>
  );
}
