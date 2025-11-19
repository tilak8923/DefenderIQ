
'use client';

import { useState } from 'react';
import { geolocateIpAddress } from '@/ai/flows/geolocate-ip-address';
import type { GeolocateIpAddressOutput } from '@/ai/flows/geolocate-ip-address';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ThreatMap from './map';

export default function ThreatMapPage() {
  const [ipAddress, setIpAddress] = useState('8.8.8.8');
  const [output, setOutput] = useState<GeolocateIpAddressOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [mapMarker, setMapMarker] = useState<{lat: number; lng: number; summary: string} | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setOutput(null);
    setError(null);

    try {
      const result = await geolocateIpAddress({ ipAddress });
      setOutput(result);
      setMapMarker({ lat: result.latitude, lng: result.longitude, summary: result.summary });
    } catch (err: any) {
      console.error('Error geolocating IP:', err);
      setError(err.message || 'Failed to geolocate IP address.');
      setMapMarker(null);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-wider">Threat Map</h1>
        <p className="text-muted-foreground">
          Visually locate the geographical origin of an IP address.
        </p>
      </header>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <Card>
            <form onSubmit={handleLookup}>
              <CardHeader>
                <CardTitle>IP Geolocation</CardTitle>
                <CardDescription>Enter an IP address to find its location.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex w-full items-center space-x-2">
                  <Input
                    id="ip-address"
                    type="text"
                    placeholder="e.g., 8.8.8.8"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    disabled={running}
                  />
                  <Button type="submit" disabled={running}>
                    {running ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="mr-2 h-4 w-4" />
                    )}
                    Find
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
           {output && (
                <Alert className="mt-4">
                    <AlertTitle>{output.city}, {output.country}</AlertTitle>
                    <AlertDescription>
                        {output.summary}
                    </AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}
        </div>
        <div className="md:col-span-2">
          <Card className="h-[400px] md:h-[500px]">
            <ThreatMap marker={mapMarker} />
          </Card>
        </div>
      </div>
    </div>
  );
}
