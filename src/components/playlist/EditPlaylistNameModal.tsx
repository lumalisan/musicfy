import React, { useState, useEffect, useCallback } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { API_BASE_URL } from '@/lib/constants';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeaderCloseButton,
  DialogTitle,
} from '../ui/Dialog';

interface EditPlaylistNameModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  playlistId: string;
  currentName?: string;
  coverArtUrl?: string;
  color?: string;
  onActionComplete: () => void;
}

export const EditPlaylistNameModal: React.FC<EditPlaylistNameModalProps> = ({
  isOpen,
  onOpenChange,
  playlistId,
  currentName = '',
  coverArtUrl,
  color,
  onActionComplete,
}) => {
  const [editingPlaylistName, setEditingPlaylistName] = useState(currentName);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditingPlaylistName(currentName);
      setEditError(null);
    }
  }, [isOpen, currentName]);

  const handleSubmitEditName = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPlaylistName || editingPlaylistName.trim() === '') {
      setEditError('Playlist name cannot be empty.');
      return;
    }

    if (editingPlaylistName.trim() === currentName && !editError) {
      onOpenChange(false);
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/user-playlists.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId,
          name: editingPlaylistName.trim(),
          coverArtUrl,
          color,
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        onActionComplete();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Error updating playlist name.' }));
        setEditError(errorData.message || 'Failed to update playlist name.');
      }
    } catch (error) {
      console.error('Error updating playlist name:', error);
      setEditError('An unexpected error occurred.');
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [playlistId, editingPlaylistName, currentName, coverArtUrl, color, onOpenChange, onActionComplete, editError]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeaderCloseButton onClick={() => onOpenChange(false)} />
        <DialogTitle>Edit playlist name</DialogTitle>
        <DialogDescription className='sr-only'>
          Form to edit playlist name.
        </DialogDescription>

        <form onSubmit={handleSubmitEditName}>
          <div className='mb-4'>
            <label
              htmlFor={`playlistNameInput-${playlistId}`}
              className='text-secondary mb-1 block text-sm font-medium'
            >
              Playlist name
            </label>
            <input
              id={`playlistNameInput-${playlistId}`}
              type='text'
              value={editingPlaylistName}
              onChange={(e) => setEditingPlaylistName(e.target.value)}
              className='bg-primary focus:ring-accent w-full rounded-md p-3 placeholder-gray-400 outline-none focus:ring-2'
              autoFocus
            />
          </div>

          {editError && (
            <p className='mb-3 rounded-md border border-red-700/50 bg-red-900/20 px-2 py-1 text-sm text-red-400'>
              {editError}
            </p>
          )}

          <div className='flex justify-end gap-3 pt-2'>
            <DialogClose asChild>
              <button
                type='button'
                onClick={() => onOpenChange(false)}
                className='cursor-pointer bg-primary hover:bg-primary/80 rounded-full px-5 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                >
                Cancel
              </button>
            </DialogClose>
            <button
              type='submit'
              disabled={
                isSubmittingEdit ||
                !editingPlaylistName.trim() ||
                (editingPlaylistName.trim() === currentName && !editError)
              }
              className='cursor-pointer bg-accent hover:bg-accent/80 flex items-center justify-center gap-2 rounded-full px-5 py-2 font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-50'
              >
              {isSubmittingEdit && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className='h-4 w-4 animate-spin'
                />
              )}
              Save
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};