import { useState } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';

/* Black curtain with a gold line that splits open, then brings the landing stage in */
export default function Intro({ onDone }) {
  const [gone, setGone] = useState(reduceMotion);

  useGSAP(() => {
    if (reduceMotion) return;
    const chars = gsap.utils.toArray('.hero__name .char');

    gsap.set('.hero__logo', { opacity: 0, scale: 1.12, filter: 'blur(14px)' });
    gsap.set(chars, { opacity: 0, yPercent: 60, filter: 'blur(8px)' });
    gsap.set(['.hero__pre', '.hero__tag', '.hero__foot'], { opacity: 0, y: 16 });
    gsap.set('.nav', { opacity: 0, y: -20 });
    gsap.set('.hero__glow', { opacity: 0, scale: 0.6 });

    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to('.loader__mark', { opacity: 1, duration: 0.8, ease: 'power2.out' })
      .to('.loader__line', { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, '<0.1')
      .to('.loader__mark', { opacity: 0, y: -10, duration: 0.5, ease: 'power2.in' }, '-=0.2')
      .to('.loader__line', { opacity: 0, duration: 0.4 }, '<0.2')
      .to('.loader__half--top', { yPercent: -100, duration: 1.4, ease: 'expo.inOut' }, '<')
      .to('.loader__half--bottom', { yPercent: 100, duration: 1.4, ease: 'expo.inOut' }, '<')
      .to('.hero__glow', { opacity: 1, scale: 1, duration: 2.4, ease: 'power2.out' }, '<0.4')
      .to('.hero__logo', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2.2, clearProps: 'filter' }, '<0.1')
      .to('.hero__pre', { opacity: 1, y: 0, duration: 1.2 }, '<0.7')
      .to(chars, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.4, stagger: 0.06, clearProps: 'filter' }, '<0.1')
      .to(['.hero__tag', '.hero__foot'], { opacity: 1, y: 0, duration: 1.2, stagger: 0.12 }, '<0.6')
      .to('.nav', { opacity: 1, y: 0, duration: 1.2 }, '<')
      .add(() => setGone(true))
      .add(onDone, 2.8); // let visitors scroll as soon as the curtain has opened
  }, []);

  if (gone) return null;

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader__half loader__half--top" />
      <div className="loader__half loader__half--bottom" />
      <div className="loader__line" />
      <span className="loader__mark">SKR</span>
    </div>
  );
}
