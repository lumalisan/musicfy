import { formatSongDuration } from './formatSongDuration';

describe('formatSongDuration', () => {
  it('should format duration correctly for less than 10 seconds', () => {
    expect(formatSongDuration(5)).toBe('0:05');
  });

  it('should format duration correctly for more than 10 seconds', () => {
    expect(formatSongDuration(45)).toBe('0:45');
  });

  it('should format duration correctly for full minutes', () => {
    expect(formatSongDuration(120)).toBe('2:00');
  });

  it('should format duration correctly for minutes and seconds', () => {
    expect(formatSongDuration(155)).toBe('2:35');
  });

  it('should format duration correctly for zero seconds', () => {
    expect(formatSongDuration(0)).toBe('0:00');
  });

  it('should handle durations that result in more than 9 minutes', () => {
    expect(formatSongDuration(650)).toBe('10:50');
  });
});
