import React, { useState, useEffect, useCallback } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import playlistRepository from '@/lib/repositories/PlaylistRepository';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeaderCloseButton,
  DialogTitle,
} from '../ui/Dialog';

interface DeletePlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  playlistId: string;
  playlistName?: string;
  onActionComplete: () => void;
}

export const DeletePlaylistModal: React.FC<DeletePlaylistModalProps> = ({
  isOpen,
  onOpenChange,
  playlistId,
  playlistName = 'this playlist',
  onActionComplete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeleteError(null);
    }
  }, [isOpen]);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const success = await playlistRepository.deletePlaylist(playlistId);
      if (success) {
        onOpenChange(false);
        onActionComplete();
      } else {
        setDeleteError(
          'Failed to delete playlist. The server denied the request or an error occurred.'
        );
      }
    } catch (error: any) {
      console.error('Error deleting playlist:', error);
      setDeleteError('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  }, [playlistId, onOpenChange, onActionComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeaderCloseButton onClick={() => onOpenChange(false)} />
        <DialogTitle>Delete playlist</DialogTitle>
        <DialogDescription className='text-accent-foreground text-muted-foreground mb-6'>
          Are you sure you want to delete the playlist "
          <strong>{playlistName}</strong>"? This action cannot be undone.
        </DialogDescription>

        {deleteError && (
          <p className='mb-3 rounded-md border border-red-700/50 bg-red-900/20 px-2 py-1 text-sm text-red-400'>
            {deleteError}
          </p>
        )}

        <div className='flex justify-end gap-3 pt-2'>
          <DialogClose asChild>
            <button
              type='button'
              onClick={() => onOpenChange(false)}
              className='bg-primary hover:bg-primary/80 cursor-pointer rounded-full px-5 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className='flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-5 py-2 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50'
          >
            {isDeleting && (
              <FontAwesomeIcon
                icon={faSpinner}
                className='h-4 w-4 animate-spin'
              />
            )}
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
