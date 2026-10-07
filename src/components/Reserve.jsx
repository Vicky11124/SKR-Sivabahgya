import { useRef, useState } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';
import { venues } from '../data/venues';
import { api } from '../lib/api';
import Lines from './Lines';

const today = new Date().toISOString().split('T')[0];
const fmt = v => new Date(v + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

export default function Reserve() {
  const ref = useRef(null);
  const { location, setLocation } = useSite();
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const [guests, setGuests] = useState('2');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  // Saved on the server as a booking request; the team sees it in the admin dashboard (/admin)
  const submit = async e => {
    e.preventDefault();
    if (sending) return;
    if (!name.trim()) return setMessage('Kindly add your name.');
    if ((phone.match(/\d/g) || []).length < 7) return setMessage('Kindly add a phone number we can reach you on.');
    if (!arrival || !departure) return setMessage('Kindly choose your arrival and departure dates.');
    if (departure <= arrival) return setMessage('Departure should be after arrival.');

    setSending(true);
    setMessage('');
    try {
      await api('/bookings', { method: 'POST', body: { name: name.trim(), phone: phone.trim(), location, arrival, departure, guests } });
      setMessage(`Thank you, ${name.trim()}. Our ${location} desk will call you to confirm your stay for ${guests}, ${fmt(arrival)} – ${fmt(departure)}.`);
      setName(''); setPhone(''); setArrival(''); setDeparture('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="reserve" id="reserve" ref={ref}>
      <div className="reserve__glow" aria-hidden="true" />
      <p className="eyebrow">Reservations</p>
      <Lines className="display display--xl" lines={['Your stay,', <em>awaits.</em>]} />

      <form className="booking" noValidate onSubmit={submit}>
        <label className="field field--name">
          <span>Your name</span>
          <input value={name} maxLength={80} onChange={e => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="field field--phone">
          <span>Phone</span>
          <input type="tel" value={phone} maxLength={30} onChange={e => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
        </label>
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
        <button type="submit" className="btn-gold" data-magnetic disabled={sending}>
          <span>{sending ? 'Sending…' : 'Request booking'}</span>
        </button>
      </form>
      <p className="booking__msg" role="status" aria-live="polite">{message}</p>
    </section>
  );
}
