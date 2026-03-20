/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../config/supabase';

declare const PaystackPop: any;

export const paystackService = {
  /**
   * Initializes Paystack Inline Checkout
   * @param email User's email
   * @param amount Amount in KES or USD (Paystack expects kobo/cents)
   * @param currency 'KES' or 'USD'
   * @param onComplete Callback on successful payment
   * @param onCancel Callback on user cancel
   */
  initializePayment: (
    email: string,
    amount: number,
    currency: 'KES' | 'USD',
    onComplete: (reference: string) => void,
    onCancel: () => void
  ) => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error('Paystack Public Key not found');
      return;
    }

    // Paystack expects amount in minor units (cents/kobo)
    const amountInMinor = amount * 100;

    const handler = PaystackPop.setup({
      key: publicKey,
      email: email,
      amount: amountInMinor,
      currency: currency,
      callback: (response: { reference: string }) => {
        onComplete(response.reference);
      },
      onClose: () => {
        onCancel();
      },
    });

    handler.openIframe();
  },

  /**
   * Verifies a transaction via Supabase Edge Function
   * @param reference Paystack transaction reference
   */
  verifyTransaction: async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference, provider: 'paystack' },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Paystack verification failed:', error);
      throw error;
    }
  },
};
