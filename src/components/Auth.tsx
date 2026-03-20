/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { usePlayerStore } from '../store/playerStore';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Auth: React.FC = () => {
  const { user } = usePlayerStore();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden md:block">
        <p className="text-sm font-medium text-white">{user.displayName}</p>
        <p className="text-[10px] font-mono uppercase tracking-wider text-white/30">Premium</p>
      </div>
      <div className="relative group">
        <button className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-all">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <UserIcon size={20} className="text-white/60" />
            </div>
          )}
        </button>
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#121212] border border-white/5 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={16} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
