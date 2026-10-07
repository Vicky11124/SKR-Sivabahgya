/*
  Review storage.

  Right now reviews are saved in the visitor's own browser (localStorage), so a review shows up
  instantly for the person who wrote it, on that device. To share reviews between all visitors,
  replace these two functions with calls to a backend (e.g. Firebase, Supabase or your own API) —
  nothing else in the site needs to change.
*/
const KEY = 'skr-reviews-v1';

const isReview = r =>
  r && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.text === 'string' &&
  Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5;

export function loadReviews() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter(isReview) : [];
  } catch {
    return [];
  }
}

export function saveReviews(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
