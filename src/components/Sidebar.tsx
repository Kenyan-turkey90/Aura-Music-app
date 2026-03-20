/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Compass, Library, Heart, History, Settings, LogOut, Upload, Cloud, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { usePlayerStore } from '../store/playerStore';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const navItems = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: Compass, label: 'Explore', id: 'explore' },
  { icon: Library, label: 'Library', id: 'library' },
  { icon: Cloud, label: 'Cloud Tracks', id: 'cloud' },
  { icon: Star, label: 'Premium', id: 'premium' },
];

const collectionItems = [
  { icon: Heart, label: 'Favorites', id: 'favorites' },
  { icon: History, label: 'Recent', id: 'recent' },
];

export const Sidebar: React.FC<{ 
  onUploadClick: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}> = ({ onUploadClick, activeView, onViewChange }) => {
  const { user } = usePlayerStore();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <aside className="w-64 h-full flex flex-col border-r border-white/5 bg-[#050505] p-6">
      <div className="mb-10 flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
        </div>
        <span className="text-xl font-serif italic tracking-tight">Aura</span>
      </div>

      <nav className="flex-grow space-y-8 overflow-y-auto custom-scrollbar">
        {user && (
          <div className="px-2 mb-6">
            <button
              onClick={onUploadClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              <Upload size={18} />
              <span>Upload Track</span>
            </button>
          </div>
        )}

        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4 px-2">
            Menu
          </h3>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group ${
                    activeView === item.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} className={activeView === item.id ? 'text-white' : 'text-white/40 group-hover:text-white'} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4 px-2">
            Collection
          </h3>
          <ul className="space-y-1">
            {collectionItems.map((item) => (
              <li key={item.label}>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 group">
                  <item.icon size={18} className="text-white/40 group-hover:text-white" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 group">
          <Settings size={18} className="text-white/40 group-hover:text-white" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        {user && (
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 group"
          >
            <LogOut size={18} className="text-white/40 group-hover:text-white" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
