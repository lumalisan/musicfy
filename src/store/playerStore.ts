import type { Playlist, Song } from '@/lib/data';
import { create } from 'zustand';

interface CurrentMusic {
  playlist: Playlist | null;
  song: Song | null;
  songs: Song[];
}

interface PlayerStore {
  isPlaying: boolean;
  currentMusic: CurrentMusic;
  volume: number;
  setVolume: (volume: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMusic: (currentMusic: CurrentMusic) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  isPlaying: false,
  currentMusic: { playlist: null, song: null, songs: [] },
  volume: 1,
  setVolume: (volume) => set({ volume }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentMusic: (currentMusic) => set({ currentMusic }),
}));
