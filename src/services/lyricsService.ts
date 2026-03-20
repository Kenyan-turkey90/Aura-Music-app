/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const fetchLyrics = async (title: string, artist: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the lyrics for the song "${title}" by "${artist}". 
      Return ONLY the lyrics. If you cannot find them, return "Lyrics not found."`,
      config: {
        systemInstruction: "You are a music lyrics assistant. You provide accurate lyrics for songs. If lyrics are unavailable, state that clearly.",
      },
    });

    return response.text || "Lyrics not found.";
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    throw new Error("Failed to fetch lyrics. Please try again later.");
  }
};
