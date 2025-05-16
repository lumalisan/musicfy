import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

import { DefaultAudioService } from '@/lib/services/DefaultAudioService';
import { usePlayerStore } from '@/store/playerStore';
import { useWindowSize } from '@/hooks/useWindowSize';

import CurrentSong from './CurrentSong';
import VolumeController from './VolumeController';
import AudioController from './AudioController';
import { PlaybackControls } from './PlaybackControls';
import { MobilePlayButton } from './MobilePlayButton';
import MobileExpandedPlayer from './MobileExpandedPlayer';

const ANIMATION_DURATION_MS = 300;
const PLAYER_ENTER_ANIMATION = 'animate-slideEnterUp';
const PLAYER_EXIT_ANIMATION = 'animate-slideLeaveDown';

const Player = () => {
  // STATES
  const [isExpandedIntent, setIsExpandedIntent] = useState<boolean>(false);
  const [isPlayerMounted, setIsPlayerMounted] = useState<boolean>(false);
  const [currentPlayerAnimation, setCurrentPlayerAnimation] =
    useState<string>('');

  // REFS
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentLoadedSongIdRef = useRef<string | null>(null);

  // SERVICES
  const audioService = useMemo(() => new DefaultAudioService(), []);

  // PLAYER STORE
  const {
    isPlaying,
    currentMusic,
    setIsPlaying,
    volume,
    isRandom,
    isRepeat,
    playNext,
    playPrevious,
    toggleRepeat,
    setIsRandom,
  } = usePlayerStore((state) => state);

  const windowSize = useWindowSize();

  // Check if the current view is mobile
  const isMobileView: boolean = useMemo(() => {
    return windowSize.width !== undefined && windowSize.width < 768;
  }, [windowSize.width]);

  // EFFECT OF REPRODUCTION AND CHARGING
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newSong = currentMusic.song;
    const currentItemInfo = currentMusic.itemInfo;

    if (
      newSong &&
      newSong.id &&
      newSong.url &&
      currentItemInfo &&
      currentItemInfo.id
    ) {
      const newSrc = newSong.url;

      if (
        audio.src !== newSrc ||
        currentLoadedSongIdRef.current !== newSong.id
      ) {
        audioService.setSrc(audio, newSrc);
        audioService.load(audio);
        currentLoadedSongIdRef.current = newSong.id;
      }

      if (audio.volume !== volume) {
        audioService.setVolume(audio, volume);
      }

      if (isPlaying) {
        audioService.play(audio).catch((error) => {
          console.warn(
            'Autoplay prevented or error when playing song:',
            newSong.title,
            error
          );
        });
      } else {
        audioService.pause(audio);
      }
    } else {
      audioService.pause(audio);
      audio.src = '';
      currentLoadedSongIdRef.current = null;
    }
  }, [currentMusic.song, currentMusic.itemInfo?.id, isPlaying, volume]);

  // EFFECT FOR VOLUME CHANGES
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.volume !== volume && currentMusic.song) {
      audioService.setVolume(audio, volume);
    }
  }, [volume, currentMusic.song]);

  const handleSongEnded = useCallback(() => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioService.play(audioRef.current).catch(() => {
          console.warn("Could not replay 'one' song automatically.");
          setIsPlaying(false);
        });
      }
    } else {
      playNext();
    }
  }, [isRepeat, playNext, setIsPlaying, audioService]);

  // EFFECT TO HANDLE END OF SONG
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleSongEnded);
      return () => {
        audio.removeEventListener('ended', handleSongEnded);
      };
    }
  }, [handleSongEnded]);

  // EFFECT TO PREVENT BODY SCROLL WHEN PLAYER IS EXPANDED ON MOBILE
  useEffect(() => {
    if (isExpandedIntent && isMobileView) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isExpandedIntent, isMobileView]);

  // EFFECT TO HANDLE PLAYER MOUNTING AND ANIMATION
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isExpandedIntent) {
      setIsPlayerMounted(true);
      setCurrentPlayerAnimation(PLAYER_ENTER_ANIMATION);
    } else {
      if (isPlayerMounted) {
        setCurrentPlayerAnimation(PLAYER_EXIT_ANIMATION);
        timer = setTimeout(() => {
          setIsPlayerMounted(false);
        }, ANIMATION_DURATION_MS);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isExpandedIntent, isPlayerMounted]);

  const handlePlayerBarClick = (
    event?: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (
      event &&
      (event.target as HTMLElement).closest('button, a, input[type="range"]')
    ) {
      return;
    }
    if (isMobileView) {
      setIsExpandedIntent((prev) => !prev);
    }
  };

  const handleCloseExpandedPlayer = (
    event?: React.MouseEvent<HTMLButtonElement>
  ): void => {
    if (event) event.stopPropagation();
    if (isMobileView) {
      setIsExpandedIntent(false);
    }
  };

  if (!currentMusic.song || !currentMusic.itemInfo) {
    return null;
  }

  return (
    <>
      {/* Mobile full player */}
      {isPlayerMounted && isMobileView ? (
        <MobileExpandedPlayer
          currentMusic={currentMusic}
          isPlaying={isPlaying}
          isRandom={isRandom}
          isRepeat={isRepeat}
          audioRef={audioRef}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={playNext}
          onPrevious={playPrevious}
          onToggleShuffle={() => setIsRandom(!isRandom)}
          onToggleRepeat={toggleRepeat}
          onClose={handleCloseExpandedPlayer}
          animationClassName={currentPlayerAnimation}
        />
      ) : null}

      {/* Desktop player & mobile small player */}
      <div
        className={
          'md:bg-secondary flex h-auto flex-row items-center justify-between rounded-t-lg bg-amber-900/80 p-2 backdrop-blur-sm transition-colors duration-300 md:h-[80px] md:w-full md:px-4 md:py-2 md:backdrop-blur-none'
        }
        onClick={handlePlayerBarClick}
        role={isMobileView ? 'button' : undefined}
        tabIndex={isMobileView ? 0 : undefined}
        aria-expanded={isMobileView ? isExpandedIntent : undefined}
        aria-label={
          isMobileView ? 'Music player, click to expand' : 'Music player'
        }
      >
        {/* Current song info */}
        <div className='flex min-w-0 flex-1 basis-0 justify-start'>
          <CurrentSong
            image={currentMusic.song?.image ?? undefined}
            title={currentMusic.song?.title}
            artists={currentMusic.song?.artists}
          />
        </div>

        {/* Mobile play button */}
        <div className='flex items-center justify-end md:hidden'>
          <MobilePlayButton
            isPlaying={isPlaying}
            onClick={() => setIsPlaying(!isPlaying)}
          />
        </div>

        {/* Desktop player controls */}
        <div className='hidden flex-1 place-content-center md:grid'>
          <div className='flex flex-col items-center justify-center gap-1'>
            <PlaybackControls
              isPlaying={isPlaying}
              isRandom={isRandom}
              isRepeat={isRepeat}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onNext={playNext}
              onPrevious={playPrevious}
              onToggleShuffle={() => setIsRandom(!isRandom)}
              onToggleRepeat={() => toggleRepeat()}
            />
            <AudioController audioRef={audioRef} />
          </div>
        </div>

        {/* Desktop volume controls */}
        <div className='hidden flex-1 basis-0 justify-end md:flex'>
          <VolumeController />
        </div>

        <audio ref={audioRef} />
      </div>
    </>
  );
};

export default Player;
