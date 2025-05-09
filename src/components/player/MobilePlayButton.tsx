import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { PlayerControlService } from '@/lib/types/PlayerControlService';

export interface MobilePlayButtonProps {
  isPlaying: boolean;
  playerControlService: PlayerControlService;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const MobilePlayButton = ({
  playerControlService,
  isPlaying,
  setIsPlaying,
}: MobilePlayButtonProps) => {
  return (
    <button
      className='text-accent flex h-10 w-10 items-center justify-center text-2xl'
      onClick={() => playerControlService.handlePlayPause(isPlaying, setIsPlaying)
      }
    >
      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
    </button>
  );
};
