import { useMemo, useRef, useState } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';
import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import { Stars, StarInput } from '../components/Stars';
import { venues } from '../data/venues';
import { loadReviews, saveReviews, newId } from '../lib/reviews';

const MAX = 600;
const venueName = id => venues.find(v => v.id === id)?.booking ?? '';
const when = iso => new Date(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

function Summary({ reviews }) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  return (
    <div className="summary">
      <div className="summary__top">
        <span className="summary__score">{count ? avg.toFixed(1) : '—'}</span>
        <div>
          <Stars value={count ? Math.round(avg * 2) / 2 : 0} label={count ? `Average ${avg.toFixed(1)} out of 5` : 'No ratings yet'} />
          <p className="summary__count">{count ? `${count} review${count > 1 ? 's' : ''}` : 'No reviews yet'}</p>
        </div>
      </div>
      <ul className="dist" aria-label="Ratings breakdown">
        {[5, 4, 3, 2, 1].map(n => {
          const c = reviews.filter(r => r.rating === n).length;
          return (
            <li key={n}>
              <span>{n}</span>
              <span className="dist__bar"><i style={{ transform: `scaleX(${count ? c / count : 0})` }} /></span>
              <span>{c}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewForm({ onAdd }) {
  const [name, setName] = useState('');
  const [place, setPlace] = useState(venues[0].id);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');

  const submit = e => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = 'Please add your name.';
    if (!rating) next.rating = 'Please choose a rating.';
    if (text.trim().length < 10) next.text = 'A few more words, please (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus('');
      return;
    }

    const saved = onAdd({
      id: newId(),
      name: name.trim().slice(0, 60),
      place,
      rating,
      text: text.trim().slice(0, MAX),
      date: new Date().toISOString()
    });
    setName(''); setRating(0); setText('');
    setStatus(saved ? 'Thank you — your review is now live.' : 'Thank you — your review is shown, but this browser could not save it.');
  };

  return (
    <form className="rform" onSubmit={submit} noValidate>
      <p className="rform__title">Write a review</p>

      <div className="rform__row">
        <label className="field">
          <span>Your name</span>
          <input value={name} maxLength={60} onChange={e => setName(e.target.value)} aria-invalid={!!errors.name} autoComplete="name" />
          {errors.name && <em className="field__error">{errors.name}</em>}
        </label>
        <label className="field">
          <span>Stayed at</span>
          <select value={place} onChange={e => setPlace(e.target.value)}>
            {venues.map(v => <option key={v.id} value={v.id}>{v.booking}</option>)}
          </select>
        </label>
      </div>

      <div className="field">
        <span>Rating</span>
        <StarInput value={rating} onChange={setRating} invalid={!!errors.rating} />
        {errors.rating && <em className="field__error">{errors.rating}</em>}
      </div>

      <label className="field">
        <span>Your review</span>
        <textarea
          rows={4}
          value={text}
          maxLength={MAX}
          onChange={e => setText(e.target.value)}
          aria-invalid={!!errors.text}
          placeholder="What made your stay memorable?"
        />
        {errors.text && <em className="field__error">{errors.text}</em>}
      </label>

      <div className="rform__foot">
        <span className="rform__count">{text.length} / {MAX}</span>
        <button type="submit" className="btn-gold" data-magnetic><span>Post review</span></button>
      </div>
      <p className="rform__status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}

export default function Reviews() {
  const ref = useRef(null);
  const { scrollToTarget } = useSite();
  const [reviews, setReviews] = useState(loadReviews);
  const [filter, setFilter] = useState('all');
  const [fresh, setFresh] = useState(null); // id of the review just added

  const shown = useMemo(
    () => (filter === 'all' ? reviews : reviews.filter(r => r.place === filter)),
    [reviews, filter]
  );

  const add = review => {
    const next = [review, ...reviews];
    setReviews(next);
    setFilter('all');
    setFresh(review.id);
    return saveReviews(next);
  };

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.from('.reviews__side, .reviews__main', {
      opacity: 0, y: 40, duration: 1.3, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%' }
    });
  }, { scope: ref });

  // Newly posted review glides in at the top of the list (and into view, if it's off-screen)
  useGSAP(() => {
    if (!fresh) return;
    const el = ref.current.querySelector(`[data-review="${fresh}"]`);
    const { top, bottom } = el.getBoundingClientRect();
    if (top < 80 || bottom > innerHeight) scrollToTarget(el, -140);
    if (reduceMotion) return;
    gsap.from(el, { opacity: 0, y: -18, duration: 1, ease: 'expo.out', delay: 0.2 });
  }, { scope: ref, dependencies: [fresh] });

  return (
    <Page>
      <PageHeader
        compact
        eyebrow="Guest Reviews"
        lines={['In their', <em>own words.</em>]}
        intro="Stayed with us? Tell future guests what it was like."
      />

      <section className="reviews" ref={ref}>
        <aside className="reviews__side">
          <Summary reviews={reviews} />
          <ReviewForm onAdd={add} />
        </aside>

        <div className="reviews__main">
          <div className="rfilter" role="tablist" aria-label="Filter reviews by place">
            {[{ id: 'all', booking: 'All' }, ...venues].map(v => (
              <button
                key={v.id}
                role="tab"
                aria-selected={filter === v.id}
                className={filter === v.id ? 'is-active' : undefined}
                onClick={() => setFilter(v.id)}
              >
                {v.id === 'all' ? 'All' : v.name}
              </button>
            ))}
          </div>

          {shown.length ? (
            <ol className="rlist">
              {shown.map(r => (
                <li className="review" key={r.id} data-review={r.id}>
                  <div className="review__top">
                    <Stars value={r.rating} />
                    <time dateTime={r.date}>{when(r.date)}</time>
                  </div>
                  <p className="review__text">{r.text}</p>
                  <p className="review__meta"><span>{r.name}</span> · {venueName(r.place)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rempty">
              <img src="/assets/logo-crest-sm.webp" alt="" />
              <p className="rempty__title">
                {reviews.length ? 'No reviews for this place yet.' : 'No reviews yet.'}
              </p>
              <p className="rempty__note">Your words could be the first a future guest reads.</p>
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}
