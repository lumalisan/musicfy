import { memo, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils/cn';
import { API_BASE_URL } from '@/lib/constants';

interface Props {
  itemId: string;
  itemType: 'playlist' | 'album';
  size?: 'large' | 'base';
}

const PlayButton = ({ itemId, itemType, size = 'base' }: Props) => {
  const { isPlaying, currentMusic, setIsPlaying, loadAndPlayMusic } =
    usePlayerStore((state) => state);

  const [isIconShowingPause, setIsIconShowingPause] = useState(
    isPlaying &&
      currentMusic.itemInfo?.id === itemId &&
      currentMusic.itemInfo?.type === itemType
  );

  useEffect(() => {
    setIsIconShowingPause(
      isPlaying &&
        currentMusic.itemInfo?.id === itemId &&
        currentMusic.itemInfo?.type === itemType
    );
  }, [isPlaying, currentMusic, itemId, itemType]);

  const handleClick = async () => {
    if (isIconShowingPause) {
      setIsPlaying(false);
    } else if (
      currentMusic.itemInfo?.id === itemId &&
      currentMusic.itemInfo?.type === itemType
    ) {
      setIsPlaying(true);
    } else {
      try {
        const response = await fetch(
          `${API_BASE_URL}/item-details/${itemId}.json?type=${itemType}`
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch ${itemType} info for ID ${itemId}: ${response.status} ${response.statusText}`
          );
          const errorBody = await response.text();
          console.error('Error body:', errorBody);
          throw new Error(
            `Failed to fetch ${itemType} info: ${response.statusText}`
          );
        }

        const {
          songs,
          itemDetails: { artists, color, coverArtUrl, id, name, type },
        } = await response.json();

        if (songs && songs.length > 0) {
          const currentItemInfo = {
            id,
            type,
            artists,
            color,
            coverArtUrl,
            name,
          };

          loadAndPlayMusic({
            songsQueue: songs,
            itemInfo: currentItemInfo,
            songIndex: 0,
          });
        } else {
          console.warn(`No songs found in ${itemType} with id:`, itemId);
        }
      } catch (error) {
        console.error(
          `Error fetching and playing ${itemType} with id ${itemId}:`,
          error
        );
      }
    }
  };

  return (
    <button
      aria-label={
        isIconShowingPause
          ? `Pause ${itemType} ${itemId}`
          : `Play ${itemType} ${itemId}`
      }
      className={cn(
        size === 'large' ? 'h-14 w-14 text-2xl' : 'h-10 w-10 text-base',
        'bg-accent/80 flex cursor-pointer items-center justify-center rounded-full text-black',
        'hover:bg-accent focus:ring-accent/50 transition duration-300 hover:scale-105 focus:ring-2 focus:outline-none'
      )}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={isIconShowingPause ? faPause : faPlay} />
    </button>
  );
};

export default memo(PlayButton);
