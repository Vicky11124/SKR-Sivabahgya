import { useEffect, useState } from 'react';
import { fetchAvailability } from '../lib/availability';
import { addDays } from '../lib/stay';

const day = iso => new Date(`${iso}T00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

/* Live note on a place page: free tonight, or when it is next free (from the booking calendar) */
export default function Availability({ venue }) {
  const [text, setText] = useState('');

  useEffect(() => {
    let live = true;
    setText('');
    fetchAvailability(venue.id).then(({ from, free }) => {
      const lists = Object.values(free);
      const freeOn = i => lists.some(nights => nights[i] > 0);
      const single = lists.length === 1 && venue.inventory[0] && Object.values(venue.inventory[0].rooms)[0] === 1;
      let note;
      if (freeOn(0)) note = single ? 'Available from tonight' : 'Rooms available tonight';
      else {
        const next = lists[0].findIndex((_, i) => freeOn(i));
        note = next < 0
          ? 'Fully booked — enquire for later dates'
          : `${single ? 'Occupied' : 'Fully booked'} until ${day(addDays(from, next))} — free from then`;
      }
      if (live) setText(note);
    }).catch(() => {});
    return () => { live = false; };
  }, [venue]);

  if (!text) return null;
  return <p className="venue__notice"><i aria-hidden="true" />{text}</p>;
}
