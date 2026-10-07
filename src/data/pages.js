export const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/places', label: 'Places' },
  { path: '/reviews', label: 'Reviews' }
];

export const labelFor = path => PAGES.find(p => p.path === path)?.label ?? '';
