import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { ItemInfo } from '@/lib/types/ItemInfo';
import type { Song } from '@/lib/types/Song';
import { cn } from '@/lib/utils/cn';
import { formatSongDuration } from '@/lib/utils/formatSongDuration';
import { usePlayerStore } from '@/store/playerStore';

type Props = {
  itemInfo: ItemInfo;
  songsInView: Song[];
  song: Song;
  index: number;
};

const SongInfo = ({ itemInfo, songsInView, song, index }: Props) => {
  const { currentMusic, loadAndPlayMusic, isPlaying, setIsPlaying } =
    usePlayerStore((state) => state);

  const isThisSongCurrentlyActive =
    currentMusic.song?.id === song.id &&
    currentMusic.itemInfo?.id === itemInfo.id &&
    currentMusic.itemInfo?.type === itemInfo.type;

  const isThisSongPlaying = isPlaying && isThisSongCurrentlyActive;

  const handleClick = () => {
    if (isThisSongCurrentlyActive) {
      setIsPlaying(!isPlaying);
      return;
    }

    loadAndPlayMusic({
      songsQueue: songsInView,
      itemInfo: itemInfo,
      songIndex: index,
    });
  };

  return (
    <tr
      className={cn(
        'group text-sm font-light transition duration-300',
        isThisSongCurrentlyActive
          ? 'text-accent bg-white/20'
          : 'text-gray-300 hover:bg-white/10 hover:text-gray-50',
        'cursor-pointer'
      )}
      onClick={handleClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      aria-label={`Play ${song.title} by ${song.artists.join(', ')}`}
    >
      <td className='hidden w-5 rounded-tl-lg rounded-bl-lg px-4 py-2 md:table-cell'>
        <span className='hidden group-hover:block'>
          <FontAwesomeIcon icon={isThisSongPlaying ? faPause : faPlay} />
        </span>
        <span className='group-hover:hidden'>{index + 1}</span>
      </td>
      <td className='flex w-full min-w-0 items-center gap-3 px-4 py-2'>
        <picture className='aspect-square h-11 w-11 flex-shrink-0 overflow-hidden rounded'>
          <img
            src={song.image || '/images/default-song-placeholder.png'}
            alt={song.title}
            className='h-full w-full object-cover'
            loading='lazy'
          />
        </picture>
        <div className='flex flex-col overflow-hidden'>
          <h3
            className={cn(
              'overflow-hidden text-base font-normal text-ellipsis whitespace-nowrap',
              isThisSongCurrentlyActive
                ? 'text-accent'
                : 'text-white group-hover:text-gray-50'
            )}
          >
            {song.title}
          </h3>
          <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
            {song.artists.join(', ')}
          </span>
        </div>
      </td>
      <td className='overflow-hidden px-4 py-2 text-ellipsis whitespace-nowrap'>
        {song.album}
      </td>
      <td className='hidden rounded-tr-lg rounded-br-lg px-4 py-2 md:table-cell'>
        {formatSongDuration(song.duration)}
      </td>
    </tr>
  );
};

export default SongInfo;
