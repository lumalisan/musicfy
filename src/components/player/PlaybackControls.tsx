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
import type { CurrentMusic } from '@/lib/types/CurrentMusic';
import type { PlayerControlService } from '@/lib/types/PlayerControlService';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  isRandom: boolean;
  isRepeat: boolean;
  currentMusic: CurrentMusic;
  playerControlService: PlayerControlService;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMusic: (currentMusic: CurrentMusic) => void;
  setIsRandom: (isRandom: boolean) => void;
  setIsRepeat: (isRepeat: boolean) => void;
}

export const PlaybackControls = ({
  isPlaying,
  isRandom,
  isRepeat,
  playerControlService,
  setIsPlaying,
  setIsRandom,
  setIsRepeat,
  currentMusic,
  setCurrentMusic,
}: PlaybackControlsProps) => {
  return (
    <div className='flex items-center justify-center gap-4'>
      <button
        className={cn(
          'text-accent/40 hover:text-accent p-2 text-xl transition duration-300',
          isRandom && 'text-accent'
        )}
        onClick={() =>
          playerControlService.handleShuffle(isRandom, setIsRandom)
        }
      >
        <FontAwesomeIcon icon={faShuffle} />
      </button>

      <button
        className='text-accent/40 hover:text-accent p-2 text-xl transition duration-300'
        onClick={() =>
          playerControlService.handlePrevious(currentMusic, setCurrentMusic)
        }
      >
        <FontAwesomeIcon icon={faBackwardStep} />
      </button>

      <button
        className='bg-accent/80 text-secondary hover:bg-accent flex h-9 w-9 items-center justify-center rounded-full p-2 text-lg transition duration-300 hover:scale-105'
        onClick={() => {
          const newPlayingState =
            playerControlService.handlePlayPause(isPlaying);
          setIsPlaying(newPlayingState);
        }}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>

      <button
        className='text-accent/40 hover:text-accent p-2 text-xl transition duration-300'
        onClick={() =>
          playerControlService.handleNext(currentMusic, setCurrentMusic)
        }
      >
        <FontAwesomeIcon icon={faForwardStep} />
      </button>

      <button
        className={cn(
          'text-accent/40 hover:text-accent p-2 text-xl transition duration-300',
          isRepeat && 'text-accent'
        )}
        onClick={() => playerControlService.handleRepeat(isRepeat, setIsRepeat)}
      >
        <FontAwesomeIcon icon={faRepeat} />
      </button>
    </div>
  );
};
