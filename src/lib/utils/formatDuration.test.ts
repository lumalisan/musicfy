import { formatDuration, parseDuration } from './formatDuration';

describe('formatDuration', () => {
  it('should format seconds into MM:SS string', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(120)).toBe('2:00');
    expect(formatDuration(155)).toBe('2:35');
    expect(formatDuration(650)).toBe('10:50');
  });

  it('should handle invalid inputs gracefully', () => {
    expect(formatDuration(-10)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });

  it('should ensure seconds are padded with a leading zero if less than 10', () => {
    expect(formatDuration(61)).toBe('1:01');
    expect(formatDuration(123)).toBe('2:03');
  });
});

describe('parseDuration', () => {
  it('should parse MM:SS string to seconds', () => {
    expect(parseDuration('0:00')).toBe(0);
    expect(parseDuration('0:05')).toBe(5);
    expect(parseDuration('0:59')).toBe(59);
    expect(parseDuration('1:00')).toBe(60);
    expect(parseDuration('1:05')).toBe(65);
    expect(parseDuration('2:00')).toBe(120);
    expect(parseDuration('2:35')).toBe(155);
    expect(parseDuration('10:50')).toBe(650);
  });

  it('should handle invalid or malformed strings gracefully', () => {
    expect(parseDuration('')).toBe(0);
    expect(parseDuration('abc')).toBe(0);
    expect(parseDuration('10:')).toBe(0);
    expect(parseDuration(':30')).toBe(0);
    expect(parseDuration('1:abc')).toBe(0);
    expect(parseDuration('xyz:30')).toBe(0);
    expect(parseDuration('5:30:20')).toBe(0);
  });

  it('should handle strings with non-numeric parts resulting in NaN', () => {
    expect(parseDuration('one:two')).toBe(0);
  });
});
