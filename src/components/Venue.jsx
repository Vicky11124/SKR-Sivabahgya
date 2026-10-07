import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import SiteLink from './SiteLink';
import Gallery from './Gallery';

export default function Venue({ venue }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 75%' } })
      .from('.venue__num', { opacity: 0, x: -40, duration: 1.6, ease: 'expo.out' })
      .from('.venue__name, .venue__type', { opacity: 0, y: 50, duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 0.1)
      .from('.venue__desc, .venue__facts > div, .venue__actions', { opacity: 0, y: 24, duration: 1.2, stagger: 0.07, ease: 'expo.out' }, 0.25)
      .from('.gallery__head', { opacity: 0, duration: 1 }, 0.5);
  }, { scope: ref });

  return (
    <section className="venue" id={venue.id} ref={ref}>
      <div className="venue__intro">
        <div className="venue__title">
          <span className="venue__num" aria-hidden="true">{venue.num}</span>
          <p className="eyebrow">{venue.area}</p>
          <h2 className="venue__name">{venue.name}</h2>
          <p className="venue__type">{venue.type}</p>
        </div>

        <div className="venue__info">
          <p className="venue__desc">{venue.desc}</p>
          <dl className="venue__facts">
            {venue.facts.map(([term, detail]) => (
              <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>
            ))}
          </dl>
          <div className="venue__actions">
            <SiteLink to="#reserve" location={venue.booking} className="link-gold">Reserve here</SiteLink>
            <a href={venue.directions} target="_blank" rel="noopener" className="link-quiet">Directions</a>
          </div>
        </div>
      </div>

      <Gallery venue={venue} />
    </section>
  );
}
