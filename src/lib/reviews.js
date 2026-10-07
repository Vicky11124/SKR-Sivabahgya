import { api } from './api';

/*
  Reviews live on the site server (server/index.js), so every visitor sees the same list
  and reviews deleted from the admin dashboard disappear for everyone.
*/
export const fetchReviews = () => api('/reviews');
export const postReview = review => api('/reviews', { method: 'POST', body: review });
