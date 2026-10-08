import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { fetchReviews } from '../lib/reviews';
import { venues } from '../data/venues';
import { Stars } from './Stars';
import SiteLink from './SiteLink';

const SHOWN = 3; // latest reviews shown on the home page

/* Home-page strip: the overall score beside a few short review cards, or an invitation when there are none */
export default function Invite() {
  const ref = useRef(null);
  const [reviews, setReviews] = useState(undefined); // undefined while loading

  useEffect(() => {
    let live = true;
    fetchReviews()
      .then(list => live && setReviews(list))
      .catch(() => live && setReviews([]));
    return () => { live = false; };
  }, []);

  // Animate once the content is known, so the reveal plays on what is actually shown
  useGSAP(() => {
    if (reduceMotion || reviews === undefined) return;
    gsap.from('.invite__summary > *, .invite__card', {
      opacity: 0, y: 30, duration: 1.2, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 82%' }
    });
  }, { scope: ref, dependencies: [reviews === undefined], revertOnUpdate: true });

  if (reviews === undefined) return <section className="invite" ref={ref} />;

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  return (
    <section className={`invite${count ? '' : ' invite--empty'}`} ref={ref}>
      <div className="invite__summary">
        <p className="eyebrow">Guest Reviews</p>
        {count ? (
          <>
            <p className="invite__score">{avg.toFixed(1)}<small>/ 5</small></p>
            <Stars value={Math.round(avg * 2) / 2} label={`Average ${avg.toFixed(1)} out of 5`} />
            <p className="invite__meta">Based on {count} review{count > 1 ? 's' : ''}</p>
            <SiteLink to="/reviews" className="link-gold">Read all reviews</SiteLink>
          </>
        ) : (
          <>
            <p className="invite__text">Stayed with us? Your words help the <em>next guest</em> choose.</p>
            <SiteLink to="/reviews" className="link-gold">Share your experience</SiteLink>
          </>
        )}
      </div>

      {count > 0 && (
        <ul className="invite__cards">
          {reviews.slice(0, SHOWN).map(r => (
            <li className="invite__card" key={r.id}>
              <Stars value={r.rating} />
              <p className="invite__quote">{r.text}</p>
              <p className="invite__by">
                <b>{r.name}</b> · {venues.find(v => v.id === r.place)?.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
