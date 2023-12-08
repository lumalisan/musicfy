import type { Song } from '@/lib/data';

export const calculateTotalMinutes = (playListSongs: Song[]) => {
  const totalSeconds = playListSongs.reduce((total, song) => {
    const [minutes, seconds] = song.duration.split(':');
    return total + Number.parseInt(minutes) * 60 + Number.parseInt(seconds);
  }, 0);

  return Math.round(totalSeconds / 60);
};
