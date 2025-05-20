/**
 * Formats a duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "03:45")
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  // Format as MM:SS with leading zeros
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Parses a duration string in MM:SS format to seconds
 * @param durationString - Duration string in MM:SS format
 * @returns Duration in seconds
 */
export const parseDuration = (durationString: string): number => {
  if (!durationString) return 0;
  
  const [minutes, seconds] = durationString.split(':').map(Number);
  
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  
  return minutes * 60 + seconds;
};
