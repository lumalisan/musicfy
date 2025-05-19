import React, { useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSpinner,
  faMusic,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils/cn';
import type { Song } from '@/lib/types/Song';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogHeaderCloseButton,
  DialogDescription,
} from '../ui/Dialog';
import { LoadingSearch } from '../shared/LoadingSearch';
import {
  useAddSongsToPlaylist,
  type AddSongsStatusReport,
} from './hooks/useAddSongsToPlaylist';
import { useSongSelection } from './hooks/useSongSelection';
import { useSongSearch } from './hooks/useSongSearch';

interface AddSongsToPlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  playlistId: string;
  currentPlaylistName: string;
  onSongsAdded: () => void;
}

export const AddSongsToPlaylistModal: React.FC<
  AddSongsToPlaylistModalProps
> = ({
  isOpen,
  onOpenChange,
  playlistId,
  currentPlaylistName,
  onSongsAdded,
}) => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    handleSearchInputChange,
    resetSearchState,
  } = useSongSearch();

  const { selectedSongs, toggleSongSelection, resetSelectedSongs } =
    useSongSelection();

  const handleBatchComplete = useCallback(
    (report: AddSongsStatusReport) => {
      if (report.successCount > 0) {
        onSongsAdded();
        resetSelectedSongs();
      }
      if (
        report.successCount > 0 &&
        report.errorCount === 0 &&
        report.individualResults.length > 0
      ) {
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    },
    [onSongsAdded, onOpenChange, resetSelectedSongs]
  );

  const { isAdding, addSongsStatus, executeAddSongs, resetAddSongsStatus } =
    useAddSongsToPlaylist({
      playlistId,
      onBatchComplete: handleBatchComplete,
    });

  useEffect(() => {
    if (isOpen) {
      resetSearchState();
      resetSelectedSongs();
      resetAddSongsStatus();
    }
  }, [isOpen, resetSearchState, resetSelectedSongs, resetAddSongsStatus]);

  const handleSubmitSelectedSongs = () => {
    const songDetailsMap = new Map<string, Pick<Song, 'id' | 'title'>>();
    searchResults.forEach((song) => {
      if (selectedSongs.has(song.id)) {
        songDetailsMap.set(song.id, { id: song.id, title: song.title });
      }
    });
    executeAddSongs(selectedSongs, songDetailsMap);
  };

  let addButtonText = 'Add songs';
  if (selectedSongs.size > 0) {
    addButtonText = `Add ${selectedSongs.size} song${selectedSongs.size !== 1 ? 's' : ''}`;
  }

  const showSearchAndResults = !(
    addSongsStatus &&
    addSongsStatus.successCount > 0 &&
    addSongsStatus.errorCount === 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeaderCloseButton />
        <DialogTitle>Add Songs to "{currentPlaylistName}"</DialogTitle>
        <DialogDescription className='sr-only'>
          Form to add songs to a playlist.
        </DialogDescription>

        {addSongsStatus && (
          <div
            className={cn(
              'mb-4 rounded-md p-3 text-sm',
              addSongsStatus.errorCount > 0
                ? 'border border-red-700 bg-red-900/30 text-red-200'
                : 'border border-green-700 bg-green-900/30 text-green-200'
            )}
          >
            <p className='mb-1 font-semibold'>
              {addSongsStatus.successCount > 0 &&
              addSongsStatus.errorCount === 0
                ? 'All songs added successfully!'
                : 'Addition Process Completed:'}
            </p>
            {addSongsStatus.successCount > 0 && (
              <p className='text-green-300'>
                {addSongsStatus.successCount} song(s) added.
              </p>
            )}
            {addSongsStatus.errorCount > 0 && (
              <p className='mt-1 text-red-300'>
                {addSongsStatus.errorCount} song(s) could not be added:
              </p>
            )}
            {addSongsStatus.errors.length > 0 && (
              <ul className='mt-1 max-h-24 list-inside list-disc overflow-y-auto pl-2 text-red-400'>
                {addSongsStatus.errors.map((err, idx) => (
                  <li key={`${err.songId}-${idx}`}>
                    <strong>{err.songTitle}</strong>: {err.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {showSearchAndResults && (
          <>
            <div className='relative mb-1'>
              <input
                type='text'
                placeholder='Search songs to add...'
                value={searchQuery}
                onChange={handleSearchInputChange}
                className='bg-primary focus:ring-accent w-full rounded-md p-3 pl-10 placeholder-gray-400 outline-none focus:ring-2'
                disabled={isAdding}
                autoFocus
              />
              <FontAwesomeIcon
                icon={faSearch}
                className='absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400'
              />
            </div>

            {searchError && (
              <p className='rounded-md border border-red-600 bg-red-700/50 p-2 text-center text-sm text-red-100'>
                Error: {searchError}
              </p>
            )}

            <div className='bg-primary mt-2 max-h-[calc(90vh-20rem)] overflow-y-auto rounded-md p-2'>
              {isSearching && <LoadingSearch />}
              {searchResults.length > 0 &&
                searchResults.map((song) => {
                  const isSelected = selectedSongs.has(song.id);
                  return (
                    <div
                      key={song.id}
                      onClick={() => toggleSongSelection(song.id)}
                      className={cn(
                        'mb-1 flex cursor-pointer items-center justify-between gap-3 rounded-md p-2.5 transition-all duration-150 ease-in-out',
                        isSelected
                          ? 'bg-accent/20 text-accent-text-emphasis ring-accent ring-1'
                          : 'hover:bg-accent/10',
                        isAdding ||
                          (addSongsStatus &&
                            addSongsStatus.individualResults.find(
                              (r) => r.songId === song.id
                            )?.success)
                          ? 'cursor-not-allowed opacity-60'
                          : 'hover:bg-accent/10'
                      )}
                    >
                      <div className='flex items-center gap-3 overflow-hidden'>
                        {song.image ? (
                          <img
                            src={song.image}
                            alt={song.title}
                            className='h-10 w-10 flex-shrink-0 rounded object-cover'
                          />
                        ) : (
                          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded'>
                            <FontAwesomeIcon
                              icon={faMusic}
                              className='text-gray-400'
                            />
                          </div>
                        )}
                        <div className='flex-grow overflow-hidden'>
                          <p className='text-primary-text truncate text-sm font-medium'>
                            {song.title}
                          </p>
                          <p className='truncate text-xs'>
                            {song.artists?.join(', ')}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className='text-accent flex-shrink-0'
                        />
                      )}
                    </div>
                  );
                })}
              {!isSearching &&
                searchQuery &&
                searchResults.length === 0 &&
                !searchError && (
                  <p className='py-4 text-center text-sm'>
                    No songs found for "{searchQuery}".
                  </p>
                )}
              {!searchQuery &&
                searchResults.length === 0 &&
                !isSearching &&
                !searchError && (
                  <p className='py-4 text-center text-sm'>
                    Search for songs to add to your playlist.
                  </p>
                )}
            </div>
          </>
        )}

        <div className='mt-auto flex justify-end gap-3 pt-4'>
          <DialogClose asChild>
            <button
              type='button'
              disabled={isAdding}
              className='bg-primary hover:bg-primary/80 cursor-pointer rounded-full px-5 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              {showSearchAndResults ? 'Cancel' : 'Close'}
            </button>
          </DialogClose>
          {showSearchAndResults && (
            <button
              type='button'
              onClick={handleSubmitSelectedSongs}
              disabled={isAdding || selectedSongs.size === 0}
              className='bg-accent hover:bg-accent/80 flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2 font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isAdding ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className='animate-spin' />
                  Adding...
                </>
              ) : (
                addButtonText
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
