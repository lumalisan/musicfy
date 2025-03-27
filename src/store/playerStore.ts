import type { Playlist, Song } from '@/lib/data';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CurrentMusic {
  playlist: Playlist | null;
  song: Song | null;
  songs: Song[];
}

interface PlayerStore {
  isPlaying: boolean;
  currentMusic: CurrentMusic;
  volume: number;
  progress: number;
  setVolume: (volume: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMusic: (currentMusic: CurrentMusic) => void;
  setProgress: (progress: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentMusic: { playlist: null, song: null, songs: [] },
      volume: 1,
      progress: 0,
      setVolume: (volume: number) => set({ volume }),
      setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setCurrentMusic: (currentMusic: CurrentMusic) => set({ currentMusic }),
      setProgress: (progress: number) => set({ progress }),
    }),
    {
      name: 'player-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        currentMusic: state.currentMusic,
        progress: state.progress,
      }),
    }
  )
);
