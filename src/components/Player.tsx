import { useEffect, useRef } from 'react';

import {
  faBackwardStep,
  faForwardStep,
  faRepeat,
  faShuffle,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils/cn';

import CurrentSong from './CurrentSong';
import VolumeController from './VolumeController';
import AudioController from './AudioController';

const Player = () => {
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
  const isFirstRender = useRef(true);

  // Control play/pause based on isPlaying state changes
  useEffect(() => {
    isPlaying ? audioRef.current?.play() : audioRef.current?.pause();
  }, [isPlaying]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play the new song when the currentMusic changes
  useEffect(() => {
    const { song, playlist } = currentMusic;

    if (song && audioRef.current) {
      const src = `/music/${playlist?.id}/${song.id}.mp3`;
      audioRef.current.src = src;
      audioRef.current.volume = volume;

      // Auto-play if the song change is triggered after the initial render
      if (!isFirstRender.current) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        // Prevent auto-play on page load
        isFirstRender.current = false;
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentMusic.song, currentMusic.playlist, setIsPlaying]);

  // Handle song ended event
  useEffect(() => {
    const { song, songsQueue } = currentMusic;

    // When the song ends, move on to the next one or pause if it is the last song
    const handleSongEnded = () => {
      if (song) {
        if (isRepeat) {
          setCurrentMusic({
            ...currentMusic,
            song: songsQueue[songsQueue.indexOf(song)],
          });
        } else {
          if (
            songsQueue.length &&
            song.id !== songsQueue[songsQueue.length - 1].id
          ) {
            setCurrentMusic({
              ...currentMusic,
              song: songsQueue[songsQueue.indexOf(song) + 1],
            });
          } else {
            setIsPlaying(false);
          }
        }
      }
    };

    audioRef.current?.addEventListener('ended', handleSongEnded);
    return () => {
      audioRef.current?.removeEventListener('ended', handleSongEnded);
    };
  }, [currentMusic, setCurrentMusic, setIsPlaying, isRepeat]);

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleBackwardClick = () => {
    const { song, songsQueue } = currentMusic;
    if (song && songsQueue.length && song.id !== songsQueue[0].id) {
      setCurrentMusic({
        ...currentMusic,
        song: songsQueue[songsQueue.indexOf(song) - 1],
      });
    }
  };

  const handleForwardClick = () => {
    const { song, songsQueue } = currentMusic;
    if (
      song &&
      songsQueue.length &&
      song.id !== songsQueue[songsQueue.length - 1].id
    ) {
      setCurrentMusic({
        ...currentMusic,
        song: songsQueue[songsQueue.indexOf(song) + 1],
      });
    }
  };

  const handleShuffleClick = () => {
    setIsRandom(!isRandom);
  };

  const handleRepeatClick = () => {
    setIsRepeat(!isRepeat);
  };

  return (
    <div className='z-50 flex w-full flex-row justify-between px-4 pt-2'>
      <div className='flex flex-1 basis-0 justify-start'>
        <CurrentSong
          image={currentMusic.song?.image}
          title={currentMusic.song?.title}
          artists={currentMusic.song?.artists}
        />
      </div>

      <div className='grid flex-1 place-content-center'>
        <div className='flex flex-col items-center justify-center gap-1'>
          <div className='flex items-center justify-center gap-4'>
            {/* Random song button */}
            <button
              className={cn(
                'text-accent/40 hover:text-accent p-2 text-xl transition duration-300',
                isRandom && 'text-accent'
              )}
              onClick={handleShuffleClick}
              type='button'
            >
              <div className='relative'>
                <FontAwesomeIcon icon={faShuffle} />
                {isRandom && (
                  <span className='bg-accent absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full'></span>
                )}
              </div>
            </button>

            {/* Backward button */}
            <button
              className='text-accent/40 hover:text-accent p-2 text-xl transition duration-300'
              onClick={handleBackwardClick}
              type='button'
            >
              <FontAwesomeIcon icon={faBackwardStep} />
            </button>

            {/* Play/Pause button */}
            <button
              className='bg-accent/80 text-secondary hover:bg-accent flex h-9 w-9 items-center justify-center rounded-full p-2 text-lg transition duration-300 hover:scale-105'
              onClick={handlePlayClick}
              type='button'
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>

            {/* Forward button */}
            <button
              className='text-accent/40 hover:text-accent p-2 text-xl transition duration-300'
              onClick={handleForwardClick}
              type='button'
            >
              <FontAwesomeIcon icon={faForwardStep} />
            </button>

            {/* Repeat button */}
            <button
              className={cn(
                'text-accent/40 hover:text-accent p-2 text-xl transition duration-300',
                isRepeat && 'text-accent'
              )}
              onClick={handleRepeatClick}
              type='button'
            >
              <div className='relative'>
                <FontAwesomeIcon icon={faRepeat} />
                {isRepeat && (
                  <span className='bg-accent absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full'></span>
                )}
              </div>
            </button>
          </div>

          {/* Time slider */}
          <AudioController audioRef={audioRef} />
        </div>
      </div>

      <div className='flex flex-1 basis-0 justify-end'>
        <VolumeController />
      </div>

      <audio ref={audioRef} />
    </div>
  );
};

export default Player;
