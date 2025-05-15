import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

import type { CurrentMusic } from '@/lib/types/CurrentMusic';
import { cn } from '@/lib/utils/cn';

import { PlaybackControls } from './PlaybackControls';
import AudioController from './AudioController';

interface MobileExpandedPlayerProps {
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
            className={cn('fixed inset-0 flex flex-col p-4 pt-6 z-50 antialiased bg-secondary',
                animationClassName)}
        >
            {/* Header with minimize and more options */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onClose}
                    className="p-2  transition-colors"
                    aria-label="Minimize player"
                >
                    <FontAwesomeIcon icon={faChevronDown} size='xl' />
                </button>
                <div className="text-xs font-semibold uppercase tracking-wider ">
                    {song.album || 'Now Playing'}
                </div>
                <button className="p-2  transition-colors" aria-label="More options">
                    <FontAwesomeIcon icon={faEllipsisH} size='xl' />
                </button>
            </div>

            {/* Album cover */}
            <div className="flex-grow flex items-center justify-center px-2 mb-6">
                <img
                    src={song.image || '/placeholder-album-art.png'}
                    alt={`Cover for ${song.title}`}
                    className="w-full max-w-md aspect-square rounded-lg shadow-2xl object-cover"
                />
            </div>

            {/* Song info */}
            <div className="text-left mb-5 px-2">
                <h2 className="text-2xl sm:text-3xl font-bold truncate">{song.title || 'Unknown Title'}</h2>
                <p className="text-base sm:text-lg truncate text-accent/80">
                    {song.artists?.join(', ') || 'Unknown Artist'}
                </p>
            </div>

            {/* Audio progress bar */}
            <div className="mb-5 px-2">
                <AudioController audioRef={audioRef} />
            </div>

            {/* Playback controls */}
            <div className="mb-10 px-2">
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
            <div
                className='absolute inset-0 bg-gradient-to-t from-secondary via-secondary/90 to-transparent -z-[1]'
            >
            </div>
        </div>
    );
};

export default MobileExpandedPlayer;