import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CurrentMusic } from '@/lib/types/CurrentMusic';
import type { Song } from '@/lib/types/Song';
import type { ItemInfo } from '@/lib/types/ItemInfo';

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
  toggleRepeat: () => void;
  loadAndPlayMusic: (data: {
    songsQueue: Song[];
    itemInfo: ItemInfo;
    songIndex?: number;
  }) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentMusic: { itemInfo: null, song: null, songsQueue: [] },
      volume: 0.5,
      isRandom: false,
      isRepeat: false,

      setVolume: (volume: number) => {
        const newVolume = Math.max(0, Math.min(1, volume));
        set({ volume: newVolume });
      },
      setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setCurrentMusic: (currentMusic: CurrentMusic) => set({ currentMusic }),
      setIsRandom: (isRandom: boolean) => set({ isRandom }),
      toggleRepeat: () => set({ isRepeat: !get().isRepeat }),
      loadAndPlayMusic: ({ songsQueue, itemInfo, songIndex = 0 }) => {
        if (!songsQueue || songsQueue.length === 0) {
          console.warn('loadAndPlayMusic: songsQueue is empty or undefined.');
          return;
        }
        const validSongIndex = Math.max(
          0,
          Math.min(songIndex, songsQueue.length - 1)
        );
        const songToPlay = songsQueue[validSongIndex];

        set({
          currentMusic: {
            songsQueue,
            itemInfo,
            song: songToPlay,
          },
          isPlaying: true,
        });
      },

      playNext: () => {
        const { songsQueue, song: currentSong, itemInfo } = get().currentMusic;
        const isRandom = get().isRandom;
        const isRepeat = get().isRepeat;

        if (!songsQueue || songsQueue.length === 0 || !currentSong || !itemInfo)
          return;

        let currentIndex = songsQueue.findIndex((s) => s.id === currentSong.id);
        let nextIndex: number;

        if (isRandom) {
          if (songsQueue.length === 1 && !isRepeat) {
            set({ isPlaying: false });
            return;
          }
          do {
            nextIndex = Math.floor(Math.random() * songsQueue.length);
          } while (songsQueue.length > 1 && nextIndex === currentIndex);
        } else {
          nextIndex = currentIndex + 1;
        }

        if (nextIndex >= songsQueue.length) {
          if (isRepeat) {
            nextIndex = 0;
          } else {
            set({
              currentMusic: {
                ...get().currentMusic,
                song: songsQueue[songsQueue.length - 1],
              },
              isPlaying: false,
            });
            return;
          }
        }

        set({
          currentMusic: { ...get().currentMusic, song: songsQueue[nextIndex] },
          isPlaying: true,
        });
      },

      playPrevious: () => {
        const { songsQueue, song: currentSong, itemInfo } = get().currentMusic;

        if (!songsQueue || songsQueue.length === 0 || !currentSong || !itemInfo)
          return;

        let currentIndex = songsQueue.findIndex((s) => s.id === currentSong.id);
        let prevIndex: number;

        prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
          set({ isPlaying: false });
          return;
        }

        set({
          currentMusic: { ...get().currentMusic, song: songsQueue[prevIndex] },
          isPlaying: true,
        });
      },
    }),
    {
      name: 'musicfy-player-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        currentMusic: {
          itemInfo: state.currentMusic.itemInfo,
          song: state.currentMusic.song,
          songsQueue: state.currentMusic.songsQueue,
        },
        isRandom: state.isRandom,
        isRepeat: state.isRepeat,
      }),
    }
  )
);
