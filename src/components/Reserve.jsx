import { useRef, useState } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';
import { venues } from '../data/venues';
import Lines from './Lines';

const today = new Date().toISOString().split('T')[0];
const fmt = v => new Date(v + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

export default function Reserve() {
  const ref = useRef(null);
  const { location, setLocation } = useSite();
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const [guests, setGuests] = useState('2');
  const [message, setMessage] = useState('');

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.from('.booking > *', {
      opacity: 0, y: 30, duration: 1.2, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.booking', start: 'top 88%' }
    });
    gsap.from('.reserve__glow', {
      opacity: 0, scale: 0.7, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'center center', scrub: true }
    });
  }, { scope: ref });

  // TODO: connect to email / WhatsApp / a booking system — this only confirms on screen
  const submit = e => {
    e.preventDefault();
    if (!arrival || !departure) return setMessage('Kindly choose your arrival and departure dates.');
    if (departure <= arrival) return setMessage('Departure should be after arrival.');
    setMessage(`Thank you. Our ${location} desk will confirm your stay for ${guests}, ${fmt(arrival)} – ${fmt(departure)}.`);
  };

  return (
    <section className="reserve" id="reserve" ref={ref}>
      <div className="reserve__glow" aria-hidden="true" />
      <p className="eyebrow">Reservations</p>
      <Lines className="display display--xl" lines={['Your stay,', <em>awaits.</em>]} />

      <form className="booking" noValidate onSubmit={submit}>
        <label className="field">
          <span>Location</span>
          <select value={location} onChange={e => setLocation(e.target.value)}>
            {venues.map(v => <option key={v.id}>{v.booking}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Arrival</span>
          <input type="date" min={today} value={arrival} onChange={e => setArrival(e.target.value)} />
        </label>
        <label className="field">
          <span>Departure</span>
          <input type="date" min={arrival || today} value={departure} onChange={e => setDeparture(e.target.value)} />
        </label>
        <label className="field field--sm">
          <span>Guests</span>
          <select value={guests} onChange={e => setGuests(e.target.value)}>
            {['1', '2', '3', '4', '5+'].map(n => <option key={n}>{n}</option>)}
          </select>
        </label>
        <button type="submit" className="btn-gold" data-magnetic><span>Check availability</span></button>
      </form>
      <p className="booking__msg" role="status" aria-live="polite">{message}</p>
    </section>
  );
}
