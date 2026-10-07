import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { venues } from '../data/venues';
import { placePath } from '../data/pages';
import Lines from './Lines';
import SiteLink from './SiteLink';

/*
  Photo boxes, one per address, each opening that place's own page.
  exclude: hide one place (used for "other addresses" on a place page).
*/
export default function Locations({
  exclude,
  showHead = true,
  eyebrow = 'Our Addresses',
  lines = ['Three addresses.', <em>One welcome.</em>]
}) {
  const ref = useRef(null);
  const list = venues.filter(v => v.id !== exclude);

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
          <p className="eyebrow">{eyebrow}</p>
          <Lines lines={lines} />
        </div>
      )}

      <div className={`places${list.length === 2 ? ' places--pair' : ''}`}>
        {list.map(v => (
          <SiteLink to={placePath(v.id)} className="place" key={v.id}>
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
