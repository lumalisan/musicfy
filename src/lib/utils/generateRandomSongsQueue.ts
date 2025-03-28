import type { Song } from '../types/Song';

// Generate a random songs queue given a list of songs and the current song
// the current song is placed at the beginning of the queue
export const generateRandomSongsQueue = (songs: Song[], currentSong: Song) => {
  const randomSongs = songs.filter((song) => song.id !== currentSong.id);
  randomSongs.sort(() => Math.random() - 0.5);
  return [currentSong, ...randomSongs];
};
