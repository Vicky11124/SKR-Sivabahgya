import { venues } from './venues';

export const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/places', label: 'Places' },
  { path: '/reviews', label: 'Reviews' }
];

export const placePath = id => `/places/${id}`;

/* Name shown on the page-change curtain */
export const labelFor = path =>
  venues.find(v => placePath(v.id) === path)?.name ?? PAGES.find(p => p.path === path)?.label ?? '';

/* A nav item stays lit on its sub-pages too (Places → /places/kodaikanal) */
export const isActive = (path, pathname) =>
  path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);

/* Pages that carry the booking form */
export const hasReserve = pathname => pathname === '/' || isActive('/places', pathname);
