/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../config/supabase';

export const mpesaService = {
  /**
   * Triggers M-Pesa STK Push
   * @param phoneNumber Kenyan phone number (e.g., 254712345678)
   * @param amount Amount in KES
   * @param accountReference Reference for the transaction (e.g., User ID or Plan Name)
   */
  initiateSTKPush: async (phoneNumber: string, amount: number, accountReference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('initiate-mpesa-stk', {
        body: { phoneNumber, amount, accountReference },
      });

      if (error) throw error;

      if (data?.CheckoutRequestID) {
        // Store the pending payment record
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('pending_payments').insert({
            user_id: user.id,
            checkout_request_id: data.CheckoutRequestID,
            amount,
            currency: 'KES'
          });
        }
      }

      return data; // Returns CheckoutRequestID
    } catch (error) {
      console.error('M-Pesa STK Push failed:', error);
      throw error;
    }
  },

  /**
   * Polls for M-Pesa payment status
   * @param checkoutRequestID The ID returned from initiateSTKPush
   */
  checkPaymentStatus: async (checkoutRequestID: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-mpesa-status', {
        body: { checkoutRequestID },
      });

      if (error) throw error;
      return data; // Returns status (e.g., 'completed', 'pending', 'failed')
    } catch (error) {
      console.error('M-Pesa status check failed:', error);
      throw error;
    }
  },
};
