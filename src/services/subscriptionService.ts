/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../config/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium';
  amount: number;
  currency: 'KES' | 'USD';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  renewal_date: string;
  created_at: string;
}

export const subscriptionService = {
  /**
   * Fetches the current user's subscription
   */
  getCurrentSubscription: async (userId: string): Promise<Subscription | null> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
      return data;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      throw error;
    }
  },

  /**
   * Creates or updates a subscription record
   * (Usually called by Webhooks, but can be used for manual updates)
   */
  updateSubscription: async (subscriptionData: Partial<Subscription>) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  },

  /**
   * Checks if a user has an active premium subscription
   */
  isPremium: async (userId: string): Promise<boolean> => {
    const subscription = await subscriptionService.getCurrentSubscription(userId);
    if (!subscription) return false;
    
    const now = new Date();
    const renewalDate = new Date(subscription.renewal_date);
    
    return subscription.status === 'active' && renewalDate > now;
  },
};
