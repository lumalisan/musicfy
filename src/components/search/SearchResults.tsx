import { useCallback } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMusic,
  faCompactDisc,
  faList,
} from '@fortawesome/free-solid-svg-icons';

import { formatDuration } from '@/lib/utils/formatDuration';
import { cn } from '@/lib/utils/cn';
import { usePlayerStore } from '@/store/playerStore';
import type { SearchResult as SearchResultType } from '@/lib/types/SearchResultItem';
import type { Song } from '@/lib/types/Song';

import { LoadingSearch } from '../shared/LoadingSearch';

interface SearchResultsProps {
  results: SearchResultType;
  isLoading: boolean;
  query: string;
}

export const SearchResults = ({
  results,
  isLoading,
  query,
}: SearchResultsProps) => {
  const { currentMusic, isPlaying, setIsPlaying, loadAndPlayMusic } =
    usePlayerStore();

  const handlePlaySong = useCallback(
    (song: SearchResultType['songs'][number], e: React.MouseEvent) => {
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
          artists: [song.artist],
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
            artists: [song.artist],
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
      <div className='mt-12 text-center text-accent/70'>
        <p className='text-lg'>
          Start typing to search for songs, albums, and playlists
        </p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className='mt-12 text-center'>
        <p className='text-lg text-accent/70'>No results found for "{query}"</p>
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
              onClick={(e) => handlePlaySong(item, e)}
              className='group hover:bg-accent/10 border-accent/50 flex w-full cursor-pointer items-center gap-4 rounded-md border p-2 text-left transition-colors'
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
                <p className='truncate text-sm text-accent/70'>
                  {item.artist} • {item.album}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='text-sm text-accent/70'>
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
            <a
              href={item.url}
              className='group hover:bg-accent/10 border-accent/50 flex flex-col gap-2 rounded-md border p-3 transition-colors'
            >
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
                <p className='truncate text-sm text-accent/70'>{item.artist}</p>
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
            <a
              href={item.url}
              className='group hover:bg-accent/10 border-accent/50 flex flex-col gap-2 rounded-md border p-3 transition-colors'
            >
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
              <div>
                <h3 className='group-hover:text-accent truncate font-medium'>
                  {item.title}
                </h3>
                <p className='truncate text-sm text-accent/70'>
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

interface SearchResultSectionProps<T> {
  title: string;
  icon: any;
  items: T[];
  isSong?: boolean;
  renderItem: (item: T) => React.ReactNode;
}

const SearchResultSection = <T,>({
  title,
  icon,
  items,
  isSong,
  renderItem,
}: SearchResultSectionProps<T>) => {
  if (items.length === 0) return null;

  return (
    <section>
      <div className='mb-4 flex items-center gap-2'>
        <FontAwesomeIcon icon={icon} className='text-accent' />
        <h2 className='text-xl font-bold'>{title}</h2>
        <span className='bg-accent/20 text-accent ml-2 rounded-full px-2 py-0.5 text-xs'>
          {items.length}
        </span>
      </div>

      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
          isSong
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : ''
        )}
      >
        {items.map((item, index) => (
          <div key={index} className='w-full'>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
};
