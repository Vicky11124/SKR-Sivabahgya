import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSite } from '../site';
import { venues } from '../data/venues';
import Page from '../components/Page';
import Venue from '../components/Venue';
import Locations from '../components/Locations';
import Reserve from '../components/Reserve';

function PlacePage({ venue }) {
  const { setLocation } = useSite();

  // The booking form on this page starts on this place
  useEffect(() => setLocation(venue.booking), [venue, setLocation]);

  return (
    <Page>
      <Venue venue={venue} />
      <Locations exclude={venue.id} eyebrow="Also from Sivabhagya" lines={['Our other', <em>addresses.</em>]} />
      <Reserve />
    </Page>
  );
}

/* /places/:id — keyed by id so moving between places starts each page fresh */
export default function Place() {
  const { id } = useParams();
  const venue = venues.find(v => v.id === id);
  if (!venue) return <Navigate to="/places" replace />;
  return <PlacePage key={venue.id} venue={venue} />;
}
