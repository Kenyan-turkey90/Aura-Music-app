/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { usePlayerStore } from '../store/playerStore';
import { Track } from '../types';
import { Play, Plus, Heart, Music, Loader2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Library: React.FC = () => {
  const { user, setTrack, addToQueue } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLibrary();
    }
  }, [user]);

  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Failed to fetch library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-end gap-6 mb-8">
          <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 shadow-2xl flex items-center justify-center text-white/40">
            <Heart size={80} fill="currentColor" className="text-white/20" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Playlist</span>
            <h1 className="text-6xl font-serif italic text-white">Your Library</h1>
            <p className="text-sm text-white/40">{tracks.length} tracks · Saved to your account</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-white/20 border-b border-white/5">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Date Added</span>
            <span></span>
          </div>

          <AnimatePresence mode="popLayout">
            {tracks.map((track, index) => (
              <motion.div 
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group grid grid-cols-[40px_1fr_1fr_1fr_40px] items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                onClick={() => setTrack(track)}
              >
                <div className="text-xs font-mono text-white/20 group-hover:text-emerald-500 transition-colors">
                  {index + 1}
                </div>
                
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <Music size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                    <p className="text-xs text-white/40 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="text-xs text-white/40 truncate">
                  {track.album || 'Unknown Album'}
                </div>

                <div className="text-xs text-white/40 font-mono">
                  {new Date().toLocaleDateString()}
                </div>

                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                    }}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {tracks.length === 0 && (
            <div className="text-center py-20 text-white/20">
              <Music size={48} className="mx-auto mb-4 opacity-20" />
              <p>Your library is empty. Start adding tracks from search!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
