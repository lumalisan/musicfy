import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CurrentMusic } from '@/lib/types/CurrentMusic';
import type { Song } from '@/lib/types/Song';

interface PlayerStore {
  volume: number;
  isPlaying: boolean;
  currentMusic: CurrentMusic;
  isRandom: boolean;
  isRepeat: boolean;
  setVolume: (volume: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMusic: (currentMusic: CurrentMusic) => void;
  setIsRandom: (isRandom: boolean) => void;
  setIsRepeat: (isRepeat: boolean) => void;
  loadAndPlayMusic: (data: {
    songsQueue: Song[];
    playlist: any;
    song: Song;
  }) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, _) => ({
      isPlaying: false,
      currentMusic: { playlist: null, song: null, songsQueue: [] },
      volume: 1,
      isRandom: false,
      isRepeat: false,
      setVolume: (volume: number) => set({ volume }),
      setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setCurrentMusic: (currentMusic: CurrentMusic) => set({ currentMusic }),
      setIsRandom: (isRandom: boolean) => set({ isRandom }),
      setIsRepeat: (isRepeat: boolean) => set({ isRepeat }),
      loadAndPlayMusic: (data) => {
        set({
          currentMusic: {
            songsQueue: data.songsQueue,
            playlist: data.playlist,
            song: data.song,
          },
          isPlaying: true,
        });
      },
    }),
    {
      name: 'player-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        currentMusic: state.currentMusic,
        isRandom: state.isRandom,
        isRepeat: state.isRepeat,
      }),
    }
  )
);
