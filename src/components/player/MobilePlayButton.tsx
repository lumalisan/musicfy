import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type MobilePlayButtonProps = {
  isPlaying: boolean;
  onClick: () => void;
};

export const MobilePlayButton = ({
  isPlaying,
  onClick,
}: MobilePlayButtonProps) => {
  return (
    <button
      className='text-accent flex h-10 w-10 items-center justify-center text-2xl'
      onClick={onClick}
    >
      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
    </button>
  );
};
