import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { useSite } from '../site';
import DriftWall from './DriftWall';

const pad = n => String(n).padStart(2, '0');

/* Wall size for the space available: fewer, smaller columns on narrow screens */
const layoutFor = width =>
  width < 600 ? { columns: 4, tileWidth: 150, tileHeight: 130, gap: 10, height: 440 }
  : width < 1000 ? { columns: 5, tileWidth: 200, tileHeight: 180, gap: 12, height: 520 }
  : { columns: 7, tileWidth: 244, tileHeight: 220, gap: 12, height: 600 };

/* A place's photos as a slowly drifting 3D wall; any tile opens the full-screen viewer */
export default function Gallery({ venue }) {
  const { openLightbox } = useSite();
  const ref = useRef(null);
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  const { photos } = venue;

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const items = useMemo(
    () => photos.map((p, index) => ({ image: p.thumb, title: p.alt, index })),
    [photos]
  );
  const { height, ...size } = layoutFor(width);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.from('.gallery__wall', {
      opacity: 0, y: 60, duration: 1.6, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%' }
    });
  }, { scope: ref });

  return (
    <div className="gallery" ref={ref}>
      <div className="gallery__head">
        <span>Gallery</span>
        <span>{pad(photos.length)} photographs</span>
      </div>

      <div className="gallery__wall" style={{ height }}>
        <DriftWall
          items={items}
          {...size}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={18}
          direction="up"
          variance={0.5}
          parallax={0.6}
          lift={64}
          fade={0.2}
          dim={0.6}
          overlayColor="#080706"
          radius={10}
          label={`${venue.name} photographs`}
          onItemClick={item => openLightbox(venue.id, item.index)}
        />
      </div>

      <button className="gallery__more" onClick={() => openLightbox(venue.id, 0)}>
        <span>View all {photos.length} photos</span>
      </button>
    </div>
  );
}
