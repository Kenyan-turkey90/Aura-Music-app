/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { X, Upload, Music, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { storage } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { supabase } from '../config/supabase';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'motion/react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { user } = usePlayerStore();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!user || !audioFile || !title || !artist) return;
    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Upload Audio
      const audioRef = ref(storage, `tracks/${user.uid}/${Date.now()}_${audioFile.name}`);
      const audioUploadTask = uploadBytesResumable(audioRef, audioFile);

      audioUploadTask.on('state_changed', (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      });

      await audioUploadTask;
      const audioUrl = await getDownloadURL(audioRef);

      // 2. Upload Cover (Optional)
      let coverUrl = '';
      if (coverFile) {
        const coverRef = ref(storage, `covers/${user.uid}/${Date.now()}_${coverFile.name}`);
        await uploadBytesResumable(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverRef);
      }

      // 3. Save to Supabase
      const { error: dbError } = await supabase.from('tracks').insert({
        user_id: user.uid,
        title,
        artist,
        audio_url: audioUrl,
        cover_url: coverUrl,
        is_premium: false,
        created_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setTitle('');
        setArtist('');
        setAudioFile(null);
        setCoverFile(null);
        setProgress(0);
      }, 2000);

    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif italic text-white">Upload Track</h2>
            <p className="text-sm text-white/40">Share your music with the archive</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <CheckCircle className="text-emerald-500" size={64} />
              <p className="text-white font-semibold">Track Uploaded Successfully!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 ml-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="Track Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 ml-1">Artist</label>
                  <input 
                    type="text" 
                    placeholder="Artist Name"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => audioInputRef.current?.click()}
                  className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                    audioFile ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <Music className={audioFile ? 'text-emerald-400' : 'text-white/40'} size={32} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                    {audioFile ? audioFile.name : 'Audio File'}
                  </span>
                </button>

                <button 
                  onClick={() => coverInputRef.current?.click()}
                  className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                    coverFile ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <ImageIcon className={coverFile ? 'text-indigo-400' : 'text-white/40'} size={32} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                    {coverFile ? coverFile.name : 'Cover Art'}
                  </span>
                </button>
              </div>

              <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-white/40">
                    <span>Uploading...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <button 
                onClick={handleUpload}
                disabled={isUploading || !audioFile || !title || !artist}
                className="w-full h-14 bg-white text-black font-bold rounded-2xl hover:bg-emerald-500 hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="animate-spin" size={24} /> : <><Upload size={20} /> Upload to Aura</>}
              </button>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs text-center">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
