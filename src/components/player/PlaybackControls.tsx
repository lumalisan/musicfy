import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBackwardStep,
  faForwardStep,
  faRepeat,
  faShuffle,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';

import { cn } from '@/lib/utils/cn';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  isRandom: boolean;
  isRepeat: boolean;
  largeIcons?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export const PlaybackControls = ({
  isPlaying,
  isRandom,
  isRepeat,
  largeIcons,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
}: PlaybackControlsProps) => {
  return (
    <div className='flex items-center justify-between gap-4 md:justify-center'>
      <button
        title={isRandom ? 'Disable Shuffle' : 'Enable Shuffle'}
        aria-label={isRandom ? 'Disable Shuffle' : 'Enable Shuffle'}
        className={cn(
          'text-accent/40 hover:text-accent p-2 text-xl transition duration-300 cursor-pointer',
          isRandom && 'text-accent'
        )}
        onClick={onToggleShuffle}
      >
        <FontAwesomeIcon
          icon={faShuffle}
          size={largeIcons ? 'lg' : undefined}
        />
      </button>

      <button
        title='Previous Track'
        aria-label='Previous Track'
        className='text-accent/40 hover:text-accent p-2 text-xl transition duration-300 cursor-pointer'
        onClick={onPrevious}
      >
        <FontAwesomeIcon
          icon={faBackwardStep}
          size={largeIcons ? 'lg' : undefined}
        />
      </button>

      <button
        title={isPlaying ? 'Pause' : 'Play'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className='bg-accent/80 text-secondary hover:bg-accent flex h-14 w-14 items-center justify-center rounded-full p-2 text-lg transition duration-300 hover:scale-105 md:h-9 md:w-9 cursor-pointer'
        onClick={onPlayPause}
      >
        <FontAwesomeIcon
          icon={isPlaying ? faPause : faPlay}
          size={largeIcons ? 'lg' : undefined}
        />
      </button>

      <button
        title='Next Track'
        aria-label='Next Track'
        className='text-accent/40 hover:text-accent p-2 text-xl transition duration-300 cursor-pointer'
        onClick={onNext}
      >
        <FontAwesomeIcon
          icon={faForwardStep}
          size={largeIcons ? 'lg' : undefined}
        />
      </button>

      <button
        title={
          isRepeat
            ? 'Disable Repeat Current Song'
            : 'Enable Repeat Current Song'
        }
        aria-label={
          isRepeat
            ? 'Disable Repeat Current Song'
            : 'Enable Repeat Current Song'
        }
        className={cn(
          'text-accent/40 hover:text-accent p-2 text-xl transition duration-300 cursor-pointer',
          isRepeat && 'text-accent'
        )}
        onClick={onToggleRepeat}
      >
        <FontAwesomeIcon icon={faRepeat} size={largeIcons ? 'lg' : undefined} />
      </button>
    </div>
  );
};
