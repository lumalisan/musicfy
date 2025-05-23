import {
  faEllipsisV,
  faEdit,
  faTrash,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useCallback } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

import { AddSongsToPlaylistModal } from './AddSongsToPlaylistModal';
import { DeletePlaylistModal } from './DeletePlaylistModal';
import { EditPlaylistNameModal } from './EditPlaylistNameModal';

type PlaylistOptionsMenuProps = {
  playlistId: string;
  itemType: string;
  currentName?: string;
  coverArtUrl: string;
  color?: string;
  isOwner: boolean;
  onActionComplete?: () => void;
};

const PlaylistOptionsMenu: React.FC<PlaylistOptionsMenuProps> = ({
  playlistId,
  currentName,
  coverArtUrl,
  color,
  itemType,
  isOwner,
  onActionComplete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addSongsModalOpen, setAddSongsModalOpen] = useState(false);

  const handleEditSuccess = useCallback(() => {
    if (onActionComplete) {
      onActionComplete();
    } else {
      window.location.reload();
    }
  }, [onActionComplete]);

  const handleDeleteSuccess = useCallback(() => {
    if (onActionComplete) {
      onActionComplete();
    } else {
      window.location.href = '/library';
    }
  }, [onActionComplete]);

  const handleSongsAddedSuccess = useCallback(() => {
    if (onActionComplete) {
      onActionComplete();
    } else {
      window.location.reload();
    }
  }, [onActionComplete]);

  if (!isOwner || itemType !== 'playlist') {
    return null;
  }

  const openEditModal = () => {
    setEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleOpenAddSongsModal = () => {
    setAddSongsModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger aria-label='Playlist options'>
          <FontAwesomeIcon icon={faEllipsisV} size='lg' />
        </DropdownMenuTrigger>

        <DropdownMenuContent side='bottom' align='end'>
          <DropdownMenuItem onSelect={openEditModal}>
            <FontAwesomeIcon icon={faEdit} className='mr-2' />
            Edit name
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleOpenAddSongsModal}>
            <FontAwesomeIcon icon={faPlusCircle} className='mr-2' />
            Add songs
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={openDeleteModal}
            className='text-red-400 hover:bg-red-800/30 hover:text-red-300 focus:bg-red-800/30 focus:text-red-300'
          >
            <FontAwesomeIcon icon={faTrash} className='mr-2' />
            Delete playlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <EditPlaylistNameModal
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        playlistId={playlistId}
        currentName={currentName}
        coverArtUrl={coverArtUrl}
        color={color}
        onActionComplete={handleEditSuccess}
      />

      <DeletePlaylistModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        playlistId={playlistId}
        playlistName={currentName}
        onActionComplete={handleDeleteSuccess}
      />

      <AddSongsToPlaylistModal
        isOpen={addSongsModalOpen}
        onOpenChange={setAddSongsModalOpen}
        playlistId={playlistId}
        onSongsAdded={handleSongsAddedSuccess}
        currentPlaylistName={currentName || 'Playlist'}
      />
    </>
  );
};

export default PlaylistOptionsMenu;
