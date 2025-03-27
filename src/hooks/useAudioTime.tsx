import { usePlayerStore } from '@/store/playerStore';
import { useEffect, useRef, useState } from 'react';

export const useAudioTime = (
  audioRef: React.RefObject<HTMLAudioElement | null>
) => {
  const [currentTime, setCurrentTime] = useState(0);
  const { progress, setProgress } = usePlayerStore((state) => state);
  const isFirstRender = useRef(true);

  // Set audio currentTime from persisted progress on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = progress;
      setCurrentTime(progress);
    }
  }, []);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current && !isFirstRender.current) {
        setCurrentTime(audioRef.current.currentTime);
        setProgress(audioRef.current.currentTime);
      } else {
        // Prevent auto-play on page load
        isFirstRender.current = false;
      }
    };

    audioRef.current?.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const audioDuration = audioRef.current?.duration ?? 0;

  return {
    currentTime,
    audioDuration,
  };
};
