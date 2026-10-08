import { api } from './api';

/* Room availability for a place, kept for a minute so switching back and forth doesn't refetch */
const cache = new Map(); // place → { at, promise }

export function fetchAvailability(place, { fresh = false } = {}) {
  const hit = cache.get(place);
  if (!fresh && hit && Date.now() - hit.at < 60e3) return hit.promise;
  const promise = api(`/availability?place=${encodeURIComponent(place)}`);
  promise.catch(() => cache.delete(place));
  cache.set(place, { at: Date.now(), promise });
  return promise;
}
