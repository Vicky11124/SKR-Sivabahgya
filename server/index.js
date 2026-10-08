/*
  SKR Sivabhagya — site server.

  - /api/...   reviews, room availability and booking requests (public), and the admin API (login required)
  - anything else: the built site from dist/ (run `npm run build` first), with every page
    route falling back to index.html so links like /reviews or /admin open directly.

  Settings come from environment variables, or from a .env file next to package.json
  (see .env.example): ADMIN_USERNAME, ADMIN_PASSWORD, PORT, DATA_DIR, TRUST_PROXY.
*/
import { createServer } from 'node:http';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { venues } from '../src/data/venues.js';
import { openStore } from './store.js';
import { addDays, findUnit, freeByNight, freeForStay, nightsBetween, quote, todayIST, unitKey } from '../src/lib/stay.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
try { process.loadEnvFile(join(root, '.env')); } catch { /* no .env file — use the real environment */ }

const PORT = Number(process.env.PORT) || 3001;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const TRUST_PROXY = process.env.TRUST_PROXY === '1'; // set when running behind nginx / a hosting proxy
const DIST = join(root, 'dist');
const store = openStore(resolve(root, process.env.DATA_DIR || 'data'));

const SESSION_COOKIE = 'skr_admin';
const SESSION_HOURS = 12;
const sessions = new Map(); // token → expiry time (ms). Restarting the server signs everyone out.

const placeIds = new Set(venues.map(v => v.id));
const venueById = id => venues.find(v => v.id === id);
const STATUSES = ['new', 'confirmed', 'cancelled'];
const WINDOW = 400; // days ahead that can be booked and are shown in the calendar

/* ---------- small helpers ---------- */

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
};

const clientIp = req =>
  (TRUST_PROXY && req.headers['x-forwarded-for']?.split(',')[0].trim()) || req.socket.remoteAddress || '';

const isHttps = req =>
  req.socket.encrypted || (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https');

async function readJson(req) {
  // Requiring JSON also blocks cross-site form posts (browsers can't send JSON cross-site without CORS)
  if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'Expected JSON.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16 * 1024) throw new HttpError(413, 'Request too large.');
    chunks.push(chunk);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new HttpError(400, 'Invalid JSON.');
  }
}

/* Counts attempts per IP in a sliding window; throws 429 once the limit is reached */
function limiter(max, windowMs) {
  const hits = new Map();
  return {
    check(ip) {
      const now = Date.now();
      if (hits.size > 5000) hits.clear(); // keep memory bounded
      const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
      hits.set(ip, recent);
      if (recent.length >= max) throw new HttpError(429, 'Too many attempts. Please try again later.');
    },
    hit(ip) { hits.get(ip)?.push(Date.now()) ?? hits.set(ip, [Date.now()]); },
    clear(ip) { hits.delete(ip); }
  };
}
const reviewLimit = limiter(5, 60 * 60 * 1000);
const bookingLimit = limiter(10, 60 * 60 * 1000);
const loginLimit = limiter(5, 15 * 60 * 1000);

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/* ---------- validation ---------- */

function parseReview(body) {
  const review = {
    id: randomUUID(),
    name: text(body.name, 60),
    place: body.place,
    rating: body.rating,
    text: text(body.text, 600),
    date: new Date().toISOString()
  };
  if (!review.name) throw new HttpError(400, 'Please add your name.');
  if (!placeIds.has(review.place)) throw new HttpError(400, 'Unknown place.');
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) throw new HttpError(400, 'Please choose a rating.');
  if (review.text.length < 10) throw new HttpError(400, 'Please write at least 10 characters.');
  return review;
}

/* Dates and room shared by booking requests and admin blocks; throws on anything out of range */
function parseStay(body) {
  const venue = venueById(body.place);
  if (!venue) throw new HttpError(400, 'Unknown place.');
  const unit = findUnit(venue, body.floor, body.room);
  if (!unit) throw new HttpError(400, 'Please choose a floor and room.');
  const { arrival, departure } = body;
  // a day of slack, so a guest whose local date is behind India's isn't turned away
  const earliest = addDays(todayIST(), -1);
  if (!isDate(arrival) || !isDate(departure)) throw new HttpError(400, 'Kindly choose your arrival and departure dates.');
  if (arrival < earliest) throw new HttpError(400, 'Arrival date is in the past.');
  if (departure <= arrival) throw new HttpError(400, 'Departure should be after arrival.');
  if (departure > addDays(todayIST(), WINDOW)) throw new HttpError(400, 'We take bookings up to a year ahead.');
  const rooms = body.rooms ?? 1;
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > unit.count) throw new HttpError(400, `This floor has ${unit.count} such room${unit.count > 1 ? 's' : ''}.`);
  return { venue, unit, arrival, departure, rooms };
}

function parseBooking(body) {
  const { venue, unit, arrival, departure, rooms } = parseStay(body);
  const guests = body.guests;
  if (!Number.isInteger(guests) || guests < 1) throw new HttpError(400, 'Please choose the number of guests.');
  if (guests > rooms * unit.room.sleeps) throw new HttpError(400, `${unit.room.name} sleeps ${unit.room.sleeps} — please add a room for ${guests} guests.`);

  const booking = {
    id: randomUUID(),
    name: text(body.name, 80),
    phone: text(body.phone, 30),
    email: text(body.email, 120),
    place: venue.id,
    location: venue.booking,
    floor: unit.floor.id,
    floorName: unit.floor.name,
    room: unit.room.id,
    roomName: unit.room.name,
    rooms,
    arrival,
    departure,
    guests,
    // priced on the server from the published rates, never trusted from the browser
    estimate: quote(unit.room.price, rooms, nightsBetween(arrival, departure)),
    note: text(body.note, 500),
    status: 'new',
    createdAt: new Date().toISOString()
  };
  if (!booking.name) throw new HttpError(400, 'Please add your name.');
  if ((booking.phone.match(/\d/g) || []).length < 7 || /[^\d\s+()-]/.test(booking.phone)) {
    throw new HttpError(400, 'Please add a valid phone number.');
  }
  if (booking.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) throw new HttpError(400, 'Please check your email address.');
  return booking;
}

/* ---------- availability ---------- */

// Confirmed bookings and admin blocks are what take rooms; new requests don't until confirmed
const takenAt = (placeId, skipId) => [
  ...store.bookings.all().filter(b => b.place === placeId && b.status === 'confirmed' && b.room && b.id !== skipId),
  ...store.blocks.all().filter(b => b.place === placeId)
];

function availability(venue, skipId) {
  const from = todayIST();
  return { from, days: WINDOW, free: freeByNight(venue, takenAt(venue.id, skipId), from, WINDOW) };
}

/* Throws 409 unless every night of the stay still has enough rooms */
function assertFree({ place, floor, room, rooms, arrival, departure }, skipId, message) {
  const { from, free } = availability(venueById(place), skipId);
  const nights = free[unitKey(floor, room)];
  // nights before today are history; only check what is still ahead
  const start = arrival < from ? from : arrival;
  if (departure > start && freeForStay(nights, from, start, departure) < rooms) throw new HttpError(409, message);
}

/* ---------- admin sessions ---------- */

const digest = s => createHash('sha256').update(String(s)).digest();
const same = (a, b) => timingSafeEqual(digest(a), digest(b)); // equal-length digests → constant-time compare

function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

function isAdmin(req) {
  const token = readCookie(req, SESSION_COOKIE);
  const expires = token && sessions.get(token);
  if (!expires) return false;
  if (expires < Date.now()) { sessions.delete(token); return false; }
  return true;
}

const sessionCookie = (req, token, maxAge) =>
  [`${SESSION_COOKIE}=${token}`, 'Path=/api', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`, isHttps(req) && 'Secure']
    .filter(Boolean).join('; ');

/* ---------- API ---------- */

async function api(req, res, path) {
  const method = req.method;
  const ip = clientIp(req);

  // Public
  if (path === '/api/reviews' && method === 'GET') return send(res, 200, store.reviews.all());
  if (path === '/api/reviews' && method === 'POST') {
    reviewLimit.check(ip);
    const review = parseReview(await readJson(req));
    reviewLimit.hit(ip);
    return send(res, 201, store.reviews.add(review));
  }
  if (path === '/api/availability' && method === 'GET') {
    const venue = venueById(new URL(req.url, 'http://localhost').searchParams.get('place'));
    if (!venue) throw new HttpError(400, 'Unknown place.');
    return send(res, 200, availability(venue));
  }
  if (path === '/api/bookings' && method === 'POST') {
    bookingLimit.check(ip);
    const booking = parseBooking(await readJson(req));
    assertFree(booking, null, 'Sorry — those dates were just taken for this room. Please choose other dates or another floor.');
    bookingLimit.hit(ip);
    store.bookings.add(booking);
    return send(res, 201, { id: booking.id });
  }

  // Admin sign-in
  if (path === '/api/admin/login' && method === 'POST') {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) throw new HttpError(503, 'Admin login is not set up on the server (ADMIN_USERNAME / ADMIN_PASSWORD).');
    loginLimit.check(ip);
    const { username, password } = await readJson(req);
    // evaluate both so a wrong username takes as long as a wrong password
    const ok = [same(username ?? '', ADMIN_USERNAME), same(password ?? '', ADMIN_PASSWORD)].every(Boolean);
    if (!ok) {
      loginLimit.hit(ip);
      throw new HttpError(401, 'Wrong username or password.');
    }
    loginLimit.clear(ip);
    const token = randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + SESSION_HOURS * 3600e3);
    return send(res, 200, { username: ADMIN_USERNAME }, { 'Set-Cookie': sessionCookie(req, token, SESSION_HOURS * 3600) });
  }
  if (path === '/api/admin/logout' && method === 'POST') {
    sessions.delete(readCookie(req, SESSION_COOKIE));
    return send(res, 204, undefined, { 'Set-Cookie': sessionCookie(req, '', 0) });
  }

  // Everything below needs a signed-in admin
  if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Not found.');
  if (!isAdmin(req)) throw new HttpError(401, 'Please sign in.');

  if (path === '/api/admin/session' && method === 'GET') return send(res, 200, { username: ADMIN_USERNAME });
  if (path === '/api/admin/reviews' && method === 'GET') return send(res, 200, store.reviews.all());
  if (path === '/api/admin/bookings' && method === 'GET') return send(res, 200, store.bookings.all());
  if (path === '/api/admin/blocks' && method === 'GET') return send(res, 200, store.blocks.all());
  if (path === '/api/admin/blocks' && method === 'POST') {
    const body = await readJson(req);
    const { venue, unit, arrival, departure, rooms } = parseStay(body);
    const block = {
      id: randomUUID(), place: venue.id, floor: unit.floor.id, room: unit.room.id, rooms, arrival, departure,
      note: text(body.note, 200), createdAt: new Date().toISOString()
    };
    assertFree(block, null, 'Not enough free rooms on those dates — confirmed bookings or other blocks already take them.');
    return send(res, 201, store.blocks.add(block));
  }

  const [, , , kind, id, extra] = path.split('/'); // '', api, admin, kind, id
  if (id && !extra && (kind === 'reviews' || kind === 'bookings' || kind === 'blocks')) {
    const collection = store[kind];
    if (method === 'DELETE') {
      if (!collection.remove(id)) throw new HttpError(404, 'Already deleted.');
      return send(res, 204);
    }
    if (method === 'PATCH' && kind === 'bookings') {
      const { status } = await readJson(req);
      if (!STATUSES.includes(status)) throw new HttpError(400, 'Unknown status.');
      const current = collection.all().find(b => b.id === id);
      if (!current) throw new HttpError(404, 'Booking not found.');
      // confirming takes the rooms, so make sure they are still free
      if (status === 'confirmed' && current.status !== 'confirmed' && current.room) {
        assertFree(current, id, 'Those rooms are already taken on some of these dates (by another confirmed booking or a block). Free them first, or move this guest.');
      }
      const updated = collection.update(id, { status, updatedAt: new Date().toISOString() });
      if (!updated) throw new HttpError(404, 'Booking not found.');
      return send(res, 200, updated);
    }
  }
  throw new HttpError(404, 'Not found.');
}

/* ---------- static site ---------- */

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain'
};

function serveStatic(req, res, path) {
  if (!existsSync(join(DIST, 'index.html'))) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('The site has not been built yet. Run `npm run build`, or use `npm run dev` while developing.');
  }
  let decoded;
  try { decoded = decodeURIComponent(path); } catch { decoded = '/'; } // malformed %-escape: treat as a page route
  let file = normalize(join(DIST, decoded));
  if (!file.startsWith(DIST + sep)) file = join(DIST, 'index.html');
  let isFile = false;
  try { isFile = statSync(file).isFile(); } catch { /* not found */ }

  if (!isFile) {
    // Missing files with an extension are real 404s; anything else is a page route
    if (extname(path)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    file = join(DIST, 'index.html');
  }

  const headers = { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' };
  // Vite's hashed bundles never change; everything else should be re-checked
  headers['Cache-Control'] = file.startsWith(join(DIST, 'assets') + sep) && /-[\w-]{8,}\.\w+$/.test(file)
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';
  if (path.startsWith('/admin')) headers['X-Robots-Tag'] = 'noindex, nofollow';
  res.writeHead(200, headers);
  res.end(readFileSync(file));
}

/* ---------- server ---------- */

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  try {
    if (path === '/api' || path.startsWith('/api/')) return await api(req, res, path);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
    serveStatic(req, res, path);
  } catch (err) {
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error(err);
    if (!res.headersSent) send(res, 500, { error: 'Something went wrong on the server.' });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`SKR server on http://localhost:${PORT}  (data: ${store.file})`);
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.warn('! ADMIN_USERNAME / ADMIN_PASSWORD are not set — the admin dashboard cannot be signed in to. See .env.example.');
  }
});
