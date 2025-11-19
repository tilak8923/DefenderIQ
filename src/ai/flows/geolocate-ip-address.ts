'use server';
/**
 * @fileOverview A flow for geolocating an IP address.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeolocationToolOutputSchema = z.object({
  lat: z.number().describe('The latitude of the IP address.'),
  lon: z.number().describe('The longitude of the IP address.'),
  city: z.string().describe('The city of the IP address.'),
  country: z.string().describe('The country of the IP address.'),
});

const geolocateIpTool = ai.defineTool(
  {
    name: 'geolocateIp',
    description: 'Gets the geolocation for a given IP address.',
    inputSchema: z.object({
      ipAddress: z.string().describe('The IP address to geolocate.'),
    }),
    outputSchema: GeolocationToolOutputSchema,
  },
  async ({ ipAddress }) => {
    // Basic validation for IP address format
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      throw new Error('Invalid IP address format provided.');
    }
    
    try {
      // Switched to a more reliable, free geolocation service
      const response = await fetch(`https://ipwho.is/${ipAddress}`);
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(`Geolocation failed: ${data.message}`);
      }
      return {
        lat: data.latitude,
        lon: data.longitude,
        city: data.city,
        country: data.country,
      };
    } catch (error) {
      console.error('Error geolocating IP:', error);
      throw error;
    }
  }
);


const GeolocateIpAddressInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to geolocate.'),
});
export type GeolocateIpAddressInput = z.infer<typeof GeolocateIpAddressInputSchema>;

const GeolocateIpAddressOutputSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string(),
    country: z.string(),
    summary: z.string().describe("A brief, human-readable summary of the location."),
});
export type GeolocateIpAddressOutput = z.infer<typeof GeolocateIpAddressOutputSchema>;

export async function geolocateIpAddress(input: GeolocateIpAddressInput): Promise<GeolocateIpAddressOutput> {
  return geolocateIpAddressFlow(input);
}


const geolocateIpAddressFlow = ai.defineFlow(
  {
    name: 'geolocateIpAddressFlow',
    inputSchema: GeolocateIpAddressInputSchema,
    outputSchema: GeolocateIpAddressOutputSchema,
  },
  async ({ ipAddress }) => {
    const llmResponse = await ai.generate({
      prompt: `Geolocate the following IP address: ${ipAddress}`,
      tools: [geolocateIpTool],
    });

    const toolResponse = llmResponse.toolRequest?.tool?.output;
    if (!toolResponse) {
        throw new Error("Geolocation tool did not run or returned no output.");
    }
    
    const location = toolResponse as z.infer<typeof GeolocationToolOutputSchema>;

    return {
      latitude: location.lat,
      longitude: location.lon,
      city: location.city,
      country: location.country,
      summary: `The IP address ${ipAddress} is located in ${location.city}, ${location.country}.`,
    };
  }
);
