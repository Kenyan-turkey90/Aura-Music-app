/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { paystackService } from '../services/paystackService';
import { mpesaService } from '../services/mpesaService';
import { subscriptionService, Subscription } from '../services/subscriptionService';
import { spotifyService } from '../services/spotifyService';
import { usePlayerStore } from '../store/playerStore';
import { CreditCard, Smartphone, CheckCircle, Loader2, AlertCircle, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SubscriptionManager: React.FC = () => {
  const { user } = usePlayerStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'mpesa' | null>(null);
  const [isOffline, setIsOffline] = useState(spotifyService.isOffline());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (user) {
      fetchSubscription();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const sub = await subscriptionService.getCurrentSubscription(user.uid);
      setSubscription(sub);
      
      // Lazy load Spotify SDK if user is premium
      if (sub?.status === 'active' && !isOffline) {
        await spotifyService.loadSDK();
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackPayment = () => {
    if (!user) return;
    setIsProcessing(true);
    setError(null);

    paystackService.initializePayment(
      user.email,
      1000, // 1000 KES
      'KES',
      async (reference) => {
        try {
          await paystackService.verifyTransaction(reference);
          await fetchSubscription();
          setIsProcessing(false);
        } catch (err) {
          setError('Payment verification failed. Please contact support.');
          setIsProcessing(false);
        }
      },
      () => {
        setIsProcessing(false);
      }
    );
  };

  const handleMpesaPayment = async () => {
    if (!user || !phoneNumber) return;
    setIsProcessing(true);
    setError(null);

    try {
      const { checkoutRequestID } = await mpesaService.initiateSTKPush(
        phoneNumber,
        1000, // 1000 KES
        'Aura Premium'
      );

      // Poll for status
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 12) { // 1 minute timeout
          clearInterval(interval);
          setError('M-Pesa payment timed out. Please check your phone.');
          setIsProcessing(false);
          return;
        }

        try {
          const status = await mpesaService.checkPaymentStatus(checkoutRequestID);
          if (status === 'completed') {
            clearInterval(interval);
            await fetchSubscription();
            setIsProcessing(false);
          } else if (status === 'failed') {
            clearInterval(interval);
            setError('M-Pesa payment failed. Please try again.');
            setIsProcessing(false);
          }
        } catch (err) {
          // Continue polling
        }
      }, 5000);
    } catch (err) {
      setError('Failed to initiate M-Pesa payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  const isPremium = subscription?.status === 'active' && new Date(subscription.renewal_date) > new Date();

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif italic mb-2">Aura Premium</h2>
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Unlock the Full Archive</p>
      </div>

      {isOffline && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm">
          <WifiOff size={18} />
          <p>You are offline. Premium features and payments are disabled.</p>
        </div>
      )}

      {isPremium ? (
        <div className="flex flex-col items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <CheckCircle className="text-emerald-500" size={48} />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">Active Subscription</h3>
            <p className="text-sm text-white/60">Renews on {new Date(subscription.renewal_date).toLocaleDateString()}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('paystack')}
              disabled={isOffline}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                isOffline ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                paymentMethod === 'paystack' ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <CreditCard className="text-indigo-400" size={32} />
              <div className="text-center">
                <span className="block font-semibold">Paystack</span>
                <span className="text-xs text-white/40">Card & International</span>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('mpesa')}
              disabled={isOffline}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                isOffline ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                paymentMethod === 'mpesa' ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <Smartphone className="text-emerald-400" size={32} />
              <div className="text-center">
                <span className="block font-semibold">M-Pesa</span>
                <span className="text-xs text-white/40">Local Mobile Money</span>
              </div>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {paymentMethod === 'mpesa' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-white/5"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleMpesaPayment}
                  disabled={isProcessing || !phoneNumber}
                  className="w-full h-12 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Pay with M-Pesa (KES 1,000)'}
                </button>
              </motion.div>
            )}

            {paymentMethod === 'paystack' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-white/5"
              >
                <button
                  onClick={handlePaystackPayment}
                  disabled={isProcessing}
                  className="w-full h-12 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Pay with Card (KES 1,000)'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
