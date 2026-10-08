import { contact } from '../data/venues';

const day = iso => new Date(`${iso}T00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/* A wa.me link to the front desk, with the guest's place, room and dates already written in */
export function whatsappLink({ location, floorName, roomName, arrival, departure, guests } = {}) {
  const lines = ['Hello SKR Sivabhagya,'];
  if (arrival && departure) {
    const room = roomName ? ` — ${roomName}${floorName ? `, ${floorName}` : ''}` : '';
    lines.push(`I'd like to book a stay at ${location}${room}, from ${day(arrival)} to ${day(departure)}${guests ? ` for ${guests} guest${guests > 1 ? 's' : ''}` : ''}.`);
  } else {
    lines.push(`I'd like to enquire about a stay${location ? ` at ${location}` : ''}.`);
  }
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}
