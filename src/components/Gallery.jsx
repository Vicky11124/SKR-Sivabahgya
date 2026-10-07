import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap, ScrollTrigger, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';

const VISIBLE = 8;
const pad = n => String(n).padStart(2, '0');

/* Thumbnail that fades in once it has actually loaded */
function Thumb({ photo }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useCallback(img => {
    if (img?.complete && img.naturalWidth) setLoaded(true);
  }, []);

  return (
    <img
      ref={ref}
      src={photo.thumb}
      alt={photo.alt}
      width={photo.w}
      height={photo.h}
      loading="lazy"
      decoding="async"
      className={loaded ? 'is-loaded' : undefined}
      onLoad={() => setLoaded(true)}
    />
  );
}

/* Justified rows: every photo keeps its shape and each row shares one height (see .g in styles.css) */
export default function Gallery({ venue }) {
  const { openLightbox, scrollToTarget } = useSite();
  const ref = useRef(null);
  const gridRef = useRef(null);
  const [open, setOpen] = useState(false);       // extras rendered
  const [expanded, setExpanded] = useState(false); // button state
  const { photos } = venue;

  const { contextSafe } = useGSAP(() => {
    if (reduceMotion) return;
    const tiles = gsap.utils.toArray('.g__item:not(.is-extra)');
    gsap.set(tiles, { opacity: 0, y: 50 });
    ScrollTrigger.batch(tiles, {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.3, stagger: 0.08, ease: 'expo.out' })
    });
  }, { scope: ref });

  const heightWith = state => {
    flushSync(() => setOpen(state));
    return gridRef.current.offsetHeight;
  };

  const toggle = contextSafe(() => {
    const grid = gridRef.current;
    const opening = !expanded;
    setExpanded(opening);

    if (reduceMotion) {
      setOpen(opening);
      return;
    }

    const from = grid.offsetHeight;
    if (opening) {
      const to = heightWith(true);
      gsap.fromTo(grid, { height: from, overflow: 'hidden' }, {
        height: to, duration: 1.2, ease: 'expo.inOut', clearProps: 'height,overflow',
        onComplete: () => ScrollTrigger.refresh()
      });
      gsap.fromTo('.is-extra', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out', delay: 0.15 });
    } else {
      // measure the closed height, then keep the extras on screen while the grid closes over them
      const to = heightWith(false);
      heightWith(true);
      gsap.fromTo(grid, { height: from, overflow: 'hidden' }, {
        height: to, duration: 1, ease: 'expo.inOut',
        onComplete: () => {
          setOpen(false);
          gsap.set(grid, { clearProps: 'height,overflow' });
          ScrollTrigger.refresh();
        }
      });
      if (ref.current.getBoundingClientRect().top < 0) scrollToTarget(ref.current.closest('.venue'));
    }
  });

  return (
    <div className={`gallery${open ? ' is-open' : ''}`} ref={ref}>
      <div className="gallery__head">
        <span>Gallery</span>
        <span>{pad(photos.length)} photographs</span>
      </div>

      <div className="g" ref={gridRef}>
        {photos.map((photo, i) => (
          <figure
            key={photo.src}
            className={`g__item${i >= VISIBLE ? ' is-extra' : ''}`}
            style={{ '--ar': (photo.w / photo.h).toFixed(3) }}
          >
            <button
              className="g__btn"
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
              onClick={() => openLightbox(venue.id, i)}
            >
              <Thumb photo={photo} />
            </button>
          </figure>
        ))}
      </div>

      {photos.length > VISIBLE && (
        <button className="gallery__more" aria-expanded={expanded} onClick={toggle}>
          <span>{expanded ? 'Show fewer' : `View all ${photos.length} photos`}</span>
        </button>
      )}
    </div>
  );
}
