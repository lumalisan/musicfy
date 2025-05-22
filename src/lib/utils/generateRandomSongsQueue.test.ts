import { generateRandomSongsQueue } from './generateRandomSongsQueue';
import type { Song } from '../types/Song';

const createMockSong = (id: string, title: string = 'Test Song'): Song => ({
  id,
  title,
  duration: 180,
  album: `album-${id}`,
  artists: [`artist-${id}`],
  image: `image-${id}`,
  url: `url-${id}`,
});

describe('generateRandomSongsQueue', () => {
  const song1 = createMockSong('1', 'Song One');
  const song2 = createMockSong('2', 'Song Two');
  const song3 = createMockSong('3', 'Song Three');
  const song4 = createMockSong('4', 'Song Four');
  const allSongs = [song1, song2, song3, song4];

  it('should place the current song at the beginning of the queue', () => {
    const queue = generateRandomSongsQueue(allSongs, song2);
    expect(queue[0]).toEqual(song2);
  });

  it('should return a queue with the same length as the original songs list', () => {
    const queue = generateRandomSongsQueue(allSongs, song3);
    expect(queue.length).toBe(allSongs.length);
  });

  it('should contain all original songs and no duplicates or extra songs', () => {
    const queue = generateRandomSongsQueue(allSongs, song1);
    allSongs.forEach((song) => {
      expect(queue.find((s) => s.id === song.id)).toBeDefined();
    });
    const uniqueIdsInQueue = new Set(queue.map((s) => s.id));
    expect(uniqueIdsInQueue.size).toBe(queue.length);
  });

  it('should shuffle the remaining songs (heuristic check)', () => {
    if (allSongs.length > 2) {
      const queue = generateRandomSongsQueue(allSongs, song1);
      const remainingOriginal = allSongs.filter((s) => s.id !== song1.id);
      const remainingShuffled = queue.slice(1);
      expect(remainingShuffled).not.toEqual(remainingOriginal);
    } else {
      const queue = generateRandomSongsQueue([song1, song2], song1);
      expect(queue).toEqual([song1, song2]);
    }
  });

  it('should handle an empty list of songs', () => {
    const currentSong = createMockSong('current');
    const queue = generateRandomSongsQueue([], currentSong);
    expect(queue).toEqual([currentSong]);
    expect(queue.length).toBe(1);
  });

  it('should handle a list with only the current song', () => {
    const queue = generateRandomSongsQueue([song1], song1);
    expect(queue).toEqual([song1]);
    expect(queue.length).toBe(1);
  });
});
