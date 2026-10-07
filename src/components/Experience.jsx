import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import Lines from './Lines';

const ROWS = [
  ['Rooms & Suites', 'Deep rest in rooms dressed in wood, linen and soft light.'],
  ['Dining', 'Familiar flavours, served with ceremony, morning to midnight.'],
  ['Celebrations', 'Party and conference halls for the days that matter most.'],
  ['Concierge', 'Travel desk, laundry, a doctor on call — quietly handled.']
];

export default function Experience() {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.from('.exp__row', {
      opacity: 0, y: 50, duration: 1.3, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.exp', start: 'top 80%' }
    });
  }, { scope: ref });

  return (
    <section className="experience" id="experience" ref={ref}>
      <div className="experience__head">
        <p className="eyebrow">The Experience</p>
        <Lines lines={['Crafted for', <em>the unhurried.</em>]} />
      </div>

      <ol className="exp">
        {ROWS.map(([name, note], i) => (
          <li className="exp__row" key={name}>
            <span className="exp__idx">{String(i + 1).padStart(2, '0')}</span>
            <span className="exp__name">{name}</span>
            <span className="exp__note">{note}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
