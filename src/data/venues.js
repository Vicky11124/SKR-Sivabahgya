import { kodaikanalPhotos, arapalayamPhotos, kochadaiPhotos } from './photos';

const maps = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/*
  Each place:
  - stats:   three headline figures shown under the description
  - facts:   the details list beside the map
  - floors:  how the building is laid out (optional)
  - rooms:   room types and rates
  - pin:     map position. These are the neighbourhood centres from OpenStreetMap —
             replace with the exact building coordinates (right-click the spot in
             Google Maps to copy them) for a precise pin.
*/
export const venues = [
  {
    id: 'kodaikanal',
    num: 'I',
    name: 'Kodaikanal',
    area: 'Kodaikanal · Vilpatti',
    type: 'Adventure Resort',
    booking: 'Kodaikanal',
    cover: { src: '/assets/gallery/kodaikanal/cover.webp', alt: 'Dining room at the Kodaikanal resort with a wide view of the hills' },
    desc: 'High in the Palani Hills at Vilpatti, the resort looks out over eucalyptus forest and drifting mist. Rooms open to the valley, the dining hall frames the mountains, and the lawns invite slow, cool mornings.',
    stats: [['10', 'Rooms'], ['G + 2', 'Floors'], ['₹6,000', 'Rooms from']],
    facts: [
      ['Setting', 'Hillside at Vilpatti, with panoramic valley views'],
      ['Dining', 'In-house restaurant with mountain-facing windows'],
      ['Grounds', 'Open lawns, lounge & covered parking']
    ],
    floors: [
      ['Ground floor', 'Reception, dining & lounge'],
      ['First floor', '4 rooms — all twin bedrooms'],
      ['Second floor', '6 bedrooms']
    ],
    rooms: [
      { name: 'Suite', note: 'Our most spacious rooms, with room to spread out', price: 12000, unit: 'per night' },
      { name: 'Deluxe Room', note: 'Comfortable rooms in wood, linen & soft light', price: 6000, unit: 'per night' }
    ],
    pin: { lat: 10.2696, lng: 77.5043, label: 'Vilpatti, Kodaikanal' },
    directions: maps('Vilpatti, Kodaikanal, Tamil Nadu'),
    photos: kodaikanalPhotos
  },
  {
    id: 'arapalayam',
    num: 'II',
    name: 'Arapalayam',
    area: 'Madurai · Arapalayam',
    type: 'Business Class Hotel',
    booking: 'Madurai — Arapalayam',
    cover: { src: '/assets/gallery/arapalayam/cover.webp', alt: 'Entrance to the restaurant at the Arapalayam hotel, with a brass lamp and chandelier' },
    desc: 'In the heart of the temple city, minutes from the Meenakshi Amman Temple — a business class hotel of dark wood, warm light and quiet rooms, made for rest after a long day.',
    stats: [['40', 'Rooms'], ['G + 4', 'Floors'], ['₹1,900', 'Rooms from']],
    facts: [
      ['Amenities', 'Restaurant, coffee shop, conference hall, Wi-Fi'],
      ['Services', 'Travel desk, laundry, doctor on call, parking'],
      ['Distances', 'Railway station 4 km · Meenakshi Temple 5 km · Airport 15 km'],
      ['Address', '47, D.D. Main Road, Arappalayam, Madurai 625016']
    ],
    floors: [
      ['First floor', '10 rooms'],
      ['Second floor', '10 rooms'],
      ['Third floor', '10 rooms'],
      ['Fourth floor', '6 rooms'],
      ['Terrace', '4 rooms']
    ],
    rooms: [
      { name: 'Standard', note: 'Well-appointed rooms for a restful stay', price: 1900, unit: 'per night' },
      { name: 'Deluxe', note: 'More space, more comfort', price: 2500, unit: 'per night' },
      { name: 'Premium', note: 'Generous rooms with added touches', price: 3500, unit: 'per night' },
      { name: 'Superior', note: 'Our finest rooms in the city', price: 4500, unit: 'per night' }
    ],
    pin: { lat: 9.9342, lng: 78.103, label: '47, D.D. Main Road, Arappalayam' },
    directions: maps('47 D.D. Main Road Arappalayam Madurai 625016'),
    photos: arapalayamPhotos
  },
  {
    id: 'kochadai',
    num: 'III',
    name: 'Kochadai',
    area: 'Madurai · Kochadai',
    type: 'Service Apartment',
    booking: 'Madurai — Kochadai',
    cover: { src: '/assets/gallery/kochadai/cover.webp', alt: 'The Kochadai service apartment building lit up at dusk' },
    desc: 'A private, fully equipped home in the Annai Bharath community — for families and groups who want the freedom of a house with the care of a hotel.',
    // Shown as a small notice on the page. Set to null when the apartment is free again.
    notice: 'Currently occupied — enquire for upcoming dates',
    stats: [['3', 'Bedrooms'], ['1', 'Jacuzzi'], ['₹13,000', 'Per day + taxes']],
    facts: [
      ['Community', 'Annai Bharath community, Kochadai'],
      ['Spaces', '3 bedrooms, 1 hall, 1 kitchen'],
      ['Leisure', 'Jacuzzi, garden area, party area & terrace view point'],
      ['Arrival', 'Car portico'],
      ['Please note', 'No swimming pool']
    ],
    rooms: [
      { name: 'Entire Apartment', note: '3 bedrooms, hall, kitchen, garden, terrace & jacuzzi', price: 13000, unit: 'per day + taxes' }
    ],
    pin: { lat: 9.9405, lng: 78.084, label: 'Annai Bharath community, Kochadai' },
    directions: maps('Kochadai, Madurai, Tamil Nadu'),
    photos: kochadaiPhotos
  }
];

export const contact = {
  phones: ['+91 90039 44559', '+91 90950 44558'],
  email: 'sivabhagya4@gmail.com'
};

export const rupees = n => `₹${n.toLocaleString('en-IN')}`;
