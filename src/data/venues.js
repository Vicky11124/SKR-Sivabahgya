import { kodaikanalPhotos, arapalayamPhotos, kochadaiPhotos } from './photos';

const maps = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const venues = [
  {
    id: 'kodaikanal',
    num: 'I',
    name: 'Kodaikanal',
    area: 'Kodaikanal · Palani Hills',
    type: 'Adventure Resort',
    booking: 'Kodaikanal',
    cover: { src: '/assets/gallery/kodaikanal/cover.webp', alt: 'Dining room at the Kodaikanal resort with a wide view of the hills' },
    desc: 'High in the Palani Hills, the resort looks out over eucalyptus forest and drifting mist. Rooms open to the valley, the dining hall frames the mountains, and the lawns invite slow, cool mornings.',
    facts: [
      ['Setting', 'Hillside, with panoramic valley views'],
      ['Stay', 'Deluxe rooms in wood, linen & soft light'],
      ['Dining', 'In-house restaurant with mountain-facing windows'],
      ['Grounds', 'Open lawns, lounge & covered parking']
    ],
    directions: maps('SKR Sivabhagya Kodaikanal'),
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
    facts: [
      ['Rooms', 'Luxury (450 sq ft) & Deluxe (300 sq ft)'],
      ['Amenities', 'Restaurant, coffee shop, conference hall, Wi-Fi'],
      ['Services', 'Travel desk, laundry, doctor on call, parking'],
      ['Distances', 'Railway station 4 km · Meenakshi Temple 5 km · Airport 15 km'],
      ['Address', '47, D.D. Main Road, Arappalayam, Madurai 625016']
    ],
    directions: maps('47 D.D. Main Road Arappalayam Madurai 625016'),
    photos: arapalayamPhotos
  },
  {
    id: 'kochadai',
    num: 'III',
    name: 'Kochadai',
    area: 'Madurai · Kochadai',
    type: 'Service Apartments',
    booking: 'Madurai — Kochadai',
    cover: { src: '/assets/gallery/kochadai/cover.webp', alt: 'The Kochadai service apartment building lit up at dusk' },
    desc: 'A private, fully equipped home in Madurai — for families and groups who want the freedom of a house with the care of a hotel.',
    facts: [
      ['Spaces', 'Living hall, kitchen & bedrooms'],
      ['Leisure', 'Rooftop terrace, garden area & party hall'],
      ['Convenience', 'Private car parking']
    ],
    directions: maps('SKR Sivabhagya Kochadai Madurai'),
    photos: kochadaiPhotos
  }
];

export const contact = {
  phones: ['+91 90039 44559', '+91 90950 44558'],
  email: 'sivabhagya4@gmail.com'
};
