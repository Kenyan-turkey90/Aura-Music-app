/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TrackSource = 'itunes' | 'cloud';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  previewUrl: string; // This will be the full URL for cloud tracks
  duration: number;
  source: TrackSource;
  userId?: string; // For cloud tracks
  createdAt?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  favorites: Track[];
  history: Track[];
  user: User | null;
}

export interface iTunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMillis: number;
}
