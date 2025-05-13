import { useEffect, useRef, useCallback } from 'react';

import { usePlayerStore } from '@/store/playerStore';

import CurrentSong from './CurrentSong';
import VolumeController from './VolumeController';
import AudioController from './AudioController';
import { DefaultAudioService } from '@/lib/services/DefaultAudioService';
import { PlaybackControls } from './PlaybackControls';
import { MobilePlayButton } from './MobilePlayButton';

const Player = () => {
  const audioService = new DefaultAudioService();
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

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentLoadedSongIdRef = useRef<string | null>(null);

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

  if (!currentMusic.song || !currentMusic.itemInfo) {
    return null;
  }

  return (
    <div className='md:bg-secondary md:backdrop-blur-none flex h-auto w-auto flex-row justify-between rounded-t-lg bg-amber-900/80 backdrop-blur-sm p-2 md:h-[80px] md:w-full md:px-4 md:pt-2'>
      <div className='flex min-w-0 flex-1 basis-0 justify-start'>
        <CurrentSong
          image={currentMusic.song?.image ?? undefined}
          title={currentMusic.song?.title}
          artists={currentMusic.song?.artists}
        />
      </div>

      <div className='flex items-center justify-end md:hidden'>
        <MobilePlayButton
          isPlaying={isPlaying}
          onClick={() => setIsPlaying(!isPlaying)}
        />
      </div>

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

      <div className='hidden flex-1 basis-0 justify-end md:flex'>
        <VolumeController />
      </div>

      <audio ref={audioRef} />
    </div>
  );
};

export default Player;
