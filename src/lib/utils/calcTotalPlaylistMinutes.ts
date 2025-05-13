import type { Song } from '../types/Song';

export const calculateTotalMinutes = (playListSongs: Song[]) => {
  const totalSeconds = playListSongs.reduce((total, song) => {
    return total + song.duration;
  }, 0);

  return Math.round(totalSeconds / 60);
};
