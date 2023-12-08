import { useEffect, useRef } from 'react';
import {
  faBackwardStep,
  faForwardStep,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePlayerStore } from '@/store/playerStore';
import CurrentSong from './CurrentSong';
import VolumeController from './VolumeController';
import AudioController from './AudioController';

const Player = () => {
  const { isPlaying, currentMusic, setCurrentMusic, setIsPlaying, volume } =
    usePlayerStore((state) => state);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    isPlaying ? audioRef.current?.play() : audioRef.current?.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const { song, songs, playlist } = currentMusic;

    // When the song changes, use this one and play
    if (song && audioRef.current) {
      const src = `/music/${playlist?.id}/${song.id}.mp3`;
      audioRef.current.src = src;
      audioRef.current.volume = volume;
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }

    // When the song ends, move on to the next one,
    // if is the last one, just pause player
    const handleSongEnded = () => {
      if (song?.id !== songs[songs.length - 1].id) {
        setCurrentMusic({
          ...currentMusic,
          song: songs[songs.indexOf(song!) + 1],
        });
      } else {
        setIsPlaying(false);
      }
    };

    audioRef.current?.addEventListener('ended', handleSongEnded);
    return () => {
      audioRef.current?.removeEventListener('ended', handleSongEnded);
    };
  }, [currentMusic]);

  const handleClick = () => {
    setIsPlaying(!isPlaying);
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
        <div className='flex flex-col items-center justify-center gap-2'>
          <div className='flex items-center justify-center gap-6'>
            {/* Backward button */}
            <button className='text-xl'>
              <FontAwesomeIcon icon={faBackwardStep} />
            </button>

            {/* Play button */}
            <button
              className='flex h-9 w-9 items-center justify-center rounded-full bg-accent/80 p-2 text-lg text-secondary transition duration-300 hover:bg-accent'
              onClick={handleClick}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>

            {/* Forward button */}
            <button className='text-xl'>
              <FontAwesomeIcon icon={faForwardStep} />
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
