import { useEffect, useRef, useState } from 'react';

const pad = n => String(n).padStart(2, '0');

/* Full-screen photo viewer: arrows, keyboard, swipe; cross-fades between photos */
export default function Lightbox({ venue, index, onIndex, onClose }) {
  const open = !!venue;
  const lastVenue = useRef(venue);
  if (venue) lastVenue.current = venue; // keep content while fading out
  const photos = lastVenue.current?.photos ?? [];

  const [shown, setShown] = useState(null);
  const [swapping, setSwapping] = useState(false);
  const closeRef = useRef(null);
  const returnFocus = useRef(null);
  const touchX = useRef(null);

  const go = step => onIndex((index + step + photos.length) % photos.length);

  /* Decode the next photo before swapping it in, and warm up its neighbours */
  useEffect(() => {
    if (!open) return;
    const photo = photos[index];
    let live = true;
    setSwapping(true);
    const img = new Image();
    img.src = photo.src;
    img.decode().catch(() => {}).then(() => {
      if (!live) return;
      setShown(photo);
      requestAnimationFrame(() => live && setSwapping(false));
    });
    [index + 1, index - 1].forEach(n => (new Image().src = photos[(n + photos.length) % photos.length].src));
    return () => { live = false; };
  }, [open, index, photos]);

  /* Move focus in on open, hand it back on close */
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    closeRef.current?.focus();
    return () => returnFocus.current?.focus({ preventScroll: true });
  }, [open]);

  /* Keyboard controls (re-bound each render so they see the current index) */
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  return (
    <div
      className={`lightbox${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      aria-hidden={!open}
      onClick={e => { if (e.target === e.currentTarget || e.target.classList.contains('lightbox__stage')) onClose(); }}
      onTouchStart={e => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="lightbox__top">
        <span className="lightbox__venue">{lastVenue.current?.booking}</span>
        <span className="lightbox__count">{pad(index + 1)} / {pad(photos.length)}</span>
        <button className="lightbox__close" ref={closeRef} onClick={onClose}>Close</button>
      </div>

      <figure className="lightbox__stage">
        {shown && <img src={shown.src} alt={shown.alt} className={swapping ? 'is-swapping' : undefined} />}
      </figure>

      <button className="lightbox__nav lightbox__nav--prev" aria-label="Previous photo" onClick={() => go(-1)}><span>←</span></button>
      <button className="lightbox__nav lightbox__nav--next" aria-label="Next photo" onClick={() => go(1)}><span>→</span></button>
    </div>
  );
}
