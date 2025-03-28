import type { Playlist } from '@/lib/types/Playlist';
import type { Song } from '@/lib/types/Song';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CurrentMusic {
  playlist: Playlist | null;
  song: Song | null;
  songsQueue: Song[];
}

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
