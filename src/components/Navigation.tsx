/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { musicApi } from '../services/musicApi';
import { usePlayerStore } from '../store/playerStore';
import { Auth } from './Auth';

interface NavigationProps {
  onSearch: (results: any[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onSearch, setIsLoading }) => {
  const [query, setQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const results = await musicApi.searchTracks(query);
      onSearch(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="relative group ml-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search for artists, songs, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[400px] h-11 pl-12 pr-4 bg-white/5 border border-white/5 rounded-full text-sm focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-white/20"
          />
        </form>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-white/40 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full border-2 border-[#050505]" />
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <Auth />
        </div>
      </div>
    </header>
  );
};
