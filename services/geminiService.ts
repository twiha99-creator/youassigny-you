import { GoogleGenAI } from "@google/genai";
import { FieldLocationData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getFieldInfo = async (fieldName: string, city: string): Promise<FieldLocationData | null> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini. Returning mock data.");
    // Fallback mock for demo purposes if no key is present
    return {
      name: fieldName,
      address: `123 Mock Ave, ${city}, USA`,
      rating: 4.5,
      googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fieldName + ' ' + city)}`
    };
  }

  try {
    const prompt = `Find location details for the sports field named "${fieldName}" in "${city}". Return the address, a rating (if available), and a Google Maps URI.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const firstMapChunk = chunks?.find((c: any) => c.maps);

    if (firstMapChunk && firstMapChunk.maps) {
      return {
        name: firstMapChunk.maps.title || fieldName,
        address: firstMapChunk.maps.formattedAddress || "Address not found via AI",
        rating: 4.5, // Google Maps tool doesn't always return rating in the chunk directly in this version, defaulting
        googleMapsUri: firstMapChunk.maps.googleMapsUri,
      };
    }

    return {
      name: fieldName,
      address: "Location data could not be verified by AI.",
      googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fieldName + ' ' + city)}`
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
