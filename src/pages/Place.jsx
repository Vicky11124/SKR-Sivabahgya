import { useEffect, useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from '../motion';
import { Navigate, useParams } from 'react-router-dom';
import { useSite } from '../site';
import { venues } from '../data/venues';
import Page from '../components/Page';
import Venue from '../components/Venue';
import Locations from '../components/Locations';
import Reserve from '../components/Reserve';

/* A place's own photo, fixed behind the page; it darkens as you scroll so the sections stay readable */
function Backdrop({ photo }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    gsap.to('.backdrop__shade', {
      opacity: 1, ease: 'power1.inOut',
      scrollTrigger: { start: 0, end: () => innerHeight * 0.9, scrub: true, invalidateOnRefresh: true }
    });
  }, { scope: ref });

  return (
    <div className="backdrop backdrop--place" ref={ref} aria-hidden="true">
      <div className="backdrop__layer">
        <picture>
          <source media="(max-width: 700px)" srcSet={photo.small} />
          <img src={photo.src} alt="" style={photo.position ? { objectPosition: photo.position } : undefined} />
        </picture>
      </div>
      <div className="backdrop__shade" />
      <div className="backdrop__grad" />
    </div>
  );
}

function PlacePage({ venue }) {
  const { setLocation } = useSite();

  // The booking form on this page starts on this place
  useEffect(() => setLocation(venue.booking), [venue, setLocation]);

  return (
    <>
      {venue.backdrop && <Backdrop photo={venue.backdrop} />}
      <Page className={venue.backdrop ? 'page--backdrop' : ''}>
        <Venue venue={venue} />
        <Locations exclude={venue.id} eyebrow="Also from Sivabhagya" lines={['Our other', <em>addresses.</em>]} />
        <Reserve />
      </Page>
    </>
  );
}

/* /places/:id — keyed by id so moving between places starts each page fresh */
export default function Place() {
  const { id } = useParams();
  const venue = venues.find(v => v.id === id);
  if (!venue) return <Navigate to="/places" replace />;
  return <PlacePage key={venue.id} venue={venue} />;
}
