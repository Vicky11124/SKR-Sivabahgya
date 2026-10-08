import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';
import { venues, rupees } from '../data/venues';
import { api } from '../lib/api';
import { fetchAvailability } from '../lib/availability';
import { freeForStay, nightsBetween, quote, todayIST, unitKey } from '../lib/stay';
import { whatsappLink } from '../lib/whatsapp';
import Lines from './Lines';
import Calendar from './Calendar';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const fmt = v => new Date(v + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const fmtLong = v => new Date(v + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* A − n + stepper */
function Stepper({ label, note, value, min, max, onChange }) {
  return (
    <div className="rv-count">
      <div>
        <span className="rv-count__label">{label}</span>
        {note && <span className="rv-count__note">{note}</span>}
      </div>
      <div className="rv-count__ctl">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>+</button>
      </div>
    </div>
  );
}

/* One chapter of the reservation: a header that shows the choice made, and a body that opens when active */
function Step({ n, title, value, open, done, onOpen, children }) {
  return (
    <section className={`rv-step${open ? ' is-open' : ''}${done ? ' is-done' : ''}`}>
      <button type="button" className="rv-step__head" onClick={onOpen} aria-expanded={open}>
        <span className="rv-step__num">{n}</span>
        <span className="rv-step__title">{title}</span>
        <span className="rv-step__value">{value}</span>
        <span className="rv-step__edit" aria-hidden="true">{open ? '' : done ? 'Change' : ''}</span>
      </button>
      <div className="rv-step__body" inert={!open}>
        <div className="rv-step__inner">{children}</div>
      </div>
    </section>
  );
}

export default function Reserve() {
  const ref = useRef(null);
  const route = useLocation();
  const { location, setLocation, setStay } = useSite();
  const venue = venues.find(v => v.booking === location) ?? venues[0];
  const multiFloor = venue.inventory.length > 1;

  const [floorId, setFloorId] = useState(venue.inventory[0].id);
  const [roomId, setRoomId] = useState(Object.keys(venue.inventory[0].rooms)[0]);
  const [dates, setDates] = useState({ arrival: '', departure: '' });
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [avail, setAvail] = useState(null); // { from, free } for the current place
  // On a place's own page the place is already chosen, so start one step in
  const [open, setOpen] = useState(() => (route.pathname.startsWith('/places/') ? (multiFloor ? 'floor' : 'room') : 'place'));
  const [touched, setTouched] = useState(() => new Set(route.pathname.startsWith('/places/') ? ['place'] : []));

  // A new place starts on its first floor and room type
  useEffect(() => {
    const floor = venue.inventory[0];
    setFloorId(floor.id);
    setRoomId(Object.keys(floor.rooms)[0]);
    setRooms(1);
    setGuests(g => Math.min(g, venue.rooms[0].sleeps));
  }, [venue]);

  // Only the latest request may set the data, so a slow answer for a previous place can't overwrite it
  const latest = useRef(0);
  const loadAvailability = (fresh = false) => {
    const ticket = ++latest.current;
    setAvail(null);
    fetchAvailability(venue.id, { fresh })
      .then(data => ticket === latest.current && setAvail(data))
      .catch(() => ticket === latest.current && setAvail({ error: true }));
  };
  useEffect(() => { loadAvailability(); }, [venue.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const floor = venue.inventory.find(f => f.id === floorId) ?? venue.inventory[0];
  const room = venue.rooms.find(r => r.id === roomId && floor.rooms[r.id]) ?? venue.rooms.find(r => floor.rooms[r.id]);
  const count = floor.rooms[room.id];
  const { arrival, departure } = dates;
  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;
  const from = avail?.from ?? todayIST();
  const free = avail?.free?.[unitKey(floor.id, room.id)] ?? null;
  const nightWord = venue.id === 'kochadai' ? 'day' : 'night';

  // How many of this room are free for the chosen dates (all of them until dates are picked)
  const freeFor = (fId, rId) => {
    const total = venue.inventory.find(f => f.id === fId).rooms[rId];
    if (!nights || !avail?.free) return total;
    return freeForStay(avail.free[unitKey(fId, rId)], from, arrival, departure);
  };
  const left = freeFor(floor.id, room.id);
  const maxRooms = Math.max(1, Math.min(count, left || count));
  const fits = rooms * room.sleeps >= guests;
  const price = nights ? quote(room.price, rooms, nights) : null;
  const gstPct = Math.round((price?.gstRate ?? (room.price <= 7500 ? 0.05 : 0.18)) * 100);

  // Keep the counts sensible when the room or dates change
  useEffect(() => { setRooms(r => Math.min(Math.max(1, r), maxRooms)); }, [maxRooms]);

  const changeGuests = n => {
    const g = Math.max(1, Math.min(n, maxRooms * room.sleeps));
    setGuests(g);
    setRooms(r => Math.max(r, Math.min(maxRooms, Math.ceil(g / room.sleeps))));
  };

  const go = (done, next) => {
    setTouched(t => new Set(t).add(done));
    setOpen(next);
    setMessage('');
  };

  const choosePlace = v => {
    setLocation(v.booking);
    go('place', v.inventory.length > 1 ? 'floor' : 'room');
  };
  const chooseFloor = f => {
    setFloorId(f.id);
    if (!f.rooms[roomId]) setRoomId(Object.keys(f.rooms)[0]);
    go('floor', 'room');
  };
  const chooseDates = d => {
    setDates(d);
    setMessage('');
    if (d.arrival && d.departure) go('dates', 'guest');
  };

  // Shared with the floating WhatsApp button, so its message carries this stay
  useEffect(() => {
    setStay({ location: venue.booking, floorName: multiFloor ? floor.name : '', roomName: room.name, arrival, departure, guests });
  }, [venue, multiFloor, floor, room, arrival, departure, guests, setStay]);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.timeline({ scrollTrigger: { trigger: '.rv', start: 'top 82%' } })
      .fromTo('.rv', { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .from('.rv__photos', { scale: 1.2, duration: 2.2, ease: 'expo.out' }, 0.2)
      .from('.rv__visual-head > *, .rv-folio', { opacity: 0, y: 24, duration: 1.2, stagger: 0.08, ease: 'expo.out' }, 0.8)
      .from('.rv-step', { opacity: 0, x: 30, duration: 1.1, stagger: 0.07, ease: 'expo.out' }, 0.7);
    gsap.from('.reserve__glow', {
      opacity: 0, scale: 0.7, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'center center', scrub: true }
    });
  }, { scope: ref });

  // Saved on the server as a booking request; the team confirms it from the admin dashboard (/admin)
  const submit = async e => {
    e.preventDefault();
    if (sending) return;
    if (!arrival || !departure) { setOpen('dates'); return setMessage('Kindly choose your arrival and departure days.'); }
    if (left < rooms) { setOpen('dates'); return setMessage('This room is not free for all of those nights. Try other dates or another floor.'); }
    if (!fits) { setOpen('room'); return setMessage(`${room.name} sleeps ${room.sleeps} — kindly add a room for ${guests} guests.`); }
    if (!name.trim()) return setMessage('Kindly add your name.');
    if ((phone.match(/\d/g) || []).length < 7) return setMessage('Kindly add a phone number we can reach you on.');

    setSending(true);
    setMessage('');
    try {
      await api('/bookings', {
        method: 'POST',
        body: { name: name.trim(), phone: phone.trim(), place: venue.id, floor: floor.id, room: room.id, rooms, guests, arrival, departure }
      });
      setMessage(`Thank you, ${name.trim()}. Our ${venue.name} desk will call you shortly to confirm your ${room.name.toLowerCase()} for ${fmt(arrival)} – ${fmt(departure)}.`);
      setName(''); setPhone(''); setDates({ arrival: '', departure: '' });
    } catch (err) {
      setMessage(err.message);
      if (err.status === 409) { loadAvailability(true); setOpen('dates'); }
    } finally {
      setSending(false);
    }
  };

  const floorRooms = venue.rooms.filter(r => floor.rooms[r.id]);
  const fromPrice = f => Math.min(...venue.rooms.filter(r => f.rooms[r.id]).map(r => r.price));

  const steps = [
    { id: 'place', title: 'The place', value: venue.name },
    multiFloor && { id: 'floor', title: 'The floor', value: floor.name },
    { id: 'room', title: multiFloor ? 'The room' : 'The stay', value: `${room.name} · ${plural(guests, 'guest')}` },
    { id: 'dates', title: 'The dates', value: nights ? `${fmt(arrival)} – ${fmt(departure)}` : '' },
    { id: 'guest', title: 'Your details', value: name.trim() }
  ].filter(Boolean);
  // a place without floors has no floor step: open the room instead
  const current = open === 'floor' && !multiFloor ? 'room' : open;

  const body = id => {
    if (id === 'place') return (
      <div className="rv-places">
        {venues.map(v => (
          <button type="button" key={v.id} className={`rv-place${v.id === venue.id ? ' is-on' : ''}`} aria-pressed={v.id === venue.id} onClick={() => choosePlace(v)}>
            <img src={v.cover.src} alt="" loading="lazy" />
            <span className="rv-place__text">
              <small>{v.type}</small>
              <b>{v.name}</b>
              <em>from {rupees(Math.min(...v.rooms.map(r => r.price)))}</em>
            </span>
          </button>
        ))}
      </div>
    );

    if (id === 'floor') return (
      // top floor first, like a building's directory
      <ol className="rv-floors">
        {[...venue.inventory].reverse().map(f => {
          const total = Object.values(f.rooms).reduce((a, b) => a + b, 0);
          return (
            <li key={f.id}>
              <button type="button" className={f.id === floor.id ? 'is-on' : undefined} aria-pressed={f.id === floor.id} onClick={() => chooseFloor(f)}>
                <span className="rv-floors__name">{f.name}</span>
                <span className="rv-floors__types">{venue.rooms.filter(r => f.rooms[r.id]).map(r => r.name).join(' · ')}</span>
                <i aria-hidden="true" />
                <span className="rv-floors__meta">{plural(total, 'room')} · from {rupees(fromPrice(f))}</span>
              </button>
            </li>
          );
        })}
      </ol>
    );

    if (id === 'room') return (
      <>
        <div className="rv-rooms">
          {floorRooms.map(r => {
            const n = freeFor(floor.id, r.id);
            const full = nights > 0 && avail?.free && n === 0;
            return (
              <button
                type="button"
                key={r.id}
                className={['rv-room', r.id === room.id && 'is-on', full && 'is-full'].filter(Boolean).join(' ')}
                aria-pressed={r.id === room.id}
                onClick={() => { setRoomId(r.id); setMessage(''); }}
              >
                <span className="rv-room__name">{r.name}</span>
                <span className="rv-room__note">{r.note}</span>
                <span className="rv-room__price">{rupees(r.price)}<small>{r.unit}</small></span>
                <span className="rv-room__meta">
                  Sleeps {r.sleeps} ·{' '}
                  {nights && avail?.free
                    ? (full ? 'booked for your dates' : floor.rooms[r.id] === 1 ? 'free for your dates' : `${n} free for your dates`)
                    : floor.rooms[r.id] === 1 && !multiFloor ? 'the entire place' : `${plural(floor.rooms[r.id], 'room')} on this floor`}
                </span>
              </button>
            );
          })}
        </div>
        <div className="rv-counts">
          <Stepper label="Guests" note={`${room.name} sleeps ${room.sleeps}`} value={guests} min={1} max={maxRooms * room.sleeps} onChange={changeGuests} />
          {count > 1 && <Stepper label="Rooms" note={`${count} on this floor`} value={rooms} min={Math.ceil(guests / room.sleeps)} max={maxRooms} onChange={n => setRooms(Math.max(1, Math.min(n, maxRooms)))} />}
        </div>
        <button type="button" className="rv-next" onClick={() => go('room', 'dates')}>Continue to dates <i aria-hidden="true">→</i></button>
      </>
    );

    if (id === 'dates') return (
      <>
        {avail?.error && <p className="rv-note">Live availability could not be loaded — you can still send a request and the desk will confirm.</p>}
        <Calendar from={from} free={free} need={rooms} arrival={arrival} departure={departure} onChange={chooseDates} />
        {nights > 0 && left < rooms && <p className="rv-warn">Not free for all these nights — try other dates or another floor.</p>}
      </>
    );

    return (
      <div className="rv-guest">
        <div className="rv-guest__fields">
          <label className="field">
            <span>Your name</span>
            <input value={name} maxLength={80} onChange={e => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="field">
            <span>Phone</span>
            <input type="tel" value={phone} maxLength={30} onChange={e => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
          </label>
        </div>
        <div className="rv-guest__send">
          <button type="submit" className="btn-gold" disabled={sending}>
            <span>{sending ? 'Sending…' : price ? `Request booking · ${rupees(price.total)}` : 'Request booking'}</span>
          </button>
          <a className="rv-wa" target="_blank" rel="noopener" href={whatsappLink({ location: venue.booking, floorName: multiFloor ? floor.name : '', roomName: room.name, arrival, departure, guests })}>
            or reserve on WhatsApp
          </a>
        </div>
        <p className="rv-fine">No payment now — the desk calls to confirm. Final bill may vary.</p>
      </div>
    );
  };

  return (
    <section className="reserve" id="reserve" ref={ref}>
      <div className="reserve__glow" aria-hidden="true" />
      <p className="eyebrow">Reservations</p>
      <Lines className="display display--xl" lines={['Your stay,', <em>awaits.</em>]} />

      <form className="rv" noValidate onSubmit={submit}>
        {/* The place, in pictures, with the running folio */}
        <aside className="rv__visual">
          <div className="rv__photos" aria-hidden="true">
            {venues.map(v => <img key={v.id} src={v.cover.src} alt="" className={v.id === venue.id ? 'is-on' : undefined} loading="lazy" />)}
          </div>
          <div className="rv__visual-head">
            <p className="rv__eyebrow">Reserving at</p>
            <p className="rv__name" key={venue.id}>{venue.name}</p>
            <p className="rv__type">{venue.type} · {venue.area.split(' · ')[0]}</p>
          </div>

          <div className="rv-folio" aria-live="polite">
            <div className="rv-folio__row"><span>Room</span><i /><b>{room.name}{rooms > 1 ? ` × ${rooms}` : ''}</b></div>
            {multiFloor && <div className="rv-folio__row"><span>Floor</span><i /><b>{floor.name}</b></div>}
            <div className="rv-folio__row"><span>Arrival</span><i /><b>{arrival ? fmtLong(arrival) : '—'}</b></div>
            <div className="rv-folio__row"><span>Departure</span><i /><b>{departure ? fmtLong(departure) : '—'}</b></div>
            <div className="rv-folio__row"><span>Guests</span><i /><b>{guests}</b></div>
            <div className="rv-folio__rule" />
            <div className="rv-folio__row rv-folio__row--sm">
              <span>{rupees(room.price)} × {nights ? plural(nights, nightWord) : `per ${nightWord}`}{rooms > 1 ? ` × ${rooms}` : ''}</span><i /><b>{price ? rupees(price.subtotal) : '—'}</b>
            </div>
            <div className="rv-folio__row rv-folio__row--sm"><span>GST {gstPct}%</span><i /><b>{price ? rupees(price.gst) : '—'}</b></div>
            <div className="rv-folio__total">
              <span>Estimated total</span>
              <b className={price ? undefined : 'is-empty'}>{price ? rupees(price.total) : 'Select your dates'}</b>
            </div>
          </div>
        </aside>

        {/* The reservation, chapter by chapter */}
        <div className="rv__flow">
          {steps.map((s, i) => (
            <Step
              key={s.id}
              n={ROMAN[i]}
              title={s.title}
              value={s.value}
              open={current === s.id}
              done={touched.has(s.id) || (s.id === 'dates' && nights > 0)}
              onOpen={() => setOpen(s.id)}
            >
              {body(s.id)}
            </Step>
          ))}
          <p className="booking__msg" role="status" aria-live="polite">{message}</p>
        </div>
      </form>
    </section>
  );
}
