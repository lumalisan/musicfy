import { useEffect, useState } from 'react';

export const useAudioTime = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const handleTimeUpdate = () => {
      audioRef.current && setCurrentTime(audioRef.current.currentTime);
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
