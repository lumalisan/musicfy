import { useState, useCallback, type ChangeEvent } from 'react';
import { debounce } from '@/lib/utils/debounce';
import type { Song } from '@/lib/types/Song';
import { API_BASE_URL } from '@/lib/constants';

export function useSongSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchSongs = useCallback(async (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/songs.json?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(
          errorData.message || `Failed to fetch songs: ${response.statusText}`
        );
      }
      const data: Song[] = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      console.error('Song search error:', err);
      setSearchError(
        err.message || 'An unexpected error occurred while searching.'
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearchSongs = useCallback(debounce(fetchSongs, 500), [
    fetchSongs,
  ]);

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearchSongs(query);
  };

  const resetSearchState = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    handleSearchInputChange,
    resetSearchState,
  };
}
