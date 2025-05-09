import { useEffect, useRef, useCallback } from 'react';

import { usePlayerStore } from '@/store/playerStore';
import { generateRandomSongsQueue } from '@/lib/utils/generateRandomSongsQueue';
import type { Song } from '@/lib/types/Song';

import CurrentSong from './CurrentSong';
import VolumeController from './VolumeController';
import AudioController from './AudioController';
import { DefaultAudioService } from '@/lib/services/DefaultAudioService';
import { DefaultPlayerControlService } from '@/lib/services/DefaultPlayerControlService';
import { PlaybackControls } from './PlaybackControls';
import { MobilePlayButton } from './MobilePlayButton';

const Player = () => {
  const audioService = new DefaultAudioService();
  const playerControlService = new DefaultPlayerControlService();

  const {
    isPlaying,
    currentMusic,
    setCurrentMusic,
    setIsPlaying,
    volume,
    isRandom,
    isRepeat,
    setIsRandom,
    setIsRepeat,
  } = usePlayerStore((state) => state);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSongRef = useRef<Song | null>(null);

  // EFFECT OF REPRODUCTION AND CHARGING
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newSong = currentMusic.song;

    if (newSong && newSong.id) {
      const newSrc = `/music/${currentMusic.playlist?.id}/${newSong.id}.mp3`;

      if (audio.src !== newSrc || currentSongRef.current?.id !== newSong.id) {
        audioService.setSrc(audio, newSrc);
        audioService.load(audio);
        audioService.setVolume(audio, volume);
        currentSongRef.current = newSong;
      }

      if (isPlaying) {
        audioService.play(audio).catch((error) => {
          console.warn('Autoplay prevented or error when playing.', error);
          setIsPlaying(false);
        });
      } else {
        audioService.pause(audio);
      }
    } else {
      audioService.pause(audio);
      currentSongRef.current = null;
    }
  }, [
    currentMusic.song,
    currentMusic.playlist?.id,
    isPlaying,
    volume,
    setIsPlaying,
  ]);

  // EFFECT FOR VOLUME CHANGES
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.volume !== volume) {
      audioService.setVolume(audio, volume);
    }
  }, [volume]);

  // EFFECT FOR RANDOM ORDER
  useEffect(() => {
    if (
      !currentMusic.song ||
      !currentMusic.songsQueue ||
      currentMusic.songsQueue.length === 0
    ) {
      return;
    }

    let newSongsQueue: Song[];
    if (isRandom) {
      newSongsQueue = generateRandomSongsQueue(
        [...currentMusic.songsQueue],
        currentMusic.song
      );
    } else {
      const originalQueue = currentMusic.songsQueue || [
        ...currentMusic.songsQueue,
      ];
      newSongsQueue = [...originalQueue].sort((a, b) => a.id - b.id);
    }

    if (
      JSON.stringify(currentMusic.songsQueue) !== JSON.stringify(newSongsQueue)
    ) {
      setCurrentMusic({
        ...currentMusic,
        songsQueue: newSongsQueue,
      });
    }
  }, [isRandom, currentMusic.playlist, setCurrentMusic]);

  const handleSongEnded = useCallback(() => {
    const { song, songsQueue } = currentMusic;

    if (!song || !songsQueue || songsQueue.length === 0) {
      setIsPlaying(false);
      return;
    }

    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (isPlaying) {
          audioService.play(audioRef.current).catch(() => setIsPlaying(false));
        }
      }
    } else {
      const currentIndex = songsQueue.findIndex((s) => s.id === song.id);
      if (currentIndex !== -1 && currentIndex < songsQueue.length - 1) {
        const nextSong = songsQueue[currentIndex + 1];
        setCurrentMusic({
          ...currentMusic,
          song: nextSong,
        });
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentMusic, isPlaying, isRepeat, setCurrentMusic, setIsPlaying]);

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

  if (!currentMusic.song) {
    return null;
  }

  return (
    <div className='md:bg-secondary flex h-auto w-auto flex-row justify-between rounded-t-lg bg-amber-900 p-2 md:h-[80px] md:w-full md:px-4 md:pt-2'>
      <div className='flex flex-1 basis-0 justify-start'>
        <CurrentSong
          image={currentMusic.song?.image}
          title={currentMusic.song?.title}
          artists={currentMusic.song?.artists}
        />
      </div>

      <div className='flex items-center justify-end md:hidden'>
        <MobilePlayButton
          isPlaying={isPlaying}
          playerControlService={playerControlService}
          setIsPlaying={setIsPlaying}
        />
      </div>

      <div className='hidden flex-1 place-content-center md:grid'>
        <div className='flex flex-col items-center justify-center gap-1'>
          <PlaybackControls
            isPlaying={isPlaying}
            isRandom={isRandom}
            isRepeat={isRepeat}
            currentMusic={currentMusic}
            playerControlService={playerControlService}
            setIsPlaying={setIsPlaying}
            setCurrentMusic={setCurrentMusic}
            setIsRandom={setIsRandom}
            setIsRepeat={setIsRepeat}
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
