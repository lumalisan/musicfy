import { useEffect, useRef } from 'react';

import { usePlayerStore } from '@/store/playerStore';
import { generateRandomSongsQueue } from '@/lib/utils/generateRandomSongsQueue';

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
  const isFirstRender = useRef(true);

  // Control play/pause based on isPlaying state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    isPlaying ? audioService.play(audio) : audioService.pause(audio);
  }, [isPlaying]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioService.setVolume(audioRef.current, volume);
    }
  }, [volume]);

  // Set a random songs order if isRandom is true
  // Otherwise, set songsQueue to the original songs order
  useEffect(() => {
    if (isRandom && currentMusic.song) {
      const randomSongs = generateRandomSongsQueue(
        currentMusic.songsQueue,
        currentMusic.song
      );
      setCurrentMusic({
        ...currentMusic,
        songsQueue: randomSongs,
      });
    } else {
      setCurrentMusic({
        ...currentMusic,
        songsQueue: currentMusic.songsQueue.sort((a, b) => a.id - b.id),
      });
    }
  }, [isRandom]);

  // Play the new song when the currentMusic changes
  useEffect(() => {
    const { song, playlist } = currentMusic;
    const audio = audioRef.current;

    if (song && audio) {
      const src = `/music/${playlist?.id}/${song.id}.mp3`;
      audioService.setSrc(audio, src);
      audioService.setVolume(audio, volume);

      // Auto-play if the song change is triggered after the initial render
      if (!isFirstRender.current) {
        audioService.play(audio);
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

  return (
    <div className='md:bg-secondary mx-2 flex h-auto w-auto flex-row justify-between rounded-lg bg-amber-900 p-2 md:mx-0 md:h-[80px] md:w-full md:px-4 md:pt-2'>
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
