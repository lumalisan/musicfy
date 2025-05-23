import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useCallback, useEffect } from 'react';

import { SearchInput } from '@/components/ui/SearchInput';
import { searchRepository } from '@/lib/repositories';
import type { SearchResult } from '@/lib/types/SearchResultItem';
import { AppError } from '@/lib/utils/errorHandling';

import { SearchResults } from './SearchResults';

const initialResults: SearchResult = {
  songs: [],
  albums: [],
  playlists: [],
};

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>(initialResults);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults(initialResults);
      return;
    }

    setIsLoading(true);

    try {
      const data = await searchRepository.searchAll(query.trim());
      setResults(data);
      setErrorMessage('');
    } catch (error: any) {
      if (error instanceof AppError) {
        console.error(
          `Search error (Code: ${error.code}, Status: ${error.statusCode}): ${error.message}`,
          error.details
        );
        setErrorMessage(
          error.message || 'An error occurred during the search.'
        );
      } else {
        console.error('Search error:', error?.message || error);
        setErrorMessage(
          'An unexpected error occurred while searching. Please try again later.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle initial search from URL hash
  useEffect(() => {
    const initialSearch = window.location.hash
      ? decodeURIComponent(window.location.hash.substring(1))
      : '';

    if (initialSearch) {
      setSearchQuery(initialSearch);
      handleSearch(initialSearch);
    }
  }, [handleSearch]);

  return (
    <div className='mt-12 p-4 md:mt-0 md:p-6'>
      <h1 className='text-3xl font-bold'>Search</h1>

      <div className='mt-4 mb-8'>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1 rounded-md p-2'>
              <SearchInput
                placeholder='Search for songs, albums, or playlists...'
                onSearch={handleSearch}
                isLoading={isLoading}
                className='w-full'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </form>

        {errorMessage ? (
          <div className='my-4 flex items-center gap-3 rounded-lg border border-red-600 bg-red-700/50 p-4 text-sm text-red-100'>
            <FontAwesomeIcon icon={faCircleXmark} />
            <div>{errorMessage}</div>
          </div>
        ) : (
          <SearchResults
            results={results}
            isLoading={isLoading}
            query={searchQuery}
          />
        )}
      </div>
    </div>
  );
};
