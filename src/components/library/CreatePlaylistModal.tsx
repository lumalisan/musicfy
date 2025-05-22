import { useState, useCallback, type ChangeEvent } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faSpinner,
  faMusic,
} from '@fortawesome/free-solid-svg-icons';

import type { Song } from '@/lib/types/Song';
import type { SongResult } from '@/lib/types/SearchResultItem';
import songRepository from '@/lib/repositories/SongRepository';
import playlistRepository from '@/lib/repositories/PlaylistRepository';
import { debounce } from '@/lib/utils/debounce';
import { cn } from '@/lib/utils/cn';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeaderCloseButton,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { LoadingSearch } from '../shared/LoadingSearch';

export const CreatePlaylistModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [searchedSongs, setSearchedSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [isSearchingSongs, setIsSearchingSongs] = useState(false);
  const [songSearchError, setSongSearchError] = useState<string | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [createPlaylistError, setCreatePlaylistError] = useState<string | null>(
    null
  );

  const resetModalStateAndClose = () => {
    setNewPlaylistName('');
    setSongSearchQuery('');
    setSearchedSongs([]);
    setSelectedSongId(null);
    setSongSearchError(null);
    setCreatePlaylistError(null);
    setShowModal(false);
  };

  const handleSearchSongs = useCallback(async (query: string) => {
    if (query.trim() === '') {
      setSearchedSongs([]);
      setSongSearchError(null);
      return;
    }
    setIsSearchingSongs(true);
    setSongSearchError(null);

    const mapSongResultToSong = (songResult: SongResult): Song => ({
      id: songResult.id,
      title: songResult.title,
      image: songResult.image,
      artists: songResult.artists,
      album: songResult.album,
      duration: songResult.duration,
      url: songResult.url,
    });

    try {
      const results: SongResult[] = await songRepository.search(query);
      setSearchedSongs(results.map(mapSongResultToSong));
    } catch (err: any) {
      console.error(err);
      setSongSearchError(
        err.message || 'An unexpected error occurred while fetching songs.'
      );
      setSearchedSongs([]);
    } finally {
      setIsSearchingSongs(false);
    }
  }, []);

  const debouncedSearchSongs = useCallback(debounce(handleSearchSongs, 500), [
    handleSearchSongs,
  ]);

  const handleSongSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSongSearchQuery(query);
    debouncedSearchSongs(query);
  };

  const handleSelectSong = (songId: string) => {
    setSelectedSongId(songId);
  };

  const handleAddNewPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setCreatePlaylistError('Please enter a playlist name.');
      return;
    } else if (!selectedSongId) {
      setCreatePlaylistError('Please select a song.');
      return;
    }

    setIsCreatingPlaylist(true);
    setCreatePlaylistError(null);

    try {
      await playlistRepository.createPlaylist(
        newPlaylistName.trim(),
        selectedSongId!
      );

      resetModalStateAndClose();

      // @ts-ignore navigate is injected globally by Astro View Transitions
      if (typeof navigate === 'function') {
        // @ts-ignore
        navigate(window.location.pathname, { history: 'replace' });
      } else {
        console.warn(
          'Astro "navigate" function not found, falling back to full page reload.'
        );
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      setCreatePlaylistError('Could not create playlist.');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          resetModalStateAndClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          className='flex items-center p-2'
          title='Create playlist'
          aria-label='Create playlist'
          type='button'
        >
          <FontAwesomeIcon icon={faPlus} size='xl' />
        </button>
      </DialogTrigger>

      <DialogContent className='bg-secondary fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg p-6 shadow-xl focus:outline-none'>
        <DialogHeaderCloseButton />

        <DialogTitle className='mb-6 text-center text-2xl font-semibold'>
          Create new playlist
        </DialogTitle>

        <DialogDescription className='sr-only'>
          Create a new playlist and add your first song.
        </DialogDescription>

        {createPlaylistError && (
          <p className='mb-4 rounded-md border border-red-600 bg-red-700/50 p-2 text-center text-sm text-red-100'>
            {createPlaylistError}
          </p>
        )}

        {/* Form content */}
        <div className='space-y-4'>
          <input
            type='text'
            placeholder='Playlist name'
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className='bg-primary focus:ring-accent w-full rounded-md p-3 placeholder-gray-400 outline-none focus:ring-2'
          />

          <div>
            <h3 className='mb-2 text-lg font-medium'>Add first song</h3>
            <div className='relative mb-1'>
              <input
                type='text'
                placeholder='Search for a song...'
                value={songSearchQuery}
                onChange={handleSongSearchInputChange}
                className='bg-primary focus:ring-accent w-full rounded-md p-3 pl-10 placeholder-gray-400 outline-none focus:ring-2'
              />
              <FontAwesomeIcon
                icon={faSearch}
                className='absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400'
              />
            </div>

            {isSearchingSongs && <LoadingSearch />}
            {songSearchError && (
              <p className='rounded-md border border-red-600 bg-red-700/50 p-2 text-center text-sm text-red-100'>
                Error: {songSearchError}
              </p>
            )}

            {!isSearchingSongs && searchedSongs.length > 0 && (
              <div className='bg-primary mt-2 max-h-[calc(90vh-20rem)] overflow-y-auto rounded-md p-2'>
                {searchedSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(song.id)}
                    className={cn(
                      'hover:bg-accent/10 flex cursor-pointer items-center gap-3 rounded-md p-2.5 transition-colors',
                      selectedSongId === song.id &&
                        'bg-accent/10 ring-accent ring-2'
                    )}
                  >
                    {song.image ? (
                      <img
                        src={song.image}
                        alt={song.title}
                        className='h-10 w-10 rounded object-cover'
                      />
                    ) : (
                      <div className='bg-secondary flex h-10 w-10 items-center justify-center rounded-md'>
                        <FontAwesomeIcon icon={faMusic} />
                      </div>
                    )}
                    <div>
                      <p className='truncate text-sm font-medium'>
                        {song.title}
                      </p>
                      <p className='truncate text-xs'>
                        {song.artists?.join(', ') || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isSearchingSongs &&
              songSearchQuery &&
              searchedSongs.length === 0 &&
              !songSearchError && (
                <p className='py-3 text-center text-sm'>
                  No songs found for "{songSearchQuery}".
                </p>
              )}
          </div>
        </div>

        {/* Action buttons */}
        <div className='mt-6 flex justify-end gap-3'>
          <DialogClose asChild>
            <button
              onClick={resetModalStateAndClose}
              disabled={isCreatingPlaylist}
              className='bg-primary hover:bg-primary/80 cursor-pointer rounded-full px-5 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleAddNewPlaylist}
            disabled={
              isCreatingPlaylist || !newPlaylistName.trim() || !selectedSongId
            }
            className='bg-accent hover:bg-accent/80 flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2 font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isCreatingPlaylist && (
              <FontAwesomeIcon icon={faSpinner} className='animate-spin' />
            )}
            {isCreatingPlaylist ? 'Creating...' : 'Create'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
