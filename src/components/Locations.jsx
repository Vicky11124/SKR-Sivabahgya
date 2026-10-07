import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { venues } from '../data/venues';
import Lines from './Lines';
import SiteLink from './SiteLink';

/*
  Three photo boxes, one per address.
  hrefBase: '' links to sections on the same page; '/places' links across to the Places page.
*/
export default function Locations({ hrefBase = '', showHead = true }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.timeline({ scrollTrigger: { trigger: '.places', start: 'top 82%' } })
      .fromTo('.place',
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, stagger: 0.15, ease: 'expo.inOut' })
      .from('.place__media', { scale: 1.25, duration: 2, stagger: 0.15, ease: 'expo.out' }, 0.2)
      .from('.place__num, .place__text', { opacity: 0, y: 30, duration: 1.2, stagger: 0.08, ease: 'expo.out' }, 0.9);
  }, { scope: ref });

  return (
    <section className={`locations${showHead ? '' : ' locations--bare'}`} id="locations" ref={ref}>
      {showHead && (
        <div className="locations__head">
          <p className="eyebrow">Our Addresses</p>
          <Lines lines={['Three addresses.', <em>One welcome.</em>]} />
        </div>
      )}

      <div className="places">
        {venues.map(v => (
          <SiteLink to={`${hrefBase}#${v.id}`} className="place" key={v.id}>
            <span className="place__media">
              <img src={v.cover.src} alt={v.cover.alt} loading="lazy" width="900" height="1125" />
            </span>
            <span className="place__num">{v.num}</span>
            <span className="place__text">
              <span className="place__type">{v.type}</span>
              <span className="place__name">{v.name}</span>
              <span className="place__go">Explore</span>
            </span>
          </SiteLink>
        ))}
      </div>
    </section>
  );
}
