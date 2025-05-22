import { calculateTotalMinutes } from './calcTotalPlaylistMinutes';
import type { Song } from '../types/Song';

describe('calculateTotalMinutes', () => {
  const createMockSong = (duration: number): Song => ({
    id: `song-${Math.random()}`,
    title: 'Test Song',
    duration: duration,
    album: 'album-1',
    artists: ['artist-1'],
    image: 'test.jpg',
    url: 'test.mp3',
  });

  it('should return 0 for an empty playlist', () => {
    expect(calculateTotalMinutes([])).toBe(0);
  });

  it('should correctly calculate total minutes for a list of songs', () => {
    const songs: Song[] = [
      createMockSong(180), // 3 minutes
      createMockSong(120), // 2 minutes
      createMockSong(240), // 4 minutes
    ];
    expect(calculateTotalMinutes(songs)).toBe(9); // 3 + 2 + 4 = 9
  });

  it('should round to the nearest minute', () => {
    const songs1: Song[] = [createMockSong(89)]; // 1.48 minutes, rounds to 1
    expect(calculateTotalMinutes(songs1)).toBe(1);

    const songs2: Song[] = [createMockSong(90)]; // 1.5 minutes, rounds to 2
    expect(calculateTotalMinutes(songs2)).toBe(2);

    const songs3: Song[] = [createMockSong(50)]; // 0.83 minutes, rounds to 1
    expect(calculateTotalMinutes(songs3)).toBe(1);
  });

  it('should handle songs with zero duration', () => {
    const songs: Song[] = [
      createMockSong(180),
      createMockSong(0),
      createMockSong(120),
    ];
    expect(calculateTotalMinutes(songs)).toBe(5); // 3 + 0 + 2 = 5
  });
});
