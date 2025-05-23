import {
  faMusic,
  faCompactDisc,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback } from 'react';

import type {
  SearchResult as SearchResultType,
  SongResult,
} from '@/lib/types/SearchResultItem';
import type { Song } from '@/lib/types/Song';
import { formatDuration } from '@/lib/utils/formatDuration';
import { usePlayerStore } from '@/store/playerStore';

import { LoadingSearch } from '../shared/LoadingSearch';

import { SearchResultSection } from './SearchResultSection';

type SearchResultsProps = {
  results: SearchResultType;
  isLoading: boolean;
  query: string;
};

export const SearchResults = ({
  results,
  isLoading,
  query,
}: SearchResultsProps) => {
  const { currentMusic, isPlaying, setIsPlaying, loadAndPlayMusic } =
    usePlayerStore();

  const handlePlaySong = useCallback(
    (
      song: SearchResultType['songs'][number],
      e: React.MouseEvent | React.KeyboardEvent
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const currentSong = currentMusic.song;

      // If the song is playing, toggle play/pause
      if (currentSong?.id === song.id) {
        setIsPlaying(!isPlaying);
      } else {
        // Create a song object compatible with the player
        const playerSong: Song = {
          id: song.id,
          title: song.title,
          artists: song.artists,
          album: song.album || null,
          duration: song.duration,
          image: song.image,
          url: song.url,
        };

        // Play the selected song
        loadAndPlayMusic({
          songsQueue: [playerSong],
          itemInfo: {
            id: song.id,
            type: 'album',
            name: song.title,
            coverArtUrl: song.image,
            artists: song.artists,
            color: song.color,
          },
          songIndex: 0,
        });
      }
    },
    [currentMusic.song, isPlaying, loadAndPlayMusic, setIsPlaying]
  );

  const hasResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0;

  if (isLoading) {
    return (
      <div className='mt-12 flex justify-center'>
        <LoadingSearch />
      </div>
    );
  }

  if (!query) {
    return (
      <div className='text-accent/70 mt-12 text-center'>
        <p className='text-lg'>
          Start typing to search for songs, albums, and playlists
        </p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className='mt-12 text-center'>
        <p className='text-accent/70 text-lg'>No results found for "{query}"</p>
        <p className='mt-2 text-sm text-gray-500'>
          Try different keywords or check for typos
        </p>
      </div>
    );
  }

  return (
    <div className='mt-6 space-y-8'>
      {results.songs.length > 0 && (
        <SearchResultSection
          title='Songs'
          icon={faMusic}
          items={results.songs}
          isSong
          renderItem={(item) => (
            <div
              onClick={(e) => handlePlaySong(item as SongResult, e)}
              onKeyDown={(e) => handlePlaySong(item as SongResult, e)}
              role='button'
              tabIndex={0}
              className='flex w-full items-center gap-4 text-left transition-colors'
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className='h-12 w-12 rounded-md object-cover'
                />
              ) : (
                <div className='bg-secondary flex h-12 w-12 items-center justify-center rounded-md'>
                  <FontAwesomeIcon icon={faMusic} />
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <h3 className='truncate font-medium'>{item.title}</h3>
                <p className='text-accent/70 truncate text-sm'>
                  {item.artists[0]} • {item.album}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='text-accent/70 text-sm'>
                  {formatDuration(item.duration as number)}
                </div>
              </div>
            </div>
          )}
        />
      )}

      {results.albums.length > 0 && (
        <SearchResultSection
          title='Albums'
          icon={faCompactDisc}
          items={results.albums}
          renderItem={(item) => (
            <a href={item.url}>
              <div className='relative aspect-square w-full overflow-hidden rounded-md'>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  />
                ) : (
                  <div className='bg-secondary flex h-full w-full items-center justify-center'>
                    <FontAwesomeIcon
                      icon={faCompactDisc}
                      size='2x'
                      className='text-accent/70'
                    />
                  </div>
                )}
              </div>
              <div className='mt-2'>
                <h3 className='group-hover:text-accent truncate font-medium'>
                  {item.title}
                </h3>
                <p className='text-accent/70 truncate text-xs'>
                  {item.artists[0]}
                </p>
              </div>
            </a>
          )}
        />
      )}

      {results.playlists.length > 0 && (
        <SearchResultSection
          title='Playlists'
          icon={faList}
          items={results.playlists}
          renderItem={(item) => (
            <a href={item.url}>
              <div className='relative aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-purple-500 to-blue-500'>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  />
                ) : (
                  <div className='flex h-full flex-col items-center justify-center p-4 text-center'>
                    <FontAwesomeIcon
                      icon={faList}
                      size='2x'
                      className='mb-2 text-white/80'
                    />
                    <span className='text-sm font-medium text-white/80'>
                      {item.title}
                    </span>
                  </div>
                )}
              </div>
              <div className='mt-2'>
                <h3 className='group-hover:text-accent truncate font-medium'>
                  {item.title}
                </h3>
                <p className='text-accent/70 truncate text-xs'>
                  {item.description || 'Playlist'}
                </p>
              </div>
            </a>
          )}
        />
      )}
    </div>
  );
};
