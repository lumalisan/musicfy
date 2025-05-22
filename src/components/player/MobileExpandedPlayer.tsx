import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

import type { CurrentMusic } from '@/lib/types/CurrentMusic';
import { cn } from '@/lib/utils/cn';

import { PlaybackControls } from './PlaybackControls';
import AudioController from './AudioController';

export interface MobileExpandedPlayerProps {
  currentMusic: CurrentMusic;
  isPlaying: boolean;
  isRandom: boolean;
  isRepeat: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
  animationClassName?: string;
}

const MobileExpandedPlayer = ({
  currentMusic,
  isPlaying,
  isRandom,
  isRepeat,
  audioRef,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  onClose,
  animationClassName,
}: MobileExpandedPlayerProps) => {
  if (!currentMusic.song || !currentMusic.itemInfo) {
    return null;
  }

  const { song, itemInfo } = currentMusic;

  return (
    <div
      style={itemInfo.color ? { backgroundColor: itemInfo.color } : undefined}
      className={cn(
        'bg-secondary fixed inset-0 z-50 flex flex-col p-4 pt-6 antialiased',
        animationClassName
      )}
    >
      {/* Header with minimize and more options */}
      <div className='mb-6 flex items-center justify-between'>
        <button
          onClick={onClose}
          className='p-2 transition-colors'
          aria-label='Minimize player'
        >
          <FontAwesomeIcon icon={faChevronDown} size='xl' />
        </button>
        <div className='text-xs font-semibold tracking-wider uppercase'>
          {song.album || 'Now Playing'}
        </div>
        <button className='p-2 transition-colors' aria-label='More options'>
          <FontAwesomeIcon icon={faEllipsisH} size='xl' />
        </button>
      </div>

      {/* Album cover */}
      <div className='mb-6 flex flex-grow items-center justify-center px-2'>
        <img
          src={song.image || '/placeholder-album-art.png'}
          alt={`Cover for ${song.title}`}
          className='aspect-square w-full max-w-md rounded-lg object-cover shadow-2xl'
        />
      </div>

      {/* Song info */}
      <div className='mb-5 px-2 text-left'>
        <h2 className='truncate text-2xl font-bold sm:text-3xl'>
          {song.title || 'Unknown Title'}
        </h2>
        <p className='text-accent/80 truncate text-base sm:text-lg'>
          {song.artists?.join(', ') || 'Unknown Artist'}
        </p>
      </div>

      {/* Audio progress bar */}
      <div className='mb-5 px-2'>
        <AudioController audioRef={audioRef} />
      </div>

      {/* Playback controls */}
      <div className='mb-10 px-2'>
        <PlaybackControls
          isPlaying={isPlaying}
          isRandom={isRandom}
          isRepeat={isRepeat}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          onToggleShuffle={onToggleShuffle}
          onToggleRepeat={onToggleRepeat}
          largeIcons={true}
        />
      </div>

      {/* Background gradient */}
      <div className='from-secondary via-secondary/90 absolute inset-0 -z-[1] bg-gradient-to-t to-transparent'></div>
    </div>
  );
};

export default MobileExpandedPlayer;
