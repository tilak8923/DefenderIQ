
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the MapContainer to ensure it's only rendered on the client side.
const MapContainer = dynamic(() => import('@/components/map-container'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

interface ThreatMapProps {
  marker: { lat: number; lng: number; summary: string } | null;
}

export default function ThreatMap({ marker }: ThreatMapProps) {
  return (
    <MapContainer
      latitude={marker?.lat}
      longitude={marker?.lng}
      summary={marker?.summary}
    />
  );
}
