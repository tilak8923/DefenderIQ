'use client';

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default icon paths don't work well with bundlers like Webpack.
// This code manually sets the paths to the icon images.
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useEffect } from 'react';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
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

function MapUpdater({ latitude, longitude, summary }: MapProps) {
    const map = useMap();
    useEffect(() => {
        if (latitude && longitude) {
            map.setView([latitude, longitude], 13);
        }
    }, [latitude, longitude, map]);

    return latitude && longitude ? (
      <Marker position={[latitude, longitude]}>
        <Popup>{summary || `Location: ${latitude}, ${longitude}`}</Popup>
      </Marker>
    ) : null;
}


export default function Map({ latitude, longitude, summary }: MapProps) {
  // Set a default position and zoom for initial render
  const initialPosition: [number, number] = [20, 0];
  const initialZoom = 2;

  return (
    <LeafletMap center={initialPosition} zoom={initialZoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater latitude={latitude} longitude={longitude} summary={summary} />
    </LeafletMap>
  );
}
