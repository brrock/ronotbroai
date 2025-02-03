import { tool } from 'ai';
import { z } from 'zod';

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const getWeather = tool({
  description: 'Get the current weather at a location. You can provide either a location name (like "London, UK" or "New York City") or specific coordinates. If providing coordinates: latitude: 51.5074 for London, longitude: -0.1278 for London.',
  parameters: z.object({
    location: z.string().describe('The name of the location (e.g. "London, UK" or "Paris, France")'),
    latitude: z.number().optional().describe('Optional: The exact latitude if you have it'),
    longitude: z.number().optional().describe('Optional: The exact longitude if you have it'),
  }),
  execute: async ({ location, latitude, longitude }) => {
    let coords: Coordinates;
    
    if (!latitude || !longitude) {
      // Use OpenStreetMap Nominatim API for geocoding
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'TooManyTools Weather App'
          }
        }
      );
      const geocodeData = (await geocodeResponse.json()) as GeocodingResult[];
      
      if (!geocodeData || geocodeData.length === 0) {
        return {
          error: `Could not find coordinates for location: ${location}`
        };
      }
      
      coords = {
        latitude: Number.parseFloat(geocodeData[0].lat),
        longitude: Number.parseFloat(geocodeData[0].lon)
      };
      console.log('Geocoded coordinates:', coords);
    } else {
      coords = { latitude, longitude };
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
    );

    const weatherData = await response.json();
    return {
      ...weatherData,
      location,
      coordinates: coords
    };
  },
});
