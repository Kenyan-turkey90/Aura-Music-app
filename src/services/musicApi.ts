/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track, iTunesResult } from '../types';

const BASE_URL = 'https://itunes.apple.com/search';
const FETCH_TIMEOUT = 8000; // 8 seconds timeout

/**
 * Sanitizes input to prevent XSS and injection
 */
const sanitizeQuery = (query: string): string => {
  return query.replace(/[<>]/g, '').trim();
};

/**
 * Fetch with timeout helper
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Maps iTunes API result to our internal Track interface
 */
const mapITunesToTrack = (item: iTunesResult): Track => ({
  id: item.trackId.toString(),
  title: item.trackName,
  artist: item.artistName,
  album: item.collectionName,
  cover_url: item.artworkUrl100.replace('100x100', '600x600'),
  audio_url: item.previewUrl,
  duration: item.trackTimeMillis / 1000, // Convert to seconds
  is_premium: false,
});

export const musicApi = {
  /**
   * Searches for tracks based on a query string
   */
  async searchTracks(query: string): Promise<Track[]> {
    const sanitizedQuery = sanitizeQuery(query);
    if (!sanitizedQuery) return [];
    
    try {
      const response = await fetchWithTimeout(`${BASE_URL}?term=${encodeURIComponent(sanitizedQuery)}&media=music&limit=20&entity=song`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      return (data.results as iTunesResult[]).map(mapITunesToTrack);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      console.error('Error searching tracks:', error);
      throw new Error('Failed to fetch music from the archives.');
    }
  },

  /**
   * Gets related tracks for a specific artist
   */
  async getRelatedTracks(artist: string): Promise<Track[]> {
    const sanitizedArtist = sanitizeQuery(artist);
    if (!sanitizedArtist) return [];

    try {
      const response = await fetchWithTimeout(`${BASE_URL}?term=${encodeURIComponent(sanitizedArtist)}&media=music&limit=10&entity=song`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      return (data.results as iTunesResult[]).map(mapITunesToTrack);
    } catch (error) {
      console.error('Error fetching related tracks:', error);
      return [];
    }
  }
};
