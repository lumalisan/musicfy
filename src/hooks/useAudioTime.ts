import { useEffect, useState } from 'react';

export const useAudioTime = (
  audioRef: React.RefObject<HTMLAudioElement | null>
) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audioRefCurrent = audioRef.current;
    if (!audioRefCurrent) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioRefCurrent.currentTime);
    };

    audioRefCurrent.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audioRefCurrent.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioRef]);

  const audioDuration = audioRef.current?.duration ?? 0;

  return {
    currentTime,
    audioDuration,
  };
};
