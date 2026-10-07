import { useRef, useState } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { loadReviews } from '../lib/reviews';
import { venues } from '../data/venues';
import { Stars } from './Stars';
import SiteLink from './SiteLink';

/* Home-page band: shows the latest guest review if there is one, otherwise invites the first */
export default function Invite() {
  const ref = useRef(null);
  const [latest] = useState(() => loadReviews()[0]);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.from('.invite > *', {
      opacity: 0, y: 30, duration: 1.3, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' }
    });
  }, { scope: ref });

  return (
    <section className="invite" ref={ref}>
      <p className="eyebrow">Guest Reviews</p>
      {latest ? (
        <>
          <Stars value={latest.rating} />
          <blockquote className="invite__text">“{latest.text}”</blockquote>
          <p className="invite__meta">
            {latest.name} · {venues.find(v => v.id === latest.place)?.booking}
          </p>
          <SiteLink to="/reviews" className="link-gold">Read all reviews</SiteLink>
        </>
      ) : (
        <>
          <p className="invite__text">Stayed with us? Your words help the <em>next guest</em> choose.</p>
          <SiteLink to="/reviews" className="link-gold">Share your experience</SiteLink>
        </>
      )}
    </section>
  );
}
