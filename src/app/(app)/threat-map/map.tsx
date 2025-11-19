
'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('@/components/map-container'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

interface ThreatMapProps {
  center: [number, number] | null;
  marker: { lat: number; lng: number; summary: string } | null;
}

export default function ThreatMap({ center, marker }: ThreatMapProps) {
  return (
    <MapContainer
      latitude={marker?.lat}
      longitude={marker?.lng}
      summary={marker?.summary}
    />
  );
}
