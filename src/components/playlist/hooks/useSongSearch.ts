import { useState, useCallback, type ChangeEvent } from 'react';

import songRepository from '@/lib/repositories/SongRepository';
import type { Song } from '@/lib/types/Song';
import { debounce } from '@/lib/utils/debounce';

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
      const songResults = await songRepository.search(query);
      const songs: Song[] = songResults.map((sr) => ({
        id: sr.id,
        title: sr.title,
        image: sr.image,
        artists: sr.artists,
        album: sr.album,
        duration: sr.duration,
        url: sr.url,
      }));
      setSearchResults(songs);
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

  const debouncedSearchSongs = debounce(fetchSongs, 500);

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
