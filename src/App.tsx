/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Library as LibraryIcon, 
  Plus, 
  User, 
  LogOut, 
  Music, 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  Loader2, 
  Heart 
} from 'lucide-react';
import { authService } from './services/authService';
import { usePlayerStore } from './store/playerStore';
import { PlayerBar } from './components/PlayerBar';
import { SearchView } from './components/SearchView';
import { Library } from './components/Library';
import { PaymentModal } from './components/PaymentModal';
import { UploadModal } from './components/UploadModal';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const { user, setUser } = usePlayerStore();
  const [view, setView] = useState<'home' | 'search' | 'library'>('home');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  const handleLogin = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-black to-indigo-500/10" />
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center space-y-8 max-w-lg"
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-black shadow-2xl">
              <Music size={40} fill="currentColor" />
            </div>
            <h1 className="text-6xl font-serif italic text-white tracking-tighter">Aura</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-white">The Archive of Sound</h2>
            <p className="text-white/40 text-lg leading-relaxed">
              Experience high-fidelity music streaming with seamless M-Pesa & Paystack integration. 
              Join the community of creators and listeners.
            </p>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full h-16 bg-white text-black font-bold rounded-2xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-4 group shadow-xl"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center justify-center gap-8 pt-12 opacity-20">
            <Smartphone size={24} className="text-white" />
            <CreditCard size={24} className="text-white" />
            <ShieldCheck size={24} className="text-white" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black">
            <Music size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-serif italic">Aura</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setView('home')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'home' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <Home size={20} />
            <span className="text-sm font-semibold">Home</span>
          </button>
          <button 
            onClick={() => setView('search')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'search' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <Search size={20} />
            <span className="text-sm font-semibold">Search</span>
          </button>
          <button 
            onClick={() => setView('library')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'library' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <LibraryIcon size={20} />
            <span className="text-sm font-semibold">Library</span>
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-sm font-semibold"
          >
            <Plus size={18} />
            <span>Upload Track</span>
          </button>
          
          <button 
            onClick={() => setIsPaymentOpen(true)}
            className="w-full h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all text-sm font-bold shadow-lg shadow-emerald-500/20"
          >
            <ShieldCheck size={18} />
            <span>Go Premium</span>
          </button>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold truncate max-w-[80px]">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="text-white/20 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto p-8 pb-32"
            >
              <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4">
                  <h1 className="text-5xl font-serif italic text-white">Welcome Back</h1>
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Curated for {user.displayName}</p>
                </header>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Featured Archive</h2>
                    <button className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">View All</button>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-6 left-6 right-6 space-y-1">
                          <h3 className="text-lg font-semibold text-white">Collection {i}</h3>
                          <p className="text-xs text-white/40">Experimental Soundscapes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Recently Played</h2>
                    <button className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">History</button>
                  </div>
                  <div className="flex items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl text-white/20">
                    <div className="text-center space-y-4">
                      <Heart size={48} className="mx-auto opacity-20" />
                      <p>Your history will appear here.</p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {view === 'search' && <SearchView key="search" />}
          {view === 'library' && <Library key="library" />}
        </AnimatePresence>
      </main>

      {/* Modals & Player */}
      <PlayerBar />
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        planName="Aura Premium" 
        amount={1000} 
      />
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </div>
  );
};

export default App;
