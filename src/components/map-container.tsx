'use client';

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useEffect } from 'react';

// This is a workaround for a known issue with Leaflet and bundlers like Webpack.
// It manually configures the default icon paths.
const DefaultIcon = L.icon({
  iconUrl: iconUrl.src,
  iconRetinaUrl: iconRetinaUrl.src,
  shadowUrl: shadowUrl.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


interface MapProps {
  latitude?: number;
  longitude?: number;
  summary?: string;
}

/**
 * An internal component that handles map updates.
 * It uses the `useMap` hook to safely interact with the map instance without re-initializing it.
 */
function MapUpdater({ latitude, longitude, summary }: MapProps) {
    const map = useMap();
    
    useEffect(() => {
        if (latitude && longitude) {
            // Pan the map to the new coordinates when they change.
            map.setView([latitude, longitude], 13);
        }
    }, [latitude, longitude, map]);

    // If we have coordinates, render a Marker on the map.
    return latitude && longitude ? (
      <Marker position={[latitude, longitude]}>
        <Popup>{summary || `Location: ${latitude}, ${longitude}`}</Popup>
      </Marker>
    ) : null;
}


/**
 * The main map component. It initializes the LeafletMap container once
 * and uses the MapUpdater component to handle all dynamic updates.
 */
export default function Map({ latitude, longitude, summary }: MapProps) {
  const initialPosition: [number, number] = [20, 0];
  const initialZoom = 2;

  return (
    <LeafletMap
        center={initialPosition}
        zoom={initialZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* MapUpdater handles all dynamic changes based on props */}
      <MapUpdater latitude={latitude} longitude={longitude} summary={summary} />
    </LeafletMap>
  );
}
