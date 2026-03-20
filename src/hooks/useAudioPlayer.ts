/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../store/playerStore';

export const useAudioPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    setPlaying, 
    setProgress, 
    setDuration, 
    nextTrack 
  } = usePlayerStore();
  
  const soundRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    if (!currentTrack) return;

    // Unload previous sound
    if (soundRef.current) {
      soundRef.current.unload();
    }

    // Create new sound
    soundRef.current = new Howl({
      src: [currentTrack.audio_url],
      html5: true, // Use HTML5 audio for streaming
      volume: volume,
      onload: () => {
        setDuration(soundRef.current?.duration() || 0);
      },
      onplay: () => {
        setPlaying(true);
        startProgressLoop();
      },
      onpause: () => {
        setPlaying(false);
        stopProgressLoop();
      },
      onstop: () => {
        setPlaying(false);
        stopProgressLoop();
        setProgress(0);
      },
      onend: () => {
        setPlaying(false);
        stopProgressLoop();
        setProgress(0);
        nextTrack();
      },
      onloaderror: (id, error) => {
        console.error('Audio load error:', error);
      },
      onplayerror: (id, error) => {
        console.error('Audio play error:', error);
        soundRef.current?.once('unlock', () => {
          soundRef.current?.play();
        });
      }
    });

    if (isPlaying) {
      soundRef.current.play();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [currentTrack]);

  // Handle play/pause toggle
  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      if (!soundRef.current.playing()) {
        soundRef.current.play();
      }
    } else {
      if (soundRef.current.playing()) {
        soundRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  const startProgressLoop = () => {
    const updateProgress = () => {
      if (soundRef.current && soundRef.current.playing()) {
        const seek = soundRef.current.seek();
        setProgress(typeof seek === 'number' ? seek : 0);
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };
    rafRef.current = requestAnimationFrame(updateProgress);
  };

  const stopProgressLoop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const seek = (time: number) => {
    if (soundRef.current) {
      soundRef.current.seek(time);
      setProgress(time);
    }
  };

  return { seek };
};
