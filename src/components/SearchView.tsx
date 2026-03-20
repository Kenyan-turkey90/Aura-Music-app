/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Play, Plus, Loader2, Music } from 'lucide-react';
import { musicApi } from '../services/musicApi';
import { usePlayerStore } from '../store/playerStore';
import { Track } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setTrack, addToQueue } = usePlayerStore();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const tracks = await musicApi.searchTracks(query);
      setResults(tracks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Search for tracks, artists, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-lg focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
          />
          {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={24} />}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif italic text-white/80">
            {query ? `Results for "${query}"` : 'Discover New Music'}
          </h2>
          
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence mode="popLayout">
              {results.map((track, index) => (
                <motion.div 
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => setTrack(track)}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Music size={20} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play size={20} fill="currentColor" className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                    <p className="text-xs text-white/40 truncate">{track.artist}</p>
                  </div>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && query && results.length === 0 && (
              <div className="text-center py-20 text-white/20">
                <Music size={48} className="mx-auto mb-4 opacity-20" />
                <p>No tracks found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
