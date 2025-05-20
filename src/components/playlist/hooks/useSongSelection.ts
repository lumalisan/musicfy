import { useState, useCallback } from 'react';

export function useSongSelection() {
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

  const toggleSongSelection = useCallback((songId: string) => {
    setSelectedSongs((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(songId)) {
        newSelected.delete(songId);
      } else {
        newSelected.add(songId);
      }
      return newSelected;
    });
  }, []);

  const resetSelectedSongs = useCallback(() => {
    setSelectedSongs(new Set());
  }, []);

  return {
    selectedSongs,
    toggleSongSelection,
    resetSelectedSongs,
  };
}
