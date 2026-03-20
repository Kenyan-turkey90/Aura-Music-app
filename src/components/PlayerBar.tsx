/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Heart 
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PlayerBar: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    volume, 
    setVolume, 
    progress, 
    duration, 
    nextTrack, 
    previousTrack 
  } = usePlayerStore();
  
  const { seek } = useAudioPlayer();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-between z-50">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/10 shadow-lg">
          {currentTrack.cover_url ? (
            <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <Heart size={24} />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-white truncate max-w-[200px]">{currentTrack.title}</h4>
          <p className="text-xs text-white/40 truncate max-w-[200px]">{currentTrack.artist}</p>
        </div>
        <button className="text-white/40 hover:text-emerald-500 transition-colors ml-2">
          <Heart size={18} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 w-1/3">
        <div className="flex items-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors">
            <Shuffle size={18} />
          </button>
          <button 
            onClick={previousTrack}
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={nextTrack}
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button className="text-white/40 hover:text-white transition-colors">
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] font-mono text-white/40 w-10 text-right">{formatTime(progress)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            step="0.1"
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-emerald-500 transition-all"
          />
          <span className="text-[10px] font-mono text-white/40 w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extra */}
      <div className="flex items-center justify-end gap-4 w-1/3">
        <div className="flex items-center gap-2 group">
          <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-white/40 group-hover:text-white transition-colors">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-emerald-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
