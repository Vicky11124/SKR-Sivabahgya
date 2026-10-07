import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { finePointer } from '../motion';

/*
  Property map with the crest as the pin.
  Standard OpenStreetMap colours, framed in gold. The map stays "locked" until the visitor
  clicks it, so scrolling past it never gets hijacked; it locks again when the pointer leaves.
*/
export default function PlaceMap({ venue }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const [active, setActive] = useState(false);
  const { lat, lng, label } = venue.pin;

  useEffect(() => {
    const map = L.map(boxRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      tap: false
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'map-tiles',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);

    const icon = L.divIcon({
      className: 'map-pin',
      html: '<span class="map-pin__pulse"></span><span class="map-pin__badge"><img src="/assets/logo-crest-sm.webp" alt="" /></span><span class="map-pin__stem"></span>',
      iconSize: [56, 74],
      iconAnchor: [28, 74],
      popupAnchor: [0, -70]
    });

    const popup = `
      <p class="map-popup__type">${venue.type}</p>
      <p class="map-popup__name">SKR Sivabhagya · ${venue.name}</p>
      <p class="map-popup__addr">${label}</p>
      <a class="map-popup__link" href="${venue.directions}" target="_blank" rel="noopener">Get directions</a>`;

    L.marker([lat, lng], { icon, title: `SKR Sivabhagya ${venue.name}` })
      .addTo(map)
      .bindPopup(popup, { className: 'map-popup', closeButton: false, maxWidth: 260 });

    mapRef.current = map;
    // the page fades in after the curtain; make sure the map measures its final size
    const t = setTimeout(() => map.invalidateSize(), 1300);

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, [venue, lat, lng, label]);

  /* Unlock / lock dragging and wheel-zoom */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (active) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    }
  }, [active]);

  const recentre = () => mapRef.current?.flyTo([lat, lng], 15, { duration: 1.2 });

  return (
    <div
      className={`map${active ? ' is-active' : ''}`}
      onMouseLeave={() => finePointer && setActive(false)}
      {...(active ? { 'data-lenis-prevent': '' } : {})}
    >
      <div className="map__canvas" ref={boxRef} aria-label={`Map showing SKR Sivabhagya ${venue.name}`} role="region" />

      {!active && (
        <button className="map__unlock" onClick={() => setActive(true)}>
          <span>{finePointer ? 'Click to explore the map' : 'Tap to explore the map'}</span>
        </button>
      )}

      <div className="map__tools">
        <button onClick={recentre} aria-label="Centre on the property">Centre</button>
        {active && !finePointer && <button onClick={() => setActive(false)}>Done</button>}
      </div>
    </div>
  );
}
