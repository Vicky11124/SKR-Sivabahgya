import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import Lines from './Lines';

/* Home: what every guest can count on, each with a thin gold line icon that draws itself in */
const PROMISES = [
  {
    title: 'Nothing to pay to reserve',
    text: 'Send a request and our desk calls you to confirm — before a single rupee changes hands.',
    icon: <><rect pathLength="1" x="3" y="6" width="18" height="13" rx="2" /><path pathLength="1" d="M3 10h18" /><path pathLength="1" d="M8.5 15l2 2 4-4" /></>
  },
  {
    title: 'A person, not a portal',
    text: 'Call or WhatsApp the front desk directly. A real voice answers, and remembers you next time.',
    icon: <path pathLength="1" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  },
  {
    title: 'The whole price, upfront',
    text: 'Room rate and GST are shown before you send a request. What you see is what we quote.',
    icon: <><path pathLength="1" d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" /><path pathLength="1" d="M9 8h6M9 12h6M9 16h3" /></>
  },
  {
    title: 'Care, close at hand',
    text: 'A travel desk, laundry and a doctor on call in Madurai — so the small things are never your worry.',
    icon: <><path pathLength="1" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /><path pathLength="1" d="M12 9.5v5M9.5 12h5" /></>
  }
];

export default function OurPromise() {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.set('.promise__icon :is(path, rect)', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.timeline({ scrollTrigger: { trigger: '.promise__grid', start: 'top 78%' } })
      .from('.promise__card', { opacity: 0, y: 60, duration: 1.3, stagger: 0.12, ease: 'expo.out' })
      .to('.promise__icon :is(path, rect)', { strokeDashoffset: 0, duration: 1.4, stagger: 0.08, ease: 'power2.inOut' }, 0.4);
  }, { scope: ref });

  return (
    <section className="promise" ref={ref}>
      <div className="promise__glow" aria-hidden="true" />
      <div className="promise__head">
        <p className="eyebrow">Our Promise</p>
        <Lines lines={['Kept,', <em>every stay.</em>]} />
      </div>

      <ol className="promise__grid">
        {PROMISES.map((p, i) => (
          <li className="promise__card" key={p.title}>
            <span className="promise__num">{String(i + 1).padStart(2, '0')}</span>
            <svg className="promise__icon" viewBox="0 0 24 24" aria-hidden="true">{p.icon}</svg>
            <h3 className="promise__title">{p.title}</h3>
            <p className="promise__text">{p.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
