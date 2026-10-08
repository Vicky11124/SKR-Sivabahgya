import { useMemo, useState } from 'react';
import { addDays, nightsBetween } from '../lib/stay';

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthLabel = (y, m) => new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/*
  Two-month range picker for a stay.
  free:  rooms left each night, counted from `from` (null while loading: every night shows as open)
  need:  rooms the guest wants; nights with fewer free are shown as booked
  A booked night can still be a departure day, since the guest leaves that morning.
*/
export default function Calendar({ from, free, need = 1, arrival, departure, onChange }) {
  const [y0, m0] = from.split('-').map(Number);
  const [offset, setOffset] = useState(0); // months shown after the current one
  const last = free ? addDays(from, free.length) : addDays(from, 365); // last possible departure

  const open = day => {
    const i = nightsBetween(from, day);
    if (i < 0 || day >= last) return false;
    return !free || free[i] >= need;
  };

  // A stay is valid when every night from arrival up to departure is open
  const stayOpen = (a, d) => {
    for (let day = a; day < d; day = addDays(day, 1)) if (!open(day)) return false;
    return true;
  };

  const pick = day => {
    if (!arrival || departure || day <= arrival) {
      if (open(day)) onChange({ arrival: day, departure: '' });
      return;
    }
    if (stayOpen(arrival, day)) onChange({ arrival, departure: day });
    else if (open(day)) onChange({ arrival: day, departure: '' });
  };

  const months = useMemo(() => [0, 1].map(k => {
    const first = new Date(y0, m0 - 1 + offset + k, 1);
    const y = first.getFullYear();
    const m = first.getMonth();
    const lead = (first.getDay() + 6) % 7; // Monday first
    const count = new Date(y, m + 1, 0).getDate();
    return { y, m, lead, days: Array.from({ length: count }, (_, i) => iso(y, m, i + 1)) };
  }), [y0, m0, offset]);

  const maxOffset = 11;

  return (
    <div className="cal">
      <div className="cal__nav">
        <button type="button" onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0} aria-label="Previous month">←</button>
        <button type="button" onClick={() => setOffset(o => Math.min(maxOffset, o + 1))} disabled={offset === maxOffset} aria-label="Next month">→</button>
      </div>
      <div className="cal__months">
        {months.map(({ y, m, lead, days }) => (
          <div className="cal__month" key={`${y}-${m}`}>
            <p className="cal__title">{monthLabel(y, m)}</p>
            <div className="cal__grid" role="grid">
              {WEEK.map(w => <span className="cal__dow" key={w}>{w}</span>)}
              {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} />)}
              {days.map(day => {
                const past = day < from;
                const isOpen = open(day);
                // a booked night is still selectable as the departure that closes a valid stay
                const canLeave = arrival && !departure && day > arrival && stayOpen(arrival, day);
                const inRange = arrival && departure && day > arrival && day < departure;
                const cls = [
                  'cal__day',
                  past && 'is-past',
                  !past && !isOpen && 'is-full',
                  canLeave && !isOpen && 'is-leave',
                  inRange && 'is-range',
                  day === arrival && 'is-start',
                  day === departure && 'is-end'
                ].filter(Boolean).join(' ');
                return (
                  <button
                    type="button"
                    key={day}
                    className={cls}
                    disabled={past || (!isOpen && !canLeave)}
                    onClick={() => pick(day)}
                    aria-pressed={day === arrival || day === departure}
                    aria-label={`${new Date(day + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}${!past && !isOpen ? ', booked' : ''}`}
                  >
                    {Number(day.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="cal__legend">
        <span><i className="is-sel" />Your stay</span>
        <span><i className="is-full" />Booked</span>
        <span className="cal__hint">{!arrival || departure ? 'Choose your arrival day' : 'Now choose your departure day'}</span>
      </div>
    </div>
  );
}
