/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CreditCard, Smartphone, ShieldCheck, Loader2 } from 'lucide-react';
import { paystackService } from '../services/paystackService';
import { mpesaService } from '../services/mpesaService';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planName, amount }) => {
  const { user } = usePlayerStore();
  const [method, setMethod] = useState<'paystack' | 'mpesa' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePaystack = () => {
    if (!user) return;
    setIsProcessing(true);
    paystackService.initializePayment(
      user.email || 'guest@aura.music',
      amount,
      'KES',
      (ref) => {
        console.log('Payment success:', ref);
        setIsProcessing(false);
        onClose();
      },
      () => {
        setIsProcessing(false);
      }
    );
  };

  const handleMpesa = async () => {
    if (!phoneNumber) return;
    setIsProcessing(true);
    try {
      await mpesaService.initiateSTKPush(phoneNumber, amount, planName);
      // In a real app, we'd poll for status here
      setIsProcessing(false);
      onClose();
    } catch (err) {
      setError('M-Pesa initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif italic text-white">Upgrade to {planName}</h2>
            <p className="text-sm text-white/40">Choose your preferred payment method</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMethod('paystack')}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                method === 'paystack' ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <CreditCard className={method === 'paystack' ? 'text-indigo-400' : 'text-white/40'} size={32} />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Paystack</span>
            </button>

            <button 
              onClick={() => setMethod('mpesa')}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                method === 'mpesa' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <Smartphone className={method === 'mpesa' ? 'text-emerald-400' : 'text-white/40'} size={32} />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/60">M-Pesa</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {method === 'mpesa' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <button 
                  onClick={handleMpesa}
                  disabled={isProcessing || !phoneNumber}
                  className="w-full h-12 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : `Pay KES ${amount.toLocaleString()}`}
                </button>
              </motion.div>
            )}

            {method === 'paystack' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <button 
                  onClick={handlePaystack}
                  disabled={isProcessing}
                  className="w-full h-12 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : `Pay KES ${amount.toLocaleString()}`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/20">
            <ShieldCheck size={14} />
            <span>Secure SSL Encrypted Payment</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
