/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  /**
   * Sign in with Google
   */
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Sync user to Supabase
      if (user) {
        await supabase.from('users').upsert({
          id: user.uid,
          email: user.email,
          display_name: user.displayName,
          photo_url: user.photoURL,
          updated_at: new Date().toISOString(),
        });
      }

      return user;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  },

  /**
   * Sign out
   */
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    return auth.currentUser;
  }
};
