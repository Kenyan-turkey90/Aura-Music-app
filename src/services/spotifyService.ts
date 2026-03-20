/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const spotifyService = {
  /**
   * Lazy loads the Spotify Web Playback SDK script
   */
  loadSDK: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Spotify) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      script.onload = () => {
        (window as any).onSpotifyWebPlaybackSDKReady = () => {
          console.log('Spotify SDK Ready');
          resolve();
        };
      };

      script.onerror = (err) => {
        console.error('Failed to load Spotify SDK:', err);
        reject(err);
      };

      document.body.appendChild(script);
    });
  },

  /**
   * Checks if the user is currently offline
   */
  isOffline: (): boolean => {
    return !navigator.onLine;
  },
};
