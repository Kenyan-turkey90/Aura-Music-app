/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Track } from '../types';

interface PlayerState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Player state
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Track[];
  history: Track[];
  
  // Actions
  setTrack: (track: Track) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  queue: [],
  history: [],
  
  setTrack: (track) => {
    const { currentTrack, history } = get();
    const newHistory = currentTrack ? [currentTrack, ...history].slice(0, 50) : history;
    set({ currentTrack: track, isPlaying: true, progress: 0, history: newHistory });
  },
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setPlaying: (isPlaying) => set({ isPlaying }),
  
  setVolume: (volume) => set({ volume }),
  
  setProgress: (progress) => set({ progress }),
  
  setDuration: (duration) => set({ duration }),
  
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  
  removeFromQueue: (trackId) => set((state) => ({ 
    queue: state.queue.filter(t => t.id !== trackId) 
  })),
  
  clearQueue: () => set({ queue: [] }),
  
  nextTrack: () => {
    const { queue, setTrack } = get();
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      set({ queue: rest });
      setTrack(next);
    }
  },
  
  previousTrack: () => {
    const { history, setTrack } = get();
    if (history.length > 0) {
      const [prev, ...rest] = history;
      set({ history: rest });
      setTrack(prev);
    }
  }
}));
