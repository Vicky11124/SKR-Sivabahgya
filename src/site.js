import { createContext, useContext } from 'react';

/* Shared site actions: smooth scrolling, the booking location and the lightbox */
export const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);
